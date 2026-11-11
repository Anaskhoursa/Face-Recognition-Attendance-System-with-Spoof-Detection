const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
const http = require("http");
const { setupSocketIO } = require("./websocket");

const app = express();
const server = http.createServer(app);
setupSocketIO(server);

// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(cookieParser());

// --------------------
// API routes (FIRST)
// --------------------
app.use("/api", require("./routes/routes.js"));

// --------------------
// Serve Vite build
// --------------------
const __dirnameResolved = path.resolve();
app.use(express.static(path.join(__dirnameResolved, "dist")));

// --------------------
// SPA fallback (CRITICAL)
// --------------------
app.get((req, res) => {
  res.sendFile(path.join(__dirnameResolved, "dist", "index.html"));
});

// --------------------
// Start server
// --------------------
const PORT = 7860;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
