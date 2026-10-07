
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Mail,
  Package,
  Truck,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  Zap,
  ChevronRight,
  LogOut,
  Boxes,
  ChevronLeft,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: Users,
      hasArrow: true,
    },
    {
      name: "Enquiries",
      path: "/enquiries",
      icon: Mail,
      hasArrow: true,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Package,
      hasArrow: true,
    },
    {
      name: "Dispatch",
      path: "/dispatch",
      icon: Truck,
      hasArrow: true,
    },
    {
      name: "Sales Orders",
      path: "/sales-orders",
      icon: ShoppingCart,
      hasArrow: true,
    },
    {
      name: "Quotations",
      path: "/quotations",
      icon: FileText,
      hasArrow: true,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3,
      hasArrow: true,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      hasArrow: true,
    },
  ];

  return (
    <aside
      className={`erp-sidebar ${
        collapsed ? "collapsed" : ""
      }`}
    >
      {/* Brand Header */}
      <div className="erp-sidebar-header">
        <div className="erp-sidebar-logo">
          <Boxes size={22} />
        </div>

        {!collapsed && (
          <div className="erp-sidebar-title">
            <h3>ERP System</h3>
            <span>Enterprise Resource Planning</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="erp-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `erp-nav-item ${
                  isActive ? "active" : ""
                }`
              }
              title={collapsed ? item.name : undefined}
            >
              <div className="erp-nav-icon">
                <Icon size={19} />
              </div>

              {!collapsed && (
                <>
                  <span className="erp-nav-label">
                    {item.name}
                  </span>

                  {item.hasArrow && (
                    <ChevronRight
                      size={15}
                      className="erp-nav-arrow"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        type="button"
        className="sidebar-toggle-pill"
        onClick={() => setCollapsed(!collapsed)}
        title={
          collapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
      >
        {collapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>

      {/* Help Card & Logout */}
      {!collapsed && (
        <div className="erp-sidebar-help">
          <div className="erp-help-card">
            <div className="help-icon-wrapper">
              <Zap size={18} />
            </div>

            <div className="help-text">
              <h4>Need Help?</h4>
              <p>Contact Admin or Support</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="erp-sidebar-logout"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
