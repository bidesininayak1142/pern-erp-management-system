
import { useState } from "react";
import Layout from "../components/Layout";
import "./Reports.css";

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    {
      id: "sales",
      title: "Sales Report",
      description:
        "View sales orders, completed sales and total sales amount.",
    },
    {
      id: "quotation",
      title: "Quotation Report",
      description:
        "View quotation status such as Draft, Sent, Accepted and Rejected.",
    },
    {
      id: "inventory",
      title: "Inventory Report",
      description:
        "View available stock, reserved stock and product quantities.",
    },
    {
      id: "customer",
      title: "Customer Report",
      description:
        "View customer information and customer activity.",
    },
  ];

  const handleViewReport = (reportId) => {
    setSelectedReport(reportId);
  };

  const handleBack = () => {
    setSelectedReport(null);
  };

  return (
    <Layout>
      <div className="reports-page">

        {}
        <div className="page-header">
          <div>
            <h1>Reports</h1>
            <p>View ERP business reports and summaries</p>
          </div>
        </div>

        {}
        {!selectedReport && (
          <div className="report-cards">
            {reports.map((report) => (
              <div className="report-card" key={report.id}>
                <h3>{report.title}</h3>

                <p>{report.description}</p>

                <button
                  type="button"
                  onClick={() => handleViewReport(report.id)}
                >
                  View Report
                </button>
              </div>
            ))}
          </div>
        )}

        {}
        {selectedReport === "sales" && (
          <div className="report-details">

            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              ← Back to Reports
            </button>

            <div className="report-title">
              <h2>Sales Report</h2>
              <p>Sales order summary</p>
            </div>

            <div className="summary-cards">

              <div className="summary-card">
                <h3>Total Orders</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Completed Orders</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Pending Orders</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Total Sales</h3>
                <strong>₹0.00</strong>
              </div>

            </div>

            <div className="report-table-card">
              <h3>Sales Orders</h3>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Customer</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td colSpan="5">
                      No sales orders available.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}

        {}
        {selectedReport === "quotation" && (
          <div className="report-details">

            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              ← Back to Reports
            </button>

            <div className="report-title">
              <h2>Quotation Report</h2>
              <p>Quotation status summary</p>
            </div>

            <div className="summary-cards">

              <div className="summary-card">
                <h3>Total Quotations</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Draft</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Accepted</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Rejected</h3>
                <strong>0</strong>
              </div>

            </div>

          </div>
        )}

        {}
        {selectedReport === "inventory" && (
          <div className="report-details">

            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              ← Back to Reports
            </button>

            <div className="report-title">
              <h2>Inventory Report</h2>
              <p>Inventory stock summary</p>
            </div>

            <div className="summary-cards">

              <div className="summary-card">
                <h3>Total Products</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Physical Stock</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Reserved Stock</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Available Stock</h3>
                <strong>0</strong>
              </div>

            </div>

          </div>
        )}

      {}
        {selectedReport === "customer" && (
          <div className="report-details">

            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              ← Back to Reports
            </button>

            <div className="report-title">
              <h2>Customer Report</h2>
              <p>Customer information and activity</p>
            </div>

            <div className="summary-cards">

              <div className="summary-card">
                <h3>Total Customers</h3>
                <strong>0</strong>
              </div>

              <div className="summary-card">
                <h3>Active Customers</h3>
                <strong>0</strong>
              </div>

            </div>

          </div>
        )}

      </div>
    </Layout>
  );
}

export default Reports;
