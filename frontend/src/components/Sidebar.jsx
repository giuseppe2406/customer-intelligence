import { NavLink } from "react-router-dom";
import { NAVIGATION } from "../navigation";
import "./Sidebar.css";

function Sidebar() {
  return (
    <nav className="seitenleiste">
      <div className="seitenleiste-projekt">Customer Intelligence</div>
      <ul className="seitenleiste-liste">
        {NAVIGATION.map((eintrag) => (
          <li key={eintrag.pfad}>
            <NavLink
              to={eintrag.pfad}
              className={({ isActive }) =>
                isActive ? "seitenleiste-link aktiv" : "seitenleiste-link"
              }
            >
              {eintrag.titel}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
