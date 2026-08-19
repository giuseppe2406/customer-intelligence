import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAuth } from "../auth/useAuth";
import { seitentitel } from "../navigation";
import "./AppLayout.css";

function AppLayout() {
  const { pathname } = useLocation();
  const { benutzer, abmelden } = useAuth();
  const navigate = useNavigate();

  function handleAbmelden() {
    abmelden();
    navigate("/login");
  }

  return (
    <div className="grundlayout">
      <Sidebar />
      <div className="inhaltsbereich">
        <TopBar
          titel={seitentitel(pathname)}
          benutzer={benutzer}
          onAbmelden={handleAbmelden}
        />
        <main className="inhalt">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
