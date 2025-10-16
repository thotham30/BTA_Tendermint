const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();

console.log(process.env.FRONTEND_URL);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Adjust as needed
    credentials: true,
  })
);
app.use(express.json());
// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
