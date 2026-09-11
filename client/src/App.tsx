import Landingpage from "@/pages/Landingpage";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "@/pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import ImageGenStudioPage from "./pages/ImageGenStudioPage";
import ImageGalleryPage from "./pages/ImageGalleryPage";
import SettingsPage from "./pages/SettingsPage";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Landing & Marketing */}
      <Route path="/" element={<Landingpage />} />
      
      {/* Public / Unauthenticated Only */}
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <Signup />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <SignIn />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Studio Services - Must be logged in */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/image-gen"
        element={
          <ProtectedRoute>
            <ImageGenStudioPage />
          </ProtectedRoute>
        }
      />
      <Route path="/generate" element={<Navigate to="/image-gen" replace />} />

      {/* Watermarked Public Image Gallery */}
      <Route path="/image-gallary" element={<ImageGalleryPage />} />
      <Route path="/image-gallery" element={<Navigate to="/image-gallary" replace />} />

      {/* Protected Settings Page */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;