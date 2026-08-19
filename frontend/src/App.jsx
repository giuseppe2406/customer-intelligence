import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import AppLayout from "./components/AppLayout";
import GeschuetzteRoute from "./components/GeschuetzteRoute";
import ArbeitslistePage from "./pages/ArbeitslistePage";
import DashboardPage from "./pages/DashboardPage";
import KundeDetailPage from "./pages/KundeDetailPage";
import KundenPage from "./pages/KundenPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/arbeitsliste" replace />} />
          {/* Route ohne eigenen Pfad: gibt allen Unterrouten Schutz und Layout */}
          <Route
            element={
              <GeschuetzteRoute>
                <AppLayout />
              </GeschuetzteRoute>
            }
          >
            <Route path="/arbeitsliste" element={<ArbeitslistePage />} />
            <Route path="/kunden" element={<KundenPage />} />
            <Route path="/kunden/:id" element={<KundeDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
