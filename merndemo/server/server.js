const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Student = require("./models/Students");

const app = express();
const APP_VERSION = "2.0";

// ================================
// LOG HTTP REQUEST
// ================================
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    console.log(
      `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${Date.now() - startTime}ms`
    );
  });

  next();
});

// ================================
// CORS
// ================================
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }

      return callback(new Error("Origin không được phép bởi CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ================================
// CÂU 44: HEALTH CHECK
// GET /health
// ================================
app.get("/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "UP" : "DOWN",
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: databaseConnected ? "connected" : "disconnected",
  });
});

// ================================
// API VERSION
// GET /api/hello
// ================================
app.get("/api/hello", (req, res) => {
  res.status(200).json({
    message: "Backend đang hoạt động!",
    version: APP_VERSION,
  });
});

// ================================
// GET /api/students
// LẤY DANH SÁCH SINH VIÊN
// ================================
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error("Lỗi GET students:", error.message);

    res.status(500).json({
      message: "Lỗi khi lấy danh sách sinh viên",
    });
  }
});

// ================================
// POST /api/students
// THÊM SINH VIÊN
// ================================
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    console.error("Lỗi POST student:", error.message);

    res.status(400).json({
      message: "Lỗi khi thêm sinh viên",
      error: error.message,
    });
  }
});

// ================================
// PUT /api/students/:id
// CẬP NHẬT SINH VIÊN
// ================================
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên",
      });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Lỗi PUT student:", error.message);

    res.status(400).json({
      message: "Lỗi khi cập nhật sinh viên",
      error: error.message,
    });
  }
});

// ================================
// DELETE /api/students/:id
// XÓA SINH VIÊN
// ================================
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên",
      });
    }

    res.status(200).json({
      message: "Xóa sinh viên thành công",
      student,
    });
  } catch (error) {
    console.error("Lỗi DELETE student:", error.message);

    res.status(400).json({
      message: "Lỗi khi xóa sinh viên",
      error: error.message,
    });
  }
});

// ================================
// CONNECT MONGODB ATLAS
// ================================
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Thiếu biến môi trường MONGODB_URI");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Application version: ${APP_VERSION}`);
      console.log("Health Check endpoint: /health");
      console.log("HTTP request logging enabled");
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();