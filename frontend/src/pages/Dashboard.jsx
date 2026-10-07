
import {
  Users,
  Inbox,
  FileText,
  ShoppingCart,
  Layers,
  Truck,
  LogOut,
  User,
  ArrowRight,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch (error) {
    console.error("User data error:", error);
  }

  const modules = [
    {
      title: "Customers",
      subtitle: "Customer Management",
      icon: <Users />,
      path: "/customers",
      color: "purple",
    },
    {
      title: "Enquiries",
      subtitle: "Customer Enquiries",
      icon: <Inbox />,
      path: "/enquiries",
      color: "pink",
    },
    {
      title: "Quotations",
      subtitle: "Quotation Management",
      icon: <FileText />,
      path: "/quotations",
      color: "blue",
    },
    {
      title: "Sales Orders",
      subtitle: "Order Management",
      icon: <ShoppingCart />,
      path: "/sales-orders",
      color: "green",
    },
    {
      title: "Inventory",
      subtitle: "Stock Management",
      icon: <Layers />,
      path: "/inventory",
      color: "amber",
    },
    {
      title: "Dispatch",
      subtitle: "Delivery Management",
      icon: <Truck />,
      path: "/dispatch",
      color: "orange",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <Layout>
      <div className="dashboard-page">

        {}

        <div className="dashboard-header">

          <div className="dashboard-header-left">
            <h1>ERP Management System</h1>

            <p>
              Enterprise Resource Planning Dashboard
            </p>
          </div>

          <div className="dashboard-user">
            <User size={18} />

            <span>
              {user?.name ||
                user?.email ||
                "Admin"}
            </span>
          </div>

        </div>


        {}

        <div className="welcome-card">

          <div className="welcome-content">

            <h2>
              Welcome, {user?.name || "Admin"} 👋
            </h2>

            <p>
              Manage your customers, enquiries,
              quotations, sales orders, inventory
              and dispatch from one place.
            </p>

          </div>

        </div>


        {}

        <div className="dashboard-stats">

          {}

          <Link
            to="/customers"
            className="stat-card"
          >
            <div className="stat-icon purple">
              <Users size={24} />
            </div>

            <div className="stat-content">
              <h3>Customers</h3>
              <p>Customer Management</p>
            </div>
          </Link>


          {}

          <Link
            to="/enquiries"
            className="stat-card"
          >
            <div className="stat-icon pink">
              <Inbox size={24} />
            </div>

            <div className="stat-content">
              <h3>Enquiries</h3>
              <p>Customer Enquiries</p>
            </div>
          </Link>


          {}

          <Link
            to="/inventory"
            className="stat-card"
          >
            <div className="stat-icon amber">
              <Layers size={24} />
            </div>

            <div className="stat-content">
              <h3>Inventory</h3>
              <p>Stock Management</p>
            </div>
          </Link>


          {}

          <Link
            to="/dispatch"
            className="stat-card"
          >
            <div className="stat-icon orange">
              <Truck size={24} />
            </div>

            <div className="stat-content">
              <h3>Dispatch</h3>
              <p>Delivery Management</p>
            </div>
          </Link>

        </div>


        {}

        <div className="module-section">

          <div className="section-header">

            <div>
              <h2>ERP Modules</h2>

              <p>
                Select a module to continue
              </p>
            </div>

          </div>


          <div className="module-grid">

            {modules.map((module) => (

              <Link
                key={module.path}
                to={module.path}
                className="module-card"
              >

                {}

                <div className="module-card-top">

                  <div
                    className={`module-icon ${module.color}`}
                  >
                    {module.icon}
                  </div>

                  <ArrowRight
                    size={21}
                    className="module-arrow"
                  />

                </div>


                {}

                <div className="module-card-content">

                  <h3>
                    {module.title}
                  </h3>

                  <p>
                    {module.subtitle}
                  </p>

                </div>

              </Link>

            ))}

          </div>

        </div>


        {}

        <div className="dashboard-footer">

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >

            <LogOut size={18} />

            <span>Logout</span>

          </button>

        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;