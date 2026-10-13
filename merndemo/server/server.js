const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Student = require("./models/Students");

const app = express();

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
// CẤU HÌNH CORS
// ================================
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
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
};

app.use(cors(corsOptions));

// ================================
// MIDDLEWARE
// ================================
app.use(express.json());

// ================================
// API KIỂM TRA SERVER
// GET /api/hello
// ================================
app.get("/api/hello", (req, res) => {
  res.status(200).json({
    message: "Backend đang hoạt động!",
  });
});

// ================================
// CÂU 36: GET /api/students
// Lấy danh sách sinh viên
// ================================
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error("Lỗi GET students:", error.message);

    res.status(500).json({
      message: "Lỗi khi lấy danh sách sinh viên",
      error: error.message,
    });
  }
});

// ================================
// CÂU 37: POST /api/students
// Thêm sinh viên
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
// CÂU 38: PUT /api/students/:id
// Cập nhật sinh viên
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
// CÂU 39: DELETE /api/students/:id
// Xóa sinh viên
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
// KẾT NỐI MONGODB ATLAS
// ================================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("HTTP request logging enabled");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });