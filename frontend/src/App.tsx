import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Shell } from "./ui/Shell";
import { LandingPage } from "./pages/LandingPage";
import { CommandPage } from "./pages/CommandPage";
import { IntelPage } from "./pages/IntelPage";
import { AuthPage } from "./pages/AuthPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ContactPage } from "./pages/ContactPage";
import { AdminPage } from "./pages/AdminPage";
import { AuthGuard } from "./ui/AuthGuard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/command" element={<CommandPage />} />
          <Route path="/intel" element={<IntelPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/admin"
            element={
              <AuthGuard role="admin">
                <AdminPage />
              </AuthGuard>
            }
          />

          {/* Legacy Serene URLs → new routes */}
          <Route path="/platform" element={<Navigate to="/command" replace />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/register" element={<Navigate to="/auth" replace />} />
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          <Route path="/vip" element={<Navigate to="/profile" replace />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/services" element={<Navigate to="/intel" replace />} />
          <Route path="/journal" element={<Navigate to="/" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
