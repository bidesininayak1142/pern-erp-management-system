
import { useState } from "react";
import Layout from "../components/Layout";
import "./Settings.css";

function Settings() {
  const [activeSetting, setActiveSetting] = useState(null);

  const openSetting = (setting) => {
    setActiveSetting(setting);
  };

  const closeSetting = () => {
    setActiveSetting(null);
  };

  return (
    <Layout>
      <div className="settings-page">

        {/* Header */}
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your ERP system settings</p>
        </div>

        {/* Account Settings */}
        <div className="settings-card">
          <h2>Account Settings</h2>

          {/* Profile */}
          <div className="setting-row">
            <div>
              <h3>Profile</h3>
              <p>Manage your account information.</p>
            </div>

            <button
              type="button"
              onClick={() => openSetting("profile")}
            >
              Edit
            </button>
          </div>

          {/* Password */}
          <div className="setting-row">
            <div>
              <h3>Password</h3>
              <p>Change your account password.</p>
            </div>

            <button
              type="button"
              onClick={() => openSetting("password")}
            >
              Change
            </button>
          </div>

          {/* Notifications */}
          <div className="setting-row">
            <div>
              <h3>Notifications</h3>
              <p>Manage system notifications.</p>
            </div>

            <button
              type="button"
              onClick={() => openSetting("notifications")}
            >
              Manage
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-card">
          <h2>System Settings</h2>

          {/* Company Information */}
          <div className="setting-row">
            <div>
              <h3>Company Information</h3>
              <p>Manage company details used in the ERP system.</p>
            </div>

            <button
              type="button"
              onClick={() => openSetting("company")}
            >
              Manage
            </button>
          </div>

          {/* ERP Preferences */}
          <div className="setting-row">
            <div>
              <h3>ERP Preferences</h3>
              <p>Configure general ERP preferences.</p>
            </div>

            <button
              type="button"
              onClick={() => openSetting("preferences")}
            >
              Manage
            </button>
          </div>
        </div>

        {/* Popup */}
        {activeSetting && (
          <div
            className="settings-modal-overlay"
            onClick={closeSetting}
          >
            <div
              className="settings-modal"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Close Button */}
              <button
                type="button"
                className="modal-close"
                onClick={closeSetting}
              >
                ×
              </button>

              {/* Profile */}
              {activeSetting === "profile" && (
                <>
                  <h2>Edit Profile</h2>

                  <div className="settings-form">
                    <label>Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                    />

                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                    />

                    <label>Phone</label>
                    <input
                      type="text"
                      placeholder="Enter phone number"
                    />

                    <button
                      type="button"
                      className="save-button"
                      onClick={closeSetting}
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* Password */}
              {activeSetting === "password" && (
                <>
                  <h2>Change Password</h2>

                  <div className="settings-form">
                    <label>Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                    />

                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                    />

                    <label>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                    />

                    <button
                      type="button"
                      className="save-button"
                      onClick={closeSetting}
                    >
                      Change Password
                    </button>
                  </div>
                </>
              )}

              {/* Notifications */}
              {activeSetting === "notifications" && (
                <>
                  <h2>Notification Settings</h2>

                  <div className="settings-options">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        defaultChecked
                      />
                      Email Notifications
                    </label>

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        defaultChecked
                      />
                      Order Notifications
                    </label>

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        defaultChecked
                      />
                      Inventory Alerts
                    </label>

                    <label className="checkbox-row">
                      <input type="checkbox" />
                      Marketing Notifications
                    </label>

                    <button
                      type="button"
                      className="save-button"
                      onClick={closeSetting}
                    >
                      Save Settings
                    </button>
                  </div>
                </>
              )}

              {/* Company Information */}
              {activeSetting === "company" && (
                <>
                  <h2>Company Information</h2>

                  <div className="settings-form">
                    <label>Company Name</label>
                    <input
                      type="text"
                      placeholder="Enter company name"
                    />

                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="Enter company email"
                    />

                    <label>Phone</label>
                    <input
                      type="text"
                      placeholder="Enter company phone"
                    />

                    <label>Address</label>
                    <textarea
                      rows="3"
                      placeholder="Enter company address"
                    ></textarea>

                    <button
                      type="button"
                      className="save-button"
                      onClick={closeSetting}
                    >
                      Save Company Information
                    </button>
                  </div>
                </>
              )}

              {/* ERP Preferences */}
              {activeSetting === "preferences" && (
                <>
                  <h2>ERP Preferences</h2>

                  <div className="settings-options">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        defaultChecked
                      />
                      Enable Email Alerts
                    </label>

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        defaultChecked
                      />
                      Show Inventory Alerts
                    </label>

                    <label className="checkbox-row">
                      <input type="checkbox" />
                      Enable Automatic Reports
                    </label>

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        defaultChecked
                      />
                      Show Dashboard Notifications
                    </label>

                    <button
                      type="button"
                      className="save-button"
                      onClick={closeSetting}
                    >
                      Save Preferences
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Settings;
