import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

// Ohne Token gibt es keine Seite zu sehen, sondern nur den Login.
function GeschuetzteRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default GeschuetzteRoute;
