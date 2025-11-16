import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminLogin from "./AdminLogin.jsx";
import "./index.css";

function Root() {
  const path = window.location.pathname;

  if (path.startsWith("/admin/login")) {
    return <AdminLogin />;
  }

  if (path.startsWith("/admin")) {
    return <AdminDashboard />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
