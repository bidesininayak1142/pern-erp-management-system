/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import "./Quotation.css";

function Quotation() {
  const [quotations, setQuotations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    quotationNumber: "",
    enquiryId: "",
    customerId: "",
    validUntil: "",
  });

  const [items, setItems] = useState([
    {
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      gst: 18,
    },
  ]);

  const getQuotations = async () => {
    try {
      const response = await API.get("/quotations");

      console.log("Quotation API response:", response.data);

      let quotationData = [];

      if (Array.isArray(response.data)) {
        quotationData = response.data;
      } else if (Array.isArray(response.data?.quotations)) {
        quotationData = response.data.quotations;
      } else if (Array.isArray(response.data?.data)) {
        quotationData = response.data.data;
      }

      quotationData.sort(
        (a, b) => Number(b.id) - Number(a.id)
      );

      setQuotations(quotationData);
    } catch (error) {
      console.error(
        "Get quotation error:",
        error.response?.data || error.message
      );

      setQuotations([]);

      alert(
        error.response?.data?.message ||
          "Failed to load quotations."
      );
    }
  };

  const getEnquiries = async () => {
    try {
      const response = await API.get("/enquiries");

      console.log("Enquiry API response:", response.data);

      let enquiryData = [];

      if (Array.isArray(response.data)) {
        enquiryData = response.data;
      } else if (Array.isArray(response.data?.enquiries)) {
        enquiryData = response.data.enquiries;
      } else if (Array.isArray(response.data?.data)) {
        enquiryData = response.data.data;
      }

      setEnquiries(enquiryData);
    } catch (error) {
      console.error(
        "Get enquiries error:",
        error.response?.data || error.message
      );

      setEnquiries([]);

      alert(
        error.response?.data?.message ||
          "Failed to load enquiries."
      );
    }
  };
  const getProducts = async () => {
    try {
      const response = await API.get("/inventory");

      console.log("Inventory response:", response.data);

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

      alert(
        error.response?.data?.message ||
          "Failed to load products."
      );
    }
  };
  useEffect(() => {
    getQuotations();
    getEnquiries();
    getProducts();
  }, []);
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEnquiryChange = (e) => {
    const enquiryId = e.target.value;

    const selectedEnquiry = enquiries.find(
      (enquiry) =>
        String(enquiry.id) === String(enquiryId)
    );

    if (!selectedEnquiry) {
      setForm((previous) => ({
        ...previous,
        enquiryId: "",
        customerId: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      enquiryId: String(selectedEnquiry.id),
      customerId: String(selectedEnquiry.customer_id),
    }));
  };

  const handleProductChange = (index, e) => {
    const productId = e.target.value;

    const selectedProduct = products.find(
      (product) =>
        String(product.product_id) ===
        String(productId)
    );

    setItems((previousItems) =>
      previousItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (!selectedProduct) {
          return {
            ...item,
            productId: "",
            productName: "",
            unitPrice: 0,
          };
        }

        return {
          ...item,
          productId: productId,
          productName:
            selectedProduct.product_name || "",
          unitPrice:
            Number(selectedProduct.base_price) || 0,
        };
      })
    );
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;

    setItems((previousItems) =>
      previousItems.map((item, itemIndex) => {
        if (itemIndex === index) {
          return {
            ...item,
            [name]: value,
          };
        }

        return item;
      })
    );
  };

  const addItem = () => {
    setItems((previousItems) => [
      ...previousItems,
      {
        productId: "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        gst: 18,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      alert("At least one product is required.");
      return;
    }

    setItems((previousItems) =>
      previousItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const calculateLineAmount = (item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const gst = Number(item.gst) || 0;

    const baseAmount = quantity * unitPrice;

    const discountAmount =
      baseAmount * (discount / 100);

    const amountAfterDiscount =
      baseAmount - discountAmount;

    const gstAmount =
      amountAfterDiscount * (gst / 100);

    return amountAfterDiscount + gstAmount;
  };

  const grandTotal = items.reduce(
    (total, item) =>
      total + calculateLineAmount(item),
    0
  );

  const createQuotation = async (e) => {
    e.preventDefault();

    if (!form.quotationNumber.trim()) {
      alert("Quotation Number is required.");
      return;
    }

    if (!form.enquiryId) {
      alert("Please select an enquiry.");
      return;
    }

    if (!form.customerId) {
      alert("Customer could not be found for this enquiry.");
      return;
    }

    if (!form.validUntil) {
      alert("Valid Until date is required.");
      return;
    }
    const selectedEnquiry = enquiries.find(
      (enquiry) =>
        String(enquiry.id) ===
        String(form.enquiryId)
    );

    if (!selectedEnquiry) {
      alert("Selected enquiry is not valid.");
      return;
    }
    if (items.length === 0) {
      alert("At least one product is required.");
      return;
    }

    for (const item of items) {
      if (!item.productId) {
        alert("Please select a valid product.");
        return;
      }

      if (!item.productName.trim()) {
        alert("Product Name is required.");
        return;
      }

      if (Number(item.quantity) <= 0) {
        alert("Quantity must be greater than 0.");
        return;
      }

      if (Number(item.unitPrice) <= 0) {
        alert("Unit Price must be greater than 0.");
        return;
      }

      if (
        Number(item.discount) < 0 ||
        Number(item.discount) > 100
      ) {
        alert(
          "Discount must be between 0 and 100."
        );
        return;
      }

      if (
        Number(item.gst) < 0 ||
        Number(item.gst) > 100
      ) {
        alert(
          "GST must be between 0 and 100."
        );
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        quotation_number:
          form.quotationNumber.trim(),

        enquiry_id: Number(form.enquiryId),

        customer_id: Number(form.customerId),

        valid_until: form.validUntil,

        status: "DRAFT",

        items: items.map((item) => ({
          product_id: Number(item.productId),

          product_name:
            item.productName.trim(),

          quantity: Number(item.quantity),

          unit_price: Number(item.unitPrice),

          discount_percent:
            Number(item.discount),

          gst_percent:
            Number(item.gst),
        })),
      };

      console.log(
        "Sending quotation payload:",
        payload
      );

      const response = await API.post(
        "/quotations",
        payload
      );

      console.log(
        "Quotation created:",
        response.data
      );

      alert(
        "Quotation created successfully."
      );
      setForm({
        quotationNumber: "",
        enquiryId: "",
        customerId: "",
        validUntil: "",
      });

      setItems([
        {
          productId: "",
          productName: "",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          gst: 18,
        },
      ]);

      await getQuotations();
      await getEnquiries();

    } catch (error) {
      console.error(
        "Create quotation error:",
        error.response?.data ||
          error.message
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to create quotation."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(
        `/quotations/${id}/status`,
        {
          status,
        }
      );

      alert(
        `Quotation status changed to ${status}.`
      );

      await getQuotations();

    } catch (error) {
      console.error(
        "Status update error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update quotation status."
      );
    }
  };

  const convertToOrder = async (id) => {
    try {
      await API.post(
        `/quotations/${id}/convert`
      );

      alert(
        "Sales Order created successfully."
      );

      await getQuotations();

    } catch (error) {
      console.error(
        "Convert quotation error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Quotation cannot be converted."
      );
    }
  };
  const selectedCustomer = enquiries.find(
    (enquiry) =>
      String(enquiry.id) ===
      String(form.enquiryId)
  );

  return (
    <Layout>
      <div className="quotation-page">

        {}

        <div className="page-header">
          <div>
            <h1>Quotations</h1>

            <p>
              Create and manage customer
              quotations
            </p>
          </div>
        </div>

        {}

        <div className="form-card">

          <div className="quotation-card-header">

            <div>
              <h2>Create Quotation</h2>

              <p>
                Create quotation against
                an enquiry
              </p>
            </div>

            <span className="draft-badge">
              DRAFT
            </span>

          </div>

          <form onSubmit={createQuotation}>

            {}

            <div className="form-grid">

              {}

              <div className="form-group">
                <label>
                  Quotation Number
                </label>

                <input
                  type="text"
                  name="quotationNumber"
                  placeholder="QT-1001"
                  value={
                    form.quotationNumber
                  }
                  onChange={
                    handleFormChange
                  }
                  required
                />
              </div>

              {}

              <div className="form-group">
                <label>
                  Enquiry Reference
                </label>

                <select
                  name="enquiryId"
                  value={form.enquiryId}
                  onChange={
                    handleEnquiryChange
                  }
                  required
                >

                  <option value="">
                    Select Enquiry
                  </option>

                  {enquiries.map(
                    (enquiry) => (
                      <option
                        key={enquiry.id}
                        value={enquiry.id}
                      >
                        {enquiry.enquiry_number}
                        {" - "}
                        {enquiry.company_name}
                      </option>
                    )
                  )}

                </select>

                {enquiries.length === 0 && (
                  <small>
                    No enquiries available.
                    Create an enquiry first.
                  </small>
                )}
              </div>

              {}

              <div className="form-group">
                <label>
                  Customer
                </label>

                <input
                  type="text"
                  value={
                    selectedCustomer
                      ?.company_name || ""
                  }
                  placeholder="Customer will be selected automatically"
                  readOnly
                />

                {selectedCustomer && (
                  <small>
                    Customer ID:{" "}
                    {selectedCustomer.customer_id}
                  </small>
                )}
              </div>

              {}

              <div className="form-group">
                <label>
                  Valid Until
                </label>

                <input
                  type="date"
                  name="validUntil"
                  value={form.validUntil}
                  onChange={
                    handleFormChange
                  }
                  required
                />
              </div>

            </div>

            {}

            <div className="products-header">

              <div>
                <h3>
                  Quotation Products
                </h3>

                <p>
                  Select valid products
                  from inventory
                </p>
              </div>

              <button
                type="button"
                className="add-product-button"
                onClick={addItem}
              >
                + Add Product
              </button>

            </div>

            {}

            {items.map(
              (item, index) => {

                const lineAmount =
                  calculateLineAmount(
                    item
                  );

                return (
                  <div
                    className="quotation-item"
                    key={index}
                  >

                    <div className="item-number">
                      {index + 1}
                    </div>

                    <div className="item-fields">

                      {/* PRODUCT */}

                      <div className="form-group">
                        <label>
                          Product
                        </label>

                        <select
                          name="productId"
                          value={
                            item.productId
                          }
                          onChange={(e) =>
                            handleProductChange(
                              index,
                              e
                            )
                          }
                          required
                        >

                          <option value="">
                            Select Product
                          </option>

                          {products.map(
                            (product) => {

                              const productId =
                                product.product_id;

                              const productCode =
                                product.product_code ||
                                "";

                              const productName =
                                product.product_name ||
                                "";

                              const available =
                                Number(
                                  product.available_quantity
                                ) || 0;

                              return (
                                <option
                                  key={
                                    productId
                                  }
                                  value={
                                    productId
                                  }
                                >
                                  {productCode} -{" "}
                                  {productName}{" "}
                                  (Available:{" "}
                                  {available})
                                </option>
                              );
                            }
                          )}

                        </select>

                        {products.length === 0 && (
                          <small>
                            No valid products
                            available in
                            inventory.
                          </small>
                        )}
                      </div>

                      {}

                      <div className="form-group">
                        <label>
                          Quantity
                        </label>

                        <input
                          type="number"
                          name="quantity"
                          min="1"
                          value={
                            item.quantity
                          }
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              e
                            )
                          }
                          required
                        />
                      </div>

                {}

                      <div className="form-group">
                        <label>
                          Unit Price
                        </label>

                        <input
                          type="number"
                          name="unitPrice"
                          min="0"
                          step="0.01"
                          value={
                            item.unitPrice
                          }
                          readOnly
                        />
                      </div>

                      {}

                      <div className="form-group">
                        <label>
                          Discount %
                        </label>

                        <input
                          type="number"
                          name="discount"
                          min="0"
                          max="100"
                          step="0.01"
                          value={
                            item.discount
                          }
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              e
                            )
                          }
                        />
                      </div>

                      {}

                      <div className="form-group">
                        <label>
                          GST %
                        </label>

                        <input
                          type="number"
                          name="gst"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.gst}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              e
                            )
                          }
                        />
                      </div>

                      {}

                      <div className="form-group">
                        <label>
                          Line Amount
                        </label>

                        <div className="line-amount">
                          ₹
                          {lineAmount.toFixed(
                            2
                          )}
                        </div>
                      </div>

                    </div>

                    {}

                    <button
                      type="button"
                      className="remove-product-button"
                      onClick={() =>
                        removeItem(index)
                      }
                    >
                      Remove
                    </button>

                  </div>
                );
              }
            )}

            {}

            <div className="quotation-total">

              <div>
                <span>
                  Grand Total
                </span>

                <strong>
                  ₹
                  {grandTotal.toFixed(2)}
                </strong>
              </div>

              <small>
                Final amount will be
                calculated and validated
                by the backend.
              </small>

            </div>

            {}

            <button
              type="submit"
              className="create-quotation-button"
              disabled={
                loading ||
                products.length === 0 ||
                enquiries.length === 0
              }
            >
              {loading
                ? "Creating..."
                : "Create Quotation"}
            </button>

          </form>
        </div>

        {}

        <div className="table-card">

          <div className="table-card-header">

            <div>
              <h2>
                Quotation List
              </h2>

              <p>
                Manage quotation status
              </p>
            </div>

            <span className="quotation-count">
              {quotations.length} Quotations
            </span>

          </div>

          {quotations.length === 0 ? (

            <div className="empty-message">

              <h3>
                No quotations found
              </h3>

              <p>
                Create your first
                quotation against an
                enquiry.
              </p>

            </div>

          ) : (

            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Quotation No.</th>
                    <th>Enquiry</th>
                    <th>Customer</th>
                    <th>Grand Total</th>
                    <th>Valid Until</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {quotations.map(
                    (item, index) => {

                      const status =
                        String(
                          item.status ||
                            "DRAFT"
                        ).toUpperCase();

                      return (
                        <tr
                          key={item.id}
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            {item.quotationNumber ||
                              item.quotation_number ||
                              "-"}
                          </td>

                          <td>
                            {item.enquiryNumber ||
                              item.enquiry_number ||
                              item.enquiryId ||
                              item.enquiry_id ||
                              "-"}
                          </td>

                          <td>
                            {item.customerName ||
                              item.customer_name ||
                              item.company_name ||
                              "-"}
                          </td>

                          <td>
                            ₹
                            {Number(
                              item.grandTotal ||
                                item.grand_total ||
                                0
                            ).toFixed(2)}
                          </td>

                          <td>
                            {item.validUntil ||
                              item.valid_until ||
                              "-"}
                          </td>

                          <td>

                            <span
                              className={`status-badge status-${status.toLowerCase()}`}
                            >
                              {status}
                            </span>

                          </td>

                          <td>

                            {status ===
                              "DRAFT" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(
                                    item.id,
                                    "SENT"
                                  )
                                }
                              >
                                Send
                              </button>
                            )}

                            {status ===
                              "SENT" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "ACCEPTED"
                                    )
                                  }
                                >
                                  Accept
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "REJECTED"
                                    )
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {status ===
                              "ACCEPTED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  convertToOrder(
                                    item.id
                                  )
                                }
                              >
                                Convert
                              </button>
                            )}

                          </td>

                        </tr>
                      );
                    }
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

export default Quotation;