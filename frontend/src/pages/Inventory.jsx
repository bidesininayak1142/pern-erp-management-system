import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import "./Inventory.css";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const getInventory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/inventory");

        console.log("Inventory API response:", response.data);

        if (isMounted) {
          if (Array.isArray(response.data?.inventory)) {
            setInventory(response.data.inventory);
          } else {
            setInventory([]);
          }
        }
      } catch (error) {
        console.error(
          "Inventory error:",
          error.response?.data || error.message
        );

        if (isMounted) {
          setError(
            error.response?.data?.message ||
              "Failed to load inventory."
          );

          setInventory([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Layout>
      {}
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage products and stock</p>
        </div>
      </div>

      {}
      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2>Inventory List</h2>
            <p>
              Available products and stock information
            </p>
          </div>

          <span>{inventory.length} Items</span>
        </div>

        {}
        {loading && (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
            }}
          >
            Loading inventory...
          </div>
        )}

        {}
        {!loading && error && (
          <div
            style={{
              padding: "20px",
              color: "#b91c1c",
              background: "#fef2f2",
            }}
          >
            {error}
          </div>
        )}

        {}
        {!loading &&
          !error &&
          inventory.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <h3>No inventory records found.</h3>

              <p>
                There are currently no products
                in the inventory.
              </p>
            </div>
          )}

        {}
        {!loading &&
          !error &&
          inventory.length > 0 && (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Code</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Physical Qty</th>
                    <th>Reserved Qty</th>
                    <th>Available Qty</th>
                    <th>Base Price</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.map((item) => {
                    const available =
                      Number(
                        item.available_quantity
                      ) || 0;

                    let status = "Available";

                    if (available <= 0) {
                      status = "Out of Stock";
                    } else if (available <= 20) {
                      status = "Low Stock";
                    }

                    return (
                      <tr key={item.product_id}>
                        {}
                        <td>
                          {item.product_id}
                        </td>

                        {}
                        <td>
                          {item.product_code}
                        </td>

                        {}
                        <td>
                          <strong>
                            {item.product_name}
                          </strong>
                        </td>

                        {}
                        <td>
                          {item.category}
                        </td>

                        {}
                        <td>
                          {item.unit}
                        </td>

                        {}
                        <td>
                          {item.physical_quantity}
                        </td>

                        {}
                        <td>
                          {item.reserved_quantity}
                        </td>

                        {}
                        <td>
                          <strong>
                            {item.available_quantity}
                          </strong>
                        </td>

                        {}
                        <td>
                          ₹
                          {Number(
                            item.base_price
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </td>

                        {}
                        <td>
                          <span
                            className={`inventory-status ${status
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </Layout>
  );
}

export default Inventory;