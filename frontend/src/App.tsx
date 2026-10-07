import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/horizon/Header";
import { Footer } from "./components/horizon/Footer";
import { HomePage } from "./pages/horizon/HomePage";
import { PropertiesPage } from "./pages/horizon/PropertiesPage";
import { PropertyDetailPage } from "./pages/horizon/PropertyDetailPage";
import { ContactPage } from "./pages/horizon/ContactPage";

export default function App() {
  return (
    <div className="hp-app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
