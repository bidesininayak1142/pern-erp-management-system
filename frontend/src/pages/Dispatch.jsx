
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import "./Dispatch.css";

function Dispatch() {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getDispatches = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/dispatches");

        console.log("Dispatch API response:", response.data);

  

        if (Array.isArray(response.data)) {
          setDispatches(response.data);
        } else if (Array.isArray(response.data?.dispatches)) {
          setDispatches(response.data.dispatches);
        } else if (Array.isArray(response.data?.data)) {
          setDispatches(response.data.data);
        } else {
          setDispatches([]);
        }
      } catch (error) {
        console.error(
          "Dispatch error:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load dispatch records."
        );

        setDispatches([]);
      } finally {
        setLoading(false);
      }
    };

    getDispatches();
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Dispatch</h1>
          <p>Manage product dispatch and delivery</p>
        </div>
      </div>

      <div className="table-card">
        <h2>Dispatch List</h2>

        {loading && (
          <p>Loading dispatch records...</p>
        )}

        {!loading && error && (
          <p style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          dispatches.length === 0 && (
            <p>No dispatch records found.</p>
          )}

        {!loading &&
          !error &&
          dispatches.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Dispatch No.</th>
                  <th>Order No.</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {dispatches.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.dispatch_number ||
                        item.dispatchNumber ||
                        "-"}
                    </td>

                    <td>
                      {item.order_number ||
                        item.orderNumber ||
                        "-"}
                    </td>

                    <td>
                      {item.company_name ||
                        item.companyName ||
                        "-"}
                    </td>

                    <td>
                      {item.dispatch_date ||
                        item.dispatchDate ||
                        "-"}
                    </td>

                    <td>
                      {item.vehicle_number ||
                        item.vehicleNumber ||
                        "-"}
                    </td>

                    <td>
                      {item.driver_name ||
                        item.driverName ||
                        "-"}
                    </td>

                    <td>
                      {item.status || "DISPATCHED"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </Layout>
  );
}

export default Dispatch;