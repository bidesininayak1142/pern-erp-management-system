import { useNavigate } from "react-router-dom";
import { User, LogOut, ShieldCheck, UserCheck, RefreshCw, Layers } from "lucide-react";
import API from "../services/api";
import "./Navbar.css";

function Navbar({ collapsed }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleQuickSwitchRole = async () => {
    const targetEmail =
      user?.role === "ADMIN" ? "sales@example.com" : "admin@example.com";
    try {
      const res = await API.post("/auth/login", {
        email: targetEmail,
        password: "admin123",
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.reload();
    } catch (err) {
      console.error("Failed to switch role:", err);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="erp-navbar">
      <div className="erp-navbar-left">
        <div className="erp-navbar-badge">
          <span className="live-dot"></span>
          PERN Workflow Active
        </div>
      </div>

      <div className="erp-navbar-right">
        {/* Quick Role Switcher Button */}
        <button
          onClick={handleQuickSwitchRole}
          className="erp-role-switch-btn"
          title={`Switch to ${isAdmin ? "Sales User" : "Admin"}`}
        >
          <RefreshCw size={14} />
          <span>Switch to {isAdmin ? "Sales User" : "Admin"}</span>
        </button>

        {/* User Card */}
        <div className="erp-user-badge">
          <div className={`user-avatar ${isAdmin ? "avatar-admin" : "avatar-sales"}`}>
            {isAdmin ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || "User"}</span>
            <span className={`user-role-tag ${isAdmin ? "tag-admin" : "tag-sales"}`}>
              {user?.role || "SALES_USER"}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="erp-navbar-logout-btn"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;