import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    mobile: "",
    email: "",
    city: "",
  });

  useEffect(() => {
    const getCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/customers");

        console.log(
          "Customers API response:",
          response.data
        );

        let customerData = [];

        if (Array.isArray(response.data)) {
          customerData = response.data;
        } else if (
          Array.isArray(response.data?.customers)
        ) {
          customerData = response.data.customers;
        } else if (
          Array.isArray(response.data?.data)
        ) {
          customerData = response.data.data;
        }
        customerData.sort(
          (a, b) => Number(b.id) - Number(a.id)
        );

        setCustomers(customerData);
      } catch (error) {
        console.error(
          "Customer error:",
          error.response?.data || error.message
        );

        setCustomers([]);

        setError(
          error.response?.data?.message ||
            "Failed to load customers"
        );
      } finally {
        setLoading(false);
      }
    };

    getCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    if (
      !formData.company_name.trim() ||
      !formData.contact_person.trim() ||
      !formData.mobile.trim() ||
      !formData.email.trim() ||
      !formData.city.trim()
    ) {
      alert("Please fill all customer details.");
      return;
    }

    try {
      setSaving(true);

      const response = await API.post(
        "/customers",
        formData
      );

      console.log(
        "Customer created:",
        response.data
      );

      alert("Customer created successfully.");

      setFormData({
        company_name: "",
        contact_person: "",
        mobile: "",
        email: "",
        city: "",
      });

      setShowForm(false);

      const customerResponse =
        await API.get("/customers");

      let customerData = [];

      if (Array.isArray(customerResponse.data)) {
        customerData = customerResponse.data;
      } else if (
        Array.isArray(
          customerResponse.data?.customers
        )
      ) {
        customerData =
          customerResponse.data.customers;
      } else if (
        Array.isArray(
          customerResponse.data?.data
        )
      ) {
        customerData =
          customerResponse.data.data;
      }
      customerData.sort(
        (a, b) => Number(b.id) - Number(a.id)
      );

      setCustomers(customerData);
    } catch (error) {
      console.error(
        "Create customer error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to create customer."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="customers-page">

        {}

        <div className="page-header">
          <div>
            <h1>Customers</h1>

            <p>
              Manage customer information for
              enquiries and sales.
            </p>
          </div>

          <button
            type="button"
            className="customer-add-button"
            onClick={() =>
              setShowForm(!showForm)
            }
          >
            {showForm
              ? "Close"
              : "+ Add Customer"}
          </button>
        </div>

        {}

        {showForm && (
          <div className="customer-form-card">

            <div className="customer-form-header">
              <div>
                <h2>Add New Customer</h2>

                <p>
                  Enter customer details for
                  enquiries.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleCreateCustomer}
            >
              <div className="customer-form-grid">

                {}

                <div className="form-group">
                  <label>
                    Company Name
                  </label>

                  <input
                    type="text"
                    name="company_name"
                    placeholder="ABC Engineering Pvt. Ltd."
                    value={
                      formData.company_name
                    }
                    onChange={handleChange}
                  />
                </div>

                {}

                <div className="form-group">
                  <label>
                    Contact Person
                  </label>

                  <input
                    type="text"
                    name="contact_person"
                    placeholder="Enter contact person"
                    value={
                      formData.contact_person
                    }
                    onChange={handleChange}
                  />
                </div>

                {}

                <div className="form-group">
                  <label>
                    Mobile
                  </label>

                  <input
                    type="tel"
                    name="mobile"
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>

                {}

                <div className="form-group">
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="company@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {}

                <div className="form-group">
                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    placeholder="Bhubaneswar"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

              </div>

              {}

              <div className="customer-form-actions">

                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customer-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Create Customer"}
                </button>

              </div>
            </form>
          </div>
        )}

        {}

        <div className="table-card">

          <div className="table-card-header">

            <div>
              <h2>Customer List</h2>

              <p>
                Customers available for
                enquiries
              </p>
            </div>

            <span className="customer-count">
              {customers.length} Customers
            </span>

          </div>

          {}

          {loading && (
            <div className="customer-message">
              Loading customers...
            </div>
          )}

          {}

          {!loading && error && (
            <div className="customer-error">
              {error}
            </div>
          )}

          {}

          {!loading &&
            !error &&
            customers.length === 0 && (
              <div className="customer-message">
                <h3>
                  No customers found
                </h3>

                <p>
                  Click "+ Add Customer" to
                  create your first customer.
                </p>
              </div>
            )}

          {}

          {!loading &&
            !error &&
            customers.length > 0 && (
              <div className="table-responsive">

                <table>

                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Company Name</th>
                      <th>Contact Person</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>City</th>
                    </tr>
                  </thead>

                  <tbody>

                    {customers.map(
                      (customer, index) => (
                        <tr
                          key={customer.id}
                        >
                          {}

                          <td>
                            {index + 1}
                          </td>

                          {}

                          <td>
                            {customer.company_name ||
                              customer.companyName ||
                              customer.name ||
                              customer.customer_name ||
                              "-"}
                          </td>

                          {}

                          <td>
                            {customer.contact_person ||
                              customer.contactPerson ||
                              "-"}
                          </td>

                          {}

                          <td>
                            {customer.mobile ||
                              customer.phone ||
                              customer.phone_number ||
                              "-"}
                          </td>

                          {}

                          <td>
                            {customer.email ||
                              "-"}
                          </td>

                          {}

                          <td>
                            {customer.city ||
                              "-"}
                          </td>
                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

        </div>
      </div>
    </Layout>
  );
}

export default Customers;