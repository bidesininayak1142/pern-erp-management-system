import { useState } from "react";
import { Check, Eye, EyeOff, Boxes, ArrowRight, AlertCircle } from "lucide-react";
import API from "../services/api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [role, setRole] = useState("ADMIN");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      const user = response.data.user;

      localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === "ADMIN") {
      setEmail("admin@example.com");
      setPassword("admin123");
      setRole("ADMIN");
    } else {
      setEmail("sales@example.com");
      setPassword("admin123");
      setRole("SALES_USER");
    }
    setErrorMessage("");
  };

  return (
    <div className="login-container">
      {}
      <div className="login-hero">
        <div className="login-hero-bg"></div>
        <div className="login-hero-glow"></div>

        {}
        <div className="login-brand">
          <div className="login-brand-logo">
            <Boxes size={24} />
          </div>
          <div className="login-brand-text">
            <h2>ERP System</h2>
            <p>Manufacturing & Supply</p>
          </div>
        </div>

        {}
        <div className="login-hero-content">
          <h1>Welcome Back</h1>
          <p>Sign in to access your ERP system</p>

          <div className="login-features-list">
            <div className="login-feature-item">
              <div className="feature-check-icon">
                <Check size={16} strokeWidth={3} />
              </div>
              <span>Manage Enquiries</span>
            </div>

            <div className="login-feature-item">
              <div className="feature-check-icon">
                <Check size={16} strokeWidth={3} />
              </div>
              <span>Generate Quotations</span>
            </div>

            <div className="login-feature-item">
              <div className="feature-check-icon">
                <Check size={16} strokeWidth={3} />
              </div>
              <span>Process Sales Orders</span>
            </div>

            <div className="login-feature-item">
              <div className="feature-check-icon">
                <Check size={16} strokeWidth={3} />
              </div>
              <span>Track Inventory</span>
            </div>

            <div className="login-feature-item">
              <div className="feature-check-icon">
                <Check size={16} strokeWidth={3} />
              </div>
              <span>Dispatch Orders</span>
            </div>
          </div>
        </div>

        {}
        <div className="login-hero-footer">
          <p>© 2026 ERP System. Enterprise Resource Planning.</p>
        </div>
      </div>

      {}
      <div className="login-form-section">
        <div className="login-card-container">
          <div className="login-card-header">
            <h2>Login to ERP</h2>
            <p>Enter your credentials to continue</p>
          </div>

          {errorMessage && (
            <div className="login-error-alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="login-form-group">
              <label htmlFor="email">Email</label>
              <div className="login-input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-form-group">
              <label htmlFor="role">Role</label>
              <div className="login-input-wrapper">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SALES_USER">Sales User</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="login-btn-submit"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login"}
              <ArrowRight size={18} />
            </button>
          </form>

          {}
          <div className="login-demo-accounts">
            <div className="login-demo-title">Quick Demo Login</div>
            <div className="login-demo-pills">
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleFillDemo("ADMIN")}
              >
                Admin (admin@example.com)
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleFillDemo("SALES_USER")}
              >
                Sales (sales@example.com)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;