import { createRoot } from "react-dom/client";
import { I18nProvider } from "./i18n";
import { NexusProvider } from "./context/NexusContext";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/nexus-ui.css";
import "./styles/page-creative.css";
import "./nexus.css";
import "@shared/icons/icon.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<p style='color:#ff4655;padding:24px;font-family:monospace'>NEXUS: #root not found</p>";
} else {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <NexusProvider>
            <App />
          </NexusProvider>
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
