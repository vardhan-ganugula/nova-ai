import Landingpage from "@/pages/Landingpage";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "@/pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import CreatePage from "./pages/CreatePage";
import ImageGalleryPage from "./pages/ImageGalleryPage";
import ModelsPage from "./pages/ModelsPage";
import WorkflowsPage from "./pages/WorkflowsPage";
import LibraryPage from "./pages/LibraryPage";
import CollectionsPage from "./pages/CollectionsPage";
import HistoryPage from "./pages/HistoryPage";
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

      {/* Primary Generation Studio Workspace */}
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreatePage />
          </ProtectedRoute>
        }
      />
      {/* Legacy generation route redirects */}
      <Route path="/image-gen" element={<Navigate to="/create" replace />} />
      <Route path="/generate" element={<Navigate to="/create" replace />} />

      {/* Explore Community Gallery (Public for visitors & search indexing) */}
      <Route path="/explore" element={<ImageGalleryPage />} />
      <Route path="/image-gallary" element={<Navigate to="/explore" replace />} />
      <Route path="/image-gallery" element={<Navigate to="/explore" replace />} />

      {/* Models Marketplace */}
      <Route
        path="/models"
        element={
          <ProtectedRoute>
            <ModelsPage />
          </ProtectedRoute>
        }
      />

      {/* Node-Based Workflows */}
      <Route
        path="/workflows"
        element={
          <ProtectedRoute>
            <WorkflowsPage />
          </ProtectedRoute>
        }
      />

      {/* Personal Assets Library */}
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        }
      />

      {/* Curated Collections */}
      <Route
        path="/collections"
        element={
          <ProtectedRoute>
            <CollectionsPage />
          </ProtectedRoute>
        }
      />

      {/* Generation History Timeline */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Settings & Telemetry */}
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