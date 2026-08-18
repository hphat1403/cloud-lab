const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./models/Students");

const app = express();

app.use(express.json());


// API kiểm tra server
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Backend đang hoạt động!"
  });
});


// ================================
// CÂU 36: GET /api/students
// ================================
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sinh viên",
      error: error.message
    });
  }
});


// ================================
// CÂU 37: POST /api/students
// ================================
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({
      message: "Lỗi khi thêm sinh viên",
      error: error.message
    });
  }
});


// ================================
// CÂU 38: PUT /api/students/:id
// ================================
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên"
      });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({
      message: "Lỗi khi cập nhật sinh viên",
      error: error.message
    });
  }
});


// ================================
// CÂU 39: DELETE /api/students/:id
// ================================
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên"
      });
    }

    res.status(200).json({
      message: "Xóa sinh viên thành công",
      student
    });
  } catch (error) {
    res.status(400).json({
      message: "Lỗi khi xóa sinh viên",
      error: error.message
    });
  }
});


// Kết nối MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });