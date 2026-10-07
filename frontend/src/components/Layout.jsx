import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`erp-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="erp-main">
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="erp-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;