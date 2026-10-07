import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/horizon.css";
import "./styles/horizon-components.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML =
    "<p style='color:#0A192F;padding:24px;font-family:system-ui'>Horizon Properties: #root not found</p>";
} else {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
