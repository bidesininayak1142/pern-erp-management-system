import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  X,
  Package,
  FileText,
} from "lucide-react";

import API from "../services/api";
import Layout from "../components/Layout";
import "./Enquiries.css";

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    enquiry_number: "",
    customer_id: "",
    enquiry_date: "",
    required_date: "",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const getEnquiries = async () => {
    try {
      const response = await API.get("/enquiries");

      setEnquiries(response.data?.enquiries || []);
    } catch (error) {
      console.error(
        "Get enquiries error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to load enquiries."
      );
    }
  };
  const getCustomers = async () => {
    try {
      const response = await API.get("/customers");

      let customerData = [];

      if (Array.isArray(response.data)) {
        customerData = response.data;
      } else if (Array.isArray(response.data?.customers)) {
        customerData = response.data.customers;
      } else if (Array.isArray(response.data?.data)) {
        customerData = response.data.data;
      }

      setCustomers(customerData);
    } catch (error) {
      console.error(
        "Get customers error:",
        error.response?.data || error.message
      );

      setCustomers([]);
    }
  };
  const getProducts = async () => {
    try {
      const response = await API.get("/inventory");

      let productData = [];

      if (Array.isArray(response.data)) {
        productData = response.data;
      } else if (Array.isArray(response.data?.inventory)) {
        productData = response.data.inventory;
      } else if (Array.isArray(response.data?.data)) {
        productData = response.data.data;
      }

      setProducts(productData);
    } catch (error) {
      console.error(
        "Get products error:",
        error.response?.data || error.message
      );

      setProducts([]);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        getEnquiries(),
        getCustomers(),
        getProducts(),
      ]);
    };

    loadData();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };
  const handleItemChange = (index, field, value) => {
    setItems((previousItems) =>
      previousItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };
  const addItem = () => {
    setItems((previousItems) => [
      ...previousItems,
      {
        product_id: "",
        quantity: 1,
      },
    ]);
  };
  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((previousItems) =>
      previousItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };
  const resetForm = () => {
    setForm({
      enquiry_number: "",
      customer_id: "",
      enquiry_date: "",
      required_date: "",
      notes: "",
    });

    setItems([
      {
        product_id: "",
        quantity: 1,
      },
    ]);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.enquiry_number.trim()) {
      alert("Please enter enquiry number.");
      return;
    }

    if (!form.customer_id) {
      alert("Please select customer.");
      return;
    }

    if (!form.enquiry_date) {
      alert("Please select enquiry date.");
      return;
    }

    for (const item of items) {
      if (!item.product_id) {
        alert("Please select a product.");
        return;
      }

      if (Number(item.quantity) <= 0) {
        alert("Quantity must be greater than 0.");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        enquiry_number: form.enquiry_number.trim(),
        customer_id: Number(form.customer_id),
        enquiry_date: form.enquiry_date,
        required_date: form.required_date || null,
        notes: form.notes.trim(),

        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
      };

      await API.post("/enquiries", payload);

      alert("Enquiry created successfully.");

      resetForm();
      setShowForm(false);

      await getEnquiries();
    } catch (error) {
      console.error(
        "Create enquiry error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to create enquiry."
      );
    } finally {
      setLoading(false);
    }
  };
  const viewEnquiry = async (id) => {
    try {
      const response = await API.get(`/enquiries/${id}`);

      setSelectedEnquiry(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error(
        "Get enquiry details error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to load enquiry details."
      );
    }
  };
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const searchText = search.toLowerCase();

    return (
      String(enquiry.enquiry_number || "")
        .toLowerCase()
        .includes(searchText) ||
      String(enquiry.company_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(enquiry.contact_person || "")
        .toLowerCase()
        .includes(searchText) ||
      String(enquiry.status || "")
        .toLowerCase()
        .includes(searchText)
    );
  });
  const getStatusClass = (status) => {
    switch (status) {
      case "NEW":
        return "status-new";

      case "QUOTED":
        return "status-quoted";

      case "WON":
        return "status-won";

      case "LOST":
        return "status-lost";

      default:
        return "status-new";
    }
  };

  return (
    <Layout>
      <div className="enquiries-page">

        {}
        <div className="page-header">
          <div>
            <h1>Customer Enquiries</h1>
            <p>
              Manage customer enquiries and requested products.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus size={18} />
            Create Enquiry
          </button>
        </div>

        {}
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search enquiry, customer or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {}
        <div className="table-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Enquiry Number</th>
                  <th>Customer</th>
                  <th>Contact Person</th>
                  <th>Enquiry Date</th>
                  <th>Required Date</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="empty-message"
                    >
                      No enquiries found.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map(
                    (enquiry, index) => (
                      <tr key={enquiry.id}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>
                            {enquiry.enquiry_number}
                          </strong>
                        </td>

                        <td>
                          {enquiry.company_name || "-"}
                        </td>

                        <td>
                          {enquiry.contact_person || "-"}
                        </td>

                        <td>
                          {enquiry.enquiry_date
                            ? new Date(
                                enquiry.enquiry_date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td>
                          {enquiry.required_date
                            ? new Date(
                                enquiry.required_date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td>
                          {enquiry.items_count || 0}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              enquiry.status
                            )}`}
                          >
                            {enquiry.status || "NEW"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="icon-btn"
                            title="View"
                            onClick={() =>
                              viewEnquiry(enquiry.id)
                            }
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal">

              <div className="modal-header">
                <div>
                  <h2>Create Enquiry</h2>
                  <p>
                    Enter customer enquiry details.
                  </p>
                </div>

                <button
                  className="close-btn"
                  onClick={() => setShowForm(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>

                {}
                <div className="form-section">
                  <h3>
                    <FileText size={18} />
                    Enquiry Details
                  </h3>

                  <div className="form-grid">

                    <div className="form-group">
                      <label>
                        Enquiry Number *
                      </label>

                      <input
                        type="text"
                        name="enquiry_number"
                        placeholder="ENQ-1001"
                        value={form.enquiry_number}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Customer *
                      </label>

                      <select
                        name="customer_id"
                        value={form.customer_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Customer
                        </option>

                        {customers.map((customer) => (
                          <option
                            key={customer.id}
                            value={customer.id}
                          >
                            {customer.company_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Enquiry Date *
                      </label>

                      <input
                        type="date"
                        name="enquiry_date"
                        value={form.enquiry_date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Required Date
                      </label>

                      <input
                        type="date"
                        name="required_date"
                        value={form.required_date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Notes</label>

                      <textarea
                        name="notes"
                        placeholder="Enter enquiry notes..."
                        value={form.notes}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>

                  </div>
                </div>

                {}
                <div className="form-section">

                  <div className="section-title-row">
                    <h3>
                      <Package size={18} />
                      Requested Products
                    </h3>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={addItem}
                    >
                      <Plus size={16} />
                      Add Product
                    </button>
                  </div>

                  <div className="items-container">

                    {items.map((item, index) => (
                      <div
                        className="item-row"
                        key={index}
                      >

                        <div className="form-group product-field">
                          <label>Product *</label>

                          <select
                            value={item.product_id}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "product_id",
                                e.target.value
                              )
                            }
                            required
                          >
                            <option value="">
                              Select Product
                            </option>

                            {products.map((product) => (
                              <option
                                key={product.product_id}
                                value={product.product_id}
                              >
                                {product.product_code} -{" "}
                                {product.product_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group quantity-field">
                          <label>Quantity *</label>

                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() =>
                            removeItem(index)
                          }
                          disabled={items.length === 1}
                        >
                          <X size={18} />
                        </button>

                      </div>
                    ))}

                  </div>
                </div>

                {/* BUTTONS */}
                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating..."
                      : "Create Enquiry"}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

        {}
        {showDetails && selectedEnquiry && (
          <div className="modal-overlay">

            <div className="modal details-modal">

              <div className="modal-header">
                <div>
                  <h2>
                    Enquiry Details
                  </h2>

                  <p>
                    {selectedEnquiry.enquiry
                      ?.enquiry_number || "-"}
                  </p>
                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setShowDetails(false)
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <div className="details-grid">

                <div>
                  <span>Enquiry Number</span>
                  <strong>
                    {selectedEnquiry.enquiry
                      ?.enquiry_number || "-"}
                  </strong>
                </div>

                <div>
                  <span>Customer</span>
                  <strong>
                    {selectedEnquiry.enquiry
                      ?.company_name || "-"}
                  </strong>
                </div>

                <div>
                  <span>Contact Person</span>
                  <strong>
                    {selectedEnquiry.enquiry
                      ?.contact_person || "-"}
                  </strong>
                </div>

                <div>
                  <span>Mobile</span>
                  <strong>
                    {selectedEnquiry.enquiry
                      ?.mobile || "-"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {selectedEnquiry.enquiry
                      ?.email || "-"}
                  </strong>
                </div>

                <div>
                  <span>City</span>
                  <strong>
                    {selectedEnquiry.enquiry
                      ?.city || "-"}
                  </strong>
                </div>

                <div>
                  <span>Enquiry Date</span>
                  <strong>
                    {selectedEnquiry.enquiry
                      ?.enquiry_date
                      ? new Date(
                          selectedEnquiry.enquiry.enquiry_date
                        ).toLocaleDateString("en-IN")
                      : "-"}
                  </strong>
                </div>

                <div>
                  <span>Required Date</span>
                  <strong>
                    {selectedEnquiry.enquiry
                      ?.required_date
                      ? new Date(
                          selectedEnquiry.enquiry.required_date
                        ).toLocaleDateString("en-IN")
                      : "-"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedEnquiry.enquiry
                      ?.status || "NEW"}
                  </strong>
                </div>

              </div>

              {}
              <div className="details-items">

                <h3>Products</h3>

                {selectedEnquiry.items?.length === 0 ? (
                  <p>No products added.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Product Code</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Unit</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedEnquiry.items?.map(
                        (item) => (
                          <tr key={item.id}>
                            <td>
                              {item.product_code}
                            </td>

                            <td>
                              {item.product_name}
                            </td>

                            <td>
                              {item.category || "-"}
                            </td>

                            <td>
                              {item.unit || "-"}
                            </td>

                            <td>
                              {item.quantity}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                )}

              </div>

              {/* NOTES */}
              <div className="notes-box">
                <strong>Notes</strong>
                <p>
                  {selectedEnquiry.enquiry
                    ?.notes || "No notes"}
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Enquiries;