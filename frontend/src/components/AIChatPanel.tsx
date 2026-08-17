import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon3D } from "@shared/icons";
import { useNexus } from "../context/NexusContext";
import { useI18n } from "../i18n";

const API = import.meta.env.VITE_API_URL ?? "";

function formatProvider(id: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    groq: "Groq AI",
    openai: "OpenAI",
    anthropic: "Anthropic",
    gemini: "Gemini",
    rule_engine: t("provider_local"),
  };
  return map[id] ?? id;
}

type Persona = "copilot" | "mayor" | "debate";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  persona?: Persona;
}

type Props = {
  layout?: "full" | "compact";
};

export function AIChatPanel({ layout = "full" }: Props) {
  const { t, locale } = useI18n();
  const { state } = useNexus();
  const [persona, setPersona] = useState<Persona>("copilot");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const personas: { id: Persona; label: string }[] = [
    { id: "copilot", label: t("copilot") },
    { id: "mayor", label: t("mayor") },
    { id: "debate", label: t("debate") },
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [persona]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      persona,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const endpoint = persona === "copilot" ? "copilot" : persona;
      const r = await fetch(`${API}/api/v1/ai/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: persona,
          message: text,
          locale,
          context: state
            ? {
                tick: state.tick,
                city_health: state.metrics?.city_health,
                active_disaster: state.active_disaster,
                recovery_mode: state.recovery_mode,
              }
            : undefined,
        }),
      });

      if (!r.ok) {
        setMessages((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, role: "assistant", content: t("copilot_error"), persona },
        ]);
        return;
      }

      const d = await r.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: d.response ?? t("copilot_unavailable"),
          provider: d.provider,
          persona,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "assistant", content: t("copilot_unavailable"), persona },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const personaLabel = personas.find((p) => p.id === persona)?.label ?? t("copilot");

  return (
    <div className={`ai-chat${layout === "full" ? " is-full" : ""}`}>
      <div className="ai-chat-toolbar">
        <div className="ai-chat-personas">
          {personas.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`ai-chat-persona${persona === p.id ? " active" : ""}`}
              onClick={() => setPersona(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {messages.length > 0 && (
          <button type="button" className="ai-chat-clear" onClick={() => setMessages([])}>
            {t("chat_new")}
          </button>
        )}
      </div>

      <div className="ai-chat-messages nx-scroll nx-scroll-glow" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="ai-chat-welcome">
            <div className="ai-chat-avatar ai">N</div>
            <h3>{t("ai_copilot")}</h3>
            <p>{t("chat_welcome")}</p>
            <div className="ai-chat-suggestions">
              {[t("chat_suggest_1"), t("chat_suggest_2"), t("chat_suggest_3")].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="ai-chat-suggest"
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`ai-chat-row${m.role === "user" ? " is-user" : " is-ai"}`}>
            <div className={`ai-chat-avatar${m.role === "user" ? " user" : " ai"}`}>
              {m.role === "user" ? t("chat_you").charAt(0) : "N"}
            </div>
            <div className="ai-chat-bubble">
              {m.role === "assistant" && (
                <span className="ai-chat-bubble-label">{personaLabel}</span>
              )}
              <p>{m.content}</p>
              {m.provider && (
                <span className="ai-chat-meta">{t("copilot_via")} {formatProvider(m.provider, t)}</span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-chat-row is-ai">
            <div className="ai-chat-avatar ai">N</div>
            <div className="ai-chat-bubble is-typing">
              <span className="ai-chat-bubble-label">{personaLabel}</span>
              <div className="ai-chat-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ai-chat-composer">
        <textarea
          ref={inputRef}
          className="ai-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("ask_placeholder")}
          rows={1}
          disabled={loading}
        />
        <button
          type="button"
          className="ai-chat-send"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          aria-label={t("chat_send")}
        >
          {loading ? <Icon3D name="loading" size={18} animated /> : <Icon3D name="send" size={18} animated />}
        </button>
      </div>
      <p className="ai-chat-hint">{t("chat_hint")}</p>
    </div>
  );
}
