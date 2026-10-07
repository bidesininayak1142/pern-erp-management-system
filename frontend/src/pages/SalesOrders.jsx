
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import "./SalesOrders.css";

function SalesOrders() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const [orderNumber, setOrderNumber] = useState("");
  const [quotationId, setQuotationId] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [salesOrderResponse, quotationResponse] =
          await Promise.all([
            API.get("/sales-orders"),
            API.get("/quotations"),
          ]);

        if (cancelled) return;
        let salesOrderData = [];

        if (Array.isArray(salesOrderResponse.data)) {
          salesOrderData = salesOrderResponse.data;
        } else if (
          Array.isArray(salesOrderResponse.data?.sales_orders)
        ) {
          salesOrderData =
            salesOrderResponse.data.sales_orders;
        } else if (
          Array.isArray(salesOrderResponse.data?.data)
        ) {
          salesOrderData = salesOrderResponse.data.data;
        }

        setSalesOrders(salesOrderData);
        let quotationData = [];

        if (Array.isArray(quotationResponse.data)) {
          quotationData = quotationResponse.data;
        } else if (
          Array.isArray(quotationResponse.data?.quotations)
        ) {
          quotationData =
            quotationResponse.data.quotations;
        } else if (
          Array.isArray(quotationResponse.data?.data)
        ) {
          quotationData = quotationResponse.data.data;
        }
        const acceptedQuotations = quotationData.filter(
          (quotation) =>
            String(quotation.status).toUpperCase() ===
            "ACCEPTED"
        );

        setQuotations(acceptedQuotations);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Sales Order loading error:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Failed to load sales orders."
        );

        setSalesOrders([]);
        setQuotations([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);
  const handleCreateSalesOrder = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!orderNumber.trim()) {
      setError("Please enter Order Number.");
      return;
    }

    if (!quotationId) {
      setError("Please select an accepted quotation.");
      return;
    }

    try {
      setCreating(true);

      const response = await API.post("/sales-orders", {
        order_number: orderNumber.trim(),
        quotation_id: Number(quotationId),
      });

      console.log(
        "Create Sales Order response:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Sales Order created successfully."
      );

      setOrderNumber("");
      setQuotationId("");
      const salesOrderResponse =
        await API.get("/sales-orders");

      let salesOrderData = [];

      if (Array.isArray(salesOrderResponse.data)) {
        salesOrderData = salesOrderResponse.data;
      } else if (
        Array.isArray(salesOrderResponse.data?.sales_orders)
      ) {
        salesOrderData =
          salesOrderResponse.data.sales_orders;
      } else if (
        Array.isArray(salesOrderResponse.data?.data)
      ) {
        salesOrderData = salesOrderResponse.data.data;
      }

      setSalesOrders(salesOrderData);
    } catch (error) {
      console.error(
        "Create Sales Order error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to create Sales Order."
      );
    } finally {
      setCreating(false);
    }
  };
  const handleConfirm = async (id) => {
    const confirmAction = window.confirm(
      "Are you sure you want to confirm this Sales Order?\n\nInventory will be reserved."
    );

    if (!confirmAction) return;

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");

      const response = await API.put(
        `/sales-orders/${id}/confirm`
      );

      setSuccess(
        response.data?.message ||
          "Sales Order confirmed successfully."
      );
      const salesOrderResponse =
        await API.get("/sales-orders");

      let salesOrderData = [];

      if (Array.isArray(salesOrderResponse.data)) {
        salesOrderData = salesOrderResponse.data;
      } else if (
        Array.isArray(salesOrderResponse.data?.sales_orders)
      ) {
        salesOrderData =
          salesOrderResponse.data.sales_orders;
      } else if (
        Array.isArray(salesOrderResponse.data?.data)
      ) {
        salesOrderData = salesOrderResponse.data.data;
      }

      setSalesOrders(salesOrderData);
    } catch (error) {
      console.error(
        "Confirm Sales Order error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to confirm Sales Order."
      );
    } finally {
      setActionLoading(null);
    }
  };
  const handleCancel = async (id) => {
    const confirmAction = window.confirm(
      "Are you sure you want to cancel this Sales Order?"
    );

    if (!confirmAction) return;

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/sales-orders/${id}/cancel`
      );

      setSuccess(
        response.data?.message ||
          "Sales Order cancelled successfully."
      );
      const salesOrderResponse =
        await API.get("/sales-orders");

      let salesOrderData = [];

      if (Array.isArray(salesOrderResponse.data)) {
        salesOrderData = salesOrderResponse.data;
      } else if (
        Array.isArray(salesOrderResponse.data?.sales_orders)
      ) {
        salesOrderData =
          salesOrderResponse.data.sales_orders;
      } else if (
        Array.isArray(salesOrderResponse.data?.data)
      ) {
        salesOrderData = salesOrderResponse.data.data;
      }

      setSalesOrders(salesOrderData);
    } catch (error) {
      console.error(
        "Cancel Sales Order error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to cancel Sales Order."
      );
    } finally {
      setActionLoading(null);
    }
  };
  const getStatusClass = (status) => {
    switch (String(status).toUpperCase()) {
      case "PENDING":
        return "status-pending";

      case "CONFIRMED":
        return "status-confirmed";

      case "DISPATCHED":
        return "status-dispatched";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "status-default";
    }
  };
  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("en-IN");
    } catch {
      return date;
    }
  };
  const formatMoney = (amount) => {
    const value = Number(amount || 0);

    return `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Sales Orders</h1>
          <p>
            Create and manage sales orders from accepted
            quotations
          </p>
        </div>
      </div>

      {}
      {success && (
        <div className="alert success-alert">
          {success}
        </div>
      )}

      {}
      {error && (
        <div className="alert error-alert">
          {error}
        </div>
      )}

      {}
      <div className="form-card">
        <div className="form-card-header">
          <div>
            <h2>Create Sales Order</h2>
            <p>
              Sales Orders can only be created from accepted
              quotations.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateSalesOrder}>
          <div className="form-grid">
            {}
            <div className="form-group">
              <label>Order Number</label>

              <input
                type="text"
                placeholder="Example: SO-1001"
                value={orderNumber}
                onChange={(e) =>
                  setOrderNumber(e.target.value)
                }
              />
            </div>

            {}
            <div className="form-group">
              <label>Accepted Quotation</label>

              <select
                value={quotationId}
                onChange={(e) =>
                  setQuotationId(e.target.value)
                }
              >
                <option value="">
                  Select quotation
                </option>

                {quotations.map((quotation) => (
                  <option
                    key={quotation.id}
                    value={quotation.id}
                  >
                    {quotation.quotation_number ||
                      quotation.quotationNumber ||
                      `Quotation #${quotation.id}`}
                    {" - "}
                    {quotation.company_name ||
                      quotation.companyName ||
                      quotation.customer_name ||
                      "Customer"}
                  </option>
                ))}
              </select>

              {quotations.length === 0 && (
                <small className="form-help">
                  No ACCEPTED quotations available.
                </small>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Create Sales Order"}
          </button>
        </form>
      </div>

      {}
      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2>Sales Order List</h2>
            <p>
              View and manage all sales orders
            </p>
          </div>

          <span className="item-count">
            {salesOrders.length} Orders
          </span>
        </div>

        {}
        {loading && (
          <div className="empty-state">
            <h3>Loading sales orders...</h3>
            <p>Please wait.</p>
          </div>
        )}

        {}
        {!loading && salesOrders.length === 0 && (
          <div className="empty-state">
            <h3>No Sales Orders Found</h3>
            <p>
              Create a Sales Order using an accepted
              quotation.
            </p>
          </div>
        )}

        {}
        {!loading && salesOrders.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Quotation</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {salesOrders.map((order) => {
                  const status =
                    String(order.status || "PENDING")
                      .toUpperCase();

                  return (
                    <tr key={order.id}>
                      {}
                      <td>
                        <strong>
                          {order.order_number ||
                            order.orderNumber ||
                            "-"}
                        </strong>
                      </td>

                      {}
                      <td>
                        {order.quotation_number ||
                          order.quotationNumber ||
                          order.quotation_id ||
                          "-"}
                      </td>

                      {}
                      <td>
                        {order.company_name ||
                          order.companyName ||
                          order.customer_name ||
                          "-"}
                      </td>

                      {}
                      <td>
                        {formatDate(
                          order.order_date ||
                            order.orderDate
                        )}
                      </td>

                      {}
                      <td>
                        {formatMoney(
                          order.total_amount ||
                            order.totalAmount
                        )}
                      </td>

                      {}
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      {}
                      <td>
                        <div className="action-buttons">
                          {}
                          {status === "PENDING" && (
                            <>
                              <button
                                className="confirm-button"
                                onClick={() =>
                                  handleConfirm(order.id)
                                }
                                disabled={
                                  actionLoading ===
                                  order.id
                                }
                              >
                                {actionLoading ===
                                order.id
                                  ? "..."
                                  : "Confirm"}
                              </button>

                              <button
                                className="cancel-button"
                                onClick={() =>
                                  handleCancel(order.id)
                                }
                                disabled={
                                  actionLoading ===
                                  order.id
                                }
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {}
                          {status === "CONFIRMED" && (
                            <span className="dispatch-ready">
                              Ready for Dispatch
                            </span>
                          )}

                          {}
                          {status === "DISPATCHED" && (
                            <span className="dispatch-done">
                              Dispatched
                            </span>
                          )}

                          {}
                          {status === "CANCELLED" && (
                            <span className="cancelled-text">
                              Cancelled
                            </span>
                          )}
                        </div>
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

export default SalesOrders;
