import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext"; 
import { HomePage } from "./screens/HomePage/HomePage";
import { ProductsPage } from "./screens/ProductsPage/ProductsPage";
import { DetailsPage } from "./screens/DetailsPage/DetailsPage";
import { ComparePage } from "./screens/ComparePage/ComparePage";
import { LoginPage } from "./screens/LoginPage/LoginPage";
import { SignupPage } from "./screens/SignupPage/SignupPage";
import { ContactPage } from "./screens/ContactPage/ContactPage";
import { ErrorPage } from "./screens/ErrorPage/ErrorPage";
import { AboutPage } from "./screens/AboutPage/AboutPage";
import { ProfilePage } from "./screens/ProfilePage/ProfilePage";
import { GoogleAuthCallback } from "./screens/GoogleAuthCallback/GoogleAuthCallback";
import { ChatbotPage } from "./screens/ChatbotPage/ChatbotPage";
import { LaptopFinderPage } from "./screens/LaptopFinderPage/LaptopFinderPage";
import { LaptopFinderPage2 } from "./screens/LaptopFinderPage2/LaptopFinderPage2";
import { FavoritesPage } from "./screens/FavoritesPage/FavoritesPage";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<DetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/404" element={<ErrorPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/compare/:productId/:secondProductId?" element={<ComparePage />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/laptop-finder" element={<LaptopFinderPage />} /> 
          <Route path="/laptop-finderr" element={<LaptopFinderPage2/>} /> 
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);