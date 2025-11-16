require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");   // <-- ADD THIS
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());  // <-- AND ADD THIS (before routes)

// Root route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// API routes
app.use("/api", apiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong", detail: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
