import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api/students";

const EMPTY_FORM = {
  studentId: "",
  name: "",
  email: "",
};

// Gọi API và xử lý lỗi phản hồi
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();

  // Ghi lại chi tiết để dễ tìm lỗi trong Chrome Console
  console.log("API response:", {
    requestedURL: url,
    finalURL: response.url,
    status: response.status,
    contentType,
    responseBody: body.slice(0, 500),
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;

    if (contentType.includes("application/json")) {
      try {
        const errorData = JSON.parse(body);
        message = errorData.message || message;
      } catch {
        // Giữ nguyên thông báo HTTP
      }
    } else if (body) {
      message += `: ${body.slice(0, 150)}`;
    }

    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    console.error("API không trả về JSON:", {
      requestedURL: url,
      finalURL: response.url,
      status: response.status,
      contentType,
      responseBody: body.slice(0, 500),
    });

    throw new Error(
      `API trả về dữ liệu không phải JSON. HTTP ${response.status}. ` +
      `URL: ${response.url}`
    );
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error("Backend trả về JSON không hợp lệ.");
  }
}

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Lấy danh sách sinh viên
  async function fetchStudents() {
    try {
      const data = await apiRequest(API_URL);

      if (!Array.isArray(data)) {
        throw new Error(
          "API không trả về danh sách sinh viên dạng mảng."
        );
      }

      setStudents(data);
      setMessage("");
    } catch (error) {
      console.error("Fetch students error:", error);
      setMessage(`❌ ${error.message}`);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // Xử lý thay đổi form
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Thêm hoặc cập nhật sinh viên
  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.studentId.trim() ||
      !form.name.trim() ||
      !form.email.trim()
    ) {
      setMessage("⚠️ Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const url = editingId
        ? `${API_URL}/${encodeURIComponent(editingId)}`
        : API_URL;

      await apiRequest(url, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          studentId: form.studentId.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
        }),
      });

      setMessage(
        editingId
          ? "✅ Cập nhật sinh viên thành công!"
          : "✅ Thêm sinh viên thành công!"
      );

      setForm(EMPTY_FORM);
      setEditingId(null);

      await fetchStudents();
    } catch (error) {
      console.error("Save student error:", error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Chỉnh sửa sinh viên
  function handleEdit(student) {
    setEditingId(student._id);

    setForm({
      studentId: student.studentId || "",
      name: student.name || "",
      email: student.email || "",
    });

    setMessage("✏️ Đang chỉnh sửa sinh viên.");
  }

  // Xóa sinh viên
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa sinh viên này không?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setMessage("");

      await apiRequest(
        `${API_URL}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      setMessage("✅ Xóa sinh viên thành công!");

      if (editingId === id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
      }

      await fetchStudents();
    } catch (error) {
      console.error("Delete student error:", error);
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Hủy chỉnh sửa
  function handleCancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
  }

  return (
    <div className="container">
      <h1>Student Management v2.0</h1>

      <div className="form-box">
        <h2>
          {editingId ? "Cập nhật sinh viên" : "Thêm sinh viên"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="studentId"
            placeholder="MSSV"
            value={form.studentId}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="name"
            placeholder="Họ tên"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Đang xử lý..."
              : editingId
              ? "Cập nhật"
              : "Thêm sinh viên"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Hủy sửa
            </button>
          )}
        </form>

        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}
      </div>

      <div className="students-box">
        <h2>Danh sách sinh viên</h2>

        {students.length === 0 ? (
          <p>Chưa có sinh viên.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleEdit(student)}
                      disabled={loading}
                    >
                      Sửa
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(student._id)}
                      disabled={loading}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;