import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNexusControlOptional } from "../../context/NexusControlContext";
import { useNexus } from "../../context/NexusContext";
import { useI18n, type Locale } from "../../i18n";
import { buildLocalizedPrompt, detectMessageLocale, resolveReplyLocale } from "../../lib/localeSpeech";
import type { RobotAnim } from "./CompanionRobot3D";
import { launchVoiceDemo } from "../command/CommandDemoBoot";
import { resolveVoiceText } from "./voiceIntent";
import { looksLikeWakeResidue } from "./wakeWord";

const API = import.meta.env.VITE_API_URL ?? "";
const AI_TIMEOUT_MS = 30_000;

export interface RobotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
}

type RouteTarget = "/" | "/command" | "/intel" | "/profile" | "/contact" | "/auth" | "/admin";

interface NexusActions {
  state: ReturnType<typeof useNexus>["state"];
  reset: () => Promise<boolean>;
  toggleRecovery: (enabled: boolean) => Promise<boolean>;
}

interface NavPage {
  path: RouteTarget;
  labelKey: string;
  aliases: string[];
}

const NAV_PAGES: NavPage[] = [
  {
    path: "/",
    labelKey: "nav_home",
    aliases: ["home", "landing", "main page", "صفحه اصلی", "خانه", "خونه"],
  },
  {
    path: "/command",
    labelKey: "nav_command",
    aliases: [
      "command",
      "comand",
      "commmand",
      "comment",
      "cmd",
      "dashboard",
      "control center",
      "command center",
      "command page",
      "فرماندهی",
      "فرمان",
      "کامند",
      "کماند",
      "کنترل",
      "داشبورد",
      "صفحه فرمان",
      "صفحه کامند",
      "صفحه کماند",
    ],
  },
  {
    path: "/intel",
    labelKey: "nav_intel",
    aliases: ["intel", "analysis", "اطلاعات", "تحلیل", "صفحه اطلاعات"],
  },
  {
    path: "/profile",
    labelKey: "nav_profile",
    aliases: ["profile", "account", "vip", "پروفایل", "حساب کاربری"],
  },
  {
    path: "/contact",
    labelKey: "nav_contact",
    aliases: ["contact", "support", "تماس", "پشتیبانی"],
  },
  {
    path: "/admin",
    labelKey: "nav_admin_panel",
    aliases: ["admin", "ادمین", "پنل ادمین"],
  },
  {
    path: "/auth",
    labelKey: "nav_access",
    aliases: ["auth", "login", "register", "sign in", "ورود", "ثبت نام", "لاگین"],
  },
];

const NAV_VERB =
  /(go|open|enter|navigate|show|take\s*me|switch|to\s+|two\s+|into|برو|بریم|ببر|ببرمت|باز\s*کن|وارد\s*شو|صفحه|تو\s*صفحه|تو\s+)/i;

const COMMAND_SOUND = /^(come|coming|comment|common|comand|command|cmd|کامند|کماند)$/i;

function foldNav(text: string): string {
  return text
    .toLowerCase()
    .replace(/[؟!.,!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = cur;
    }
  }
  return row[b.length];
}

function aliasHits(q: string, alias: string): boolean {
  const a = foldNav(alias);
  if (!a) return false;
  if (a.includes(" ")) return q.includes(a);
  const escaped = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(q);
}

function matchNavPage(raw: string): NavPage | null {
  const q = foldNav(raw);
  if (!q) return null;

  const commandPage = NAV_PAGES.find((p) => p.path === "/command");
  const tokens = q
    .replace(/(go to|navigate to|take me to|open|enter|show|to|two|too|into|برو تو|برو به|بریم|ببر|صفحه|page|the)/g, " ")
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);

  if (commandPage && (NAV_VERB.test(q) || q.length < 28) && tokens.some((t) => COMMAND_SOUND.test(t))) {
    return commandPage;
  }

  for (const page of NAV_PAGES) {
    if (page.aliases.some((alias) => aliasHits(q, alias))) return page;
  }

  let best: { page: NavPage; dist: number } | null = null;
  for (const token of tokens) {
    for (const page of NAV_PAGES) {
      for (const alias of page.aliases) {
        if (alias.includes(" ")) continue;
        const maxLen = Math.max(token.length, alias.length);
        if (maxLen < 4 || Math.abs(token.length - alias.length) > 3) continue;
        const dist = editDistance(token, alias);
        if (dist === 0) return page;
        if (dist <= 2 && (!best || dist < best.dist)) best = { page, dist };
      }
    }
  }
  return best?.page ?? null;
}
const STATUS_CMD =
  /^(وضعیت(\s*شهر)?|سلامت(\s*شهر)?|آمار(\s*شهر)?|city\s*status|status|health|city\s*health)\s*[?!؟.]*$/i;

function pickLocale(text: string): Locale | null {
  if (/فارسی|persian|farsi|\bfa\b/i.test(text)) return "fa";
  if (/english|\ben\b|انگلیسی/i.test(text)) return "en";
  if (/arabic|\bar\b|عربی/i.test(text)) return "ar";
  if (/spanish|\bes\b|اسپانی/i.test(text)) return "es";
  if (/french|\bfr\b|فرانس/i.test(text)) return "fr";
  return null;
}

function tryLocalCommand(
  text: string,
  ctx: {
    t: (k: string) => string;
    navigate: (path: string) => void;
    setLocale: (l: Locale) => void;
    nexus: NexusActions;
    setGestureEnabled?: (enabled: boolean) => void;
    reopenOnboarding?: () => void;
  },
): string | null {
  const q = text.trim();

  // Only pure greetings — not "سلام، وضعیت آب و هوا چطوره؟"
  if (/^(سلام|hello|hi|hey|درود|salam)\s*[!!.؟?]*$/i.test(q)) {
    return ctx.t("robot_greeting");
  }

  if (/^(scroll\s*top|بالا\s*برو|برو\s*بالا|اسکرول\s*بالا)\s*[!!.؟?]*$/i.test(q)) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return ctx.t("robot_action_done");
  }

  if (/^(scroll\s*down|پایین|برو\s*پایین|اسکرول\s*پایین)\s*[!!.؟?]*$/i.test(q)) {
    window.scrollBy({ top: 420, behavior: "smooth" });
    return ctx.t("robot_action_scroll_down");
  }

  if (/^(scroll\s*up|اسکرول\s*بالا)\s*[!!.؟?]*$/i.test(q)) {
    window.scrollBy({ top: -420, behavior: "smooth" });
    return ctx.t("robot_action_scroll_up");
  }

  const typeMatch = q.match(/^(?:type|write|type in|تایپ\s*کن|بنویس)\s+(.+)$/is);
  if (typeMatch?.[1]) {
    const text = typeMatch[1].trim().replace(/^["'«「]|["'»」]$/g, "");
    window.dispatchEvent(new CustomEvent("nexus-voice-type", { detail: { text } }));
    return ctx.t("robot_action_type");
  }

  if (
    /^(open|show|launch|باز\s*کن|نمایش\s*بده).*(bot|assistant|robot|نکسوس|دستیار)/i.test(q) ||
    /^(نکسوس|دستیار)\s*(رو\s*)?(باز\s*کن|نشون\s*بده)?$/i.test(q)
  ) {
    window.dispatchEvent(new CustomEvent("nexus-robot-focus"));
    return ctx.t("robot_action_open_bot");
  }

  if (/(zoom\s*in|زوم\s*بیشتر|نزدیک(?:تر)?)/i.test(q) && q.length < 48) {
    window.dispatchEvent(new CustomEvent("nexus-map-gesture", { detail: { type: "zoom", delta: 0.8 } }));
    return ctx.t("robot_action_map_zoom_in");
  }

  if (/(zoom\s*out|زوم\s*کمتر|دور(?:تر)?)/i.test(q) && q.length < 48) {
    window.dispatchEvent(new CustomEvent("nexus-map-gesture", { detail: { type: "zoom", delta: -0.8 } }));
    return ctx.t("robot_action_map_zoom_out");
  }

  if (
    /^(start|run|play|launch|شروع|اجرا)(\s+(the|a|کن))?\s*(voice\s*)?(demo|دمو)/i.test(q) ||
    /(voice\s*demo|narrated?\s*demo|دمو\s*صوتی|دموی\s*صوتی)/i.test(q) ||
    /شروع\s*(کن\s*)?(دمو|demo)/i.test(q)
  ) {
    launchVoiceDemo(ctx.navigate);
    return ctx.t("robot_action_voice_demo");
  }

  if (
    (/(trigger|activate|start|ایجاد|بزن|فعال\s*کن).*(earthquake|زلزله|flood|سیل|disaster|بحران)/i.test(q) ||
      /(زلزله|earthquake).*(بزن|ایجاد|trigger)/i.test(q)) &&
    q.length < 120
  ) {
    window.dispatchEvent(
      new CustomEvent("nexus-voice-disaster", {
        detail: {
          type: /flood|سیل/i.test(q) ? "flood" : "earthquake",
          magnitude: /(\d(\.\d)?)/.test(q) ? Number(q.match(/(\d(\.\d)?)/)?.[1]) : 6,
        },
      }),
    );
    return ctx.t("robot_action_disaster_armed");
  }

  if (/(show|open|نمایش|باز\s*کن).*(timeline|تایم\s*لاین|cinema|سینما|debate|مناظره|scenario|سناریو|sos|war\s*room|اتاق\s*جنگ|tehran|تهران|butterfly|پروانه)/i.test(q)) {
    const tabMap: [RegExp, string][] = [
      [/timeline|تایم\s*لاین/i, "timeline"],
      [/debate|مناظره/i, "debate"],
      [/mayor|شهردار/i, "mayor"],
      [/scenario|سناریو/i, "scenarios"],
      [/sos/i, "sos"],
      [/cinema|سینما/i, "cinema"],
      [/butterfly|پروانه/i, "butterfly"],
      [/war\s*room|اتاق\s*جنگ/i, "warroom"],
      [/tehran|تهران/i, "tehran"],
    ];
    for (const [re, tab] of tabMap) {
      if (re.test(q)) {
        window.dispatchEvent(new CustomEvent("nexus-command-feature", { detail: { tab } }));
        return ctx.t("robot_action_feature_open").replace("{feature}", tab);
      }
    }
  }

  if (/(replay|بازپخش).*(start|شروع|play|پخش)/i.test(q) && q.length < 64) {
    window.dispatchEvent(new CustomEvent("nexus-command-feature", { detail: { tab: "cinema" } }));
    return ctx.t("robot_action_cinema");
  }

  if (/(dispatch|send|اعزام|بفرست).*(ambulance|آمبولانس|unit|یگان|sos)/i.test(q) && q.length < 80) {
    window.dispatchEvent(new CustomEvent("nexus-command-feature", { detail: { tab: "sos" } }));
    return ctx.t("robot_action_sos_panel");
  }

  if (/^(pan\s*left|چپ)/i.test(q) && q.length < 32) {
    window.dispatchEvent(new CustomEvent("nexus-map-gesture", { detail: { type: "pan", dx: -0.05, dy: 0 } }));
    return ctx.t("robot_action_done");
  }

  if (/^(pan\s*right|راست)/i.test(q) && q.length < 32) {
    window.dispatchEvent(new CustomEvent("nexus-map-gesture", { detail: { type: "pan", dx: 0.05, dy: 0 } }));
    return ctx.t("robot_action_done");
  }

  if (
    ctx.setGestureEnabled &&
    (/(hand\s*control|gesture|کنترل\s*دست).*(on|enable|start|روشن|فعال)/i.test(q) ||
      /(turn\s*on|enable|start|فعال\s*کن).*(hand|gesture|دست)/i.test(q))
  ) {
    ctx.setGestureEnabled(true);
    return ctx.t("robot_action_gesture_on");
  }

  if (
    ctx.setGestureEnabled &&
    (/(hand\s*control|gesture|کنترل\s*دست).*(off|disable|stop|خاموش|غیرفعال)/i.test(q) ||
      /(turn\s*off|disable|stop|خاموش\s*کن).*(hand|gesture|دست)/i.test(q))
  ) {
    ctx.setGestureEnabled(false);
    return ctx.t("robot_action_gesture_off");
  }

  if (
    ctx.reopenOnboarding &&
    /(help|guide|onboarding|tutorial|راهنما|آموزش|خوش\s*آمد)/i.test(q) &&
    q.length < 64
  ) {
    ctx.reopenOnboarding();
    return ctx.t("robot_action_help");
  }

  if (/^(send|submit|بفرست|ارسال)\s*[!!.؟?]*$/i.test(q)) {
    window.dispatchEvent(new CustomEvent("nexus-robot-submit"));
    return ctx.t("robot_action_done");
  }

  const lang = pickLocale(q);
  if (lang && /(language|lang|زبان)/i.test(q) && q.length < 48) {
    ctx.setLocale(lang);
    return ctx.t("robot_action_done");
  }

  if (/^(reset|restart|ریست|بازنشانی)(\s*(city|شهر|simulation|شبیه‌سازی))?(!|\.|؟|\?)?$/i.test(q)) {
    void ctx.nexus.reset();
    return ctx.t("robot_action_reset");
  }

  if (/(recovery|بازیابی).*(on|enable|start|روشن|فعال)/i.test(q) || /(turn\s*on|enable|start).*(recovery|بازیابی)/i.test(q)) {
    void ctx.nexus.toggleRecovery(true);
    return ctx.t("robot_action_recovery_on");
  }

  if (/(recovery|بازیابی).*(off|disable|stop|خاموش|غیرفعال)/i.test(q) || /(turn\s*off|disable|stop).*(recovery|بازیابی)/i.test(q)) {
    void ctx.nexus.toggleRecovery(false);
    return ctx.t("robot_action_recovery_off");
  }

  // Status queries — voice often adds extra words like «چطوره؟»
  if (
    (STATUS_CMD.test(q) ||
      /(وضعیت|سلامت|آمار).*شهر|شهر.*(وضعیت|سلامت|حال)|city\s*(status|health)|how\s*(is|'s)\s*the\s*city/i.test(q)) &&
    q.length < 96 &&
    ctx.nexus.state
  ) {
    const h = ctx.nexus.state.metrics?.city_health;
    const tick = ctx.nexus.state.tick;
    const disaster = ctx.nexus.state.active_disaster;
    return ctx
      .t("robot_status_template")
      .replace("{health}", h != null ? `${Math.round(h)}%` : "—")
      .replace("{tick}", String(tick ?? 0))
      .replace("{disaster}", disaster ? ctx.t("robot_yes") : ctx.t("robot_no"));
  }

  const nav = matchNavPage(q);
  if (nav && (NAV_VERB.test(q) || q.length < 48)) {
    ctx.navigate(nav.path);
    return ctx.t("robot_action_nav").replace("{page}", ctx.t(nav.labelKey));
  }

  return null;
}

export function useRobotAssistant(onSpeak?: (text: string, speakLocale?: string) => void) {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const nexus = useNexus();
  const nexusControl = useNexusControlOptional();
  const [messages, setMessages] = useState<RobotMessage[]>([]);
  const [anim, setAnim] = useState<RobotAnim>("idle");
  const [loading, setLoading] = useState(false);
  const greeted = useRef(false);

  const pushAssistant = useCallback((content: string, action?: string, speakLocale?: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}-${Math.random()}`, role: "assistant", content, action },
    ]);
    onSpeak?.(content, speakLocale);
  }, [onSpeak]);

  const ingestSilent = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}-${Math.random()}`, role: "assistant", content, action: "narrate" },
    ]);
  }, []);

  const ensureGreeting = useCallback(() => {
    if (greeted.current) return;
    greeted.current = true;
    pushAssistant(t("robot_activation"), undefined, locale);
  }, [pushAssistant, t]);

  const resetSession = useCallback(() => {
    greeted.current = false;
    setMessages([]);
  }, []);

  const askAi = useCallback(async (text: string, replyLocale?: Locale, fromVoice = false) => {
    const msgLocale = replyLocale ?? resolveReplyLocale(text, locale, fromVoice);
    const prompt = buildLocalizedPrompt(text, msgLocale);
    setLoading(true);
    setAnim("thinking");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
      const r = await fetch(`${API}/api/v1/ai/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          role: "copilot",
          message: prompt,
          locale: msgLocale,
          context: {
            locale: msgLocale,
            ...(nexus.state
              ? {
                  tick: nexus.state.tick,
                  city_health: nexus.state.metrics?.city_health,
                  active_disaster: nexus.state.active_disaster,
                  recovery_mode: nexus.state.recovery_mode,
                }
              : {}),
          },
        }),
      });

      if (!r.ok) {
        pushAssistant(t("copilot_error"), undefined, msgLocale);
        return;
      }

      const d = (await r.json()) as { response?: string; locale?: string };
      const response = d.response ?? t("copilot_unavailable");
      const speakLoc = detectMessageLocale(response, msgLocale);
      pushAssistant(response, undefined, speakLoc);
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      pushAssistant(timedOut ? t("copilot_error") : t("copilot_unavailable"), undefined, msgLocale);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
      setAnim("idle");
    }
  }, [locale, nexus.state, pushAssistant, t]);

  const sendVoice = useCallback(async (raw: string, alternatives: string[] = []) => {
    const text = resolveVoiceText(raw, alternatives);
    if (!text || looksLikeWakeResidue(text)) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
    ]);

    // Keep loading=true so wake-word mic stays paused until reply + TTS start
    setLoading(true);
    setAnim("thinking");

    const replyLocale = resolveReplyLocale(text, locale, true);
    const local = tryLocalCommand(text, {
      t,
      navigate,
      setLocale,
      nexus,
      setGestureEnabled: nexusControl?.setGestureEnabled,
      reopenOnboarding: nexusControl?.reopenOnboarding,
    });
    if (local) {
      setLoading(false);
      setAnim("idle");
      pushAssistant(local, "local", replyLocale);
      return;
    }

    await askAi(text, replyLocale, true);
  }, [askAi, locale, navigate, nexus, nexusControl, pushAssistant, setLocale, t]);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
    ]);

    setAnim("thinking");
    setLoading(true);

    const replyLocale = resolveReplyLocale(text, locale, false);
    const local = tryLocalCommand(text, {
      t,
      navigate,
      setLocale,
      nexus,
      setGestureEnabled: nexusControl?.setGestureEnabled,
      reopenOnboarding: nexusControl?.reopenOnboarding,
    });
    if (local) {
      setLoading(false);
      setAnim("idle");
      pushAssistant(local, "local", replyLocale);
      return;
    }

    await askAi(text, replyLocale, false);
  }, [askAi, loading, locale, navigate, nexus, nexusControl, pushAssistant, setLocale, t]);

  const setListening = useCallback((on: boolean) => {
    setAnim(on ? "listening" : loading ? "thinking" : "idle");
  }, [loading]);

  return {
    messages,
    anim,
    loading,
    send,
    sendVoice,
    ingestSilent,
    setListening,
    ensureGreeting,
    resetSession,
    clear: () => {
      setMessages([]);
      greeted.current = false;
    },
    setAnim,
  };
}
