import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../i18n";

const ROUTE_KEYS: Record<string, string> = {
  "/": "nav_home",
  "/command": "nav_command",
  "/intel": "nav_intel",
  "/auth": "nav_access",
  "/profile": "nav_profile",
  "/contact": "nav_contact",
};

export function PageTitle() {
  const { pathname } = useLocation();
  const { t, locale } = useI18n();

  useEffect(() => {
    const key = ROUTE_KEYS[pathname];
    document.title = key ? `NEXUS — ${t(key)}` : t("page_title");
  }, [pathname, t, locale]);

  return null;
}
