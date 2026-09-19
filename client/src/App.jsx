import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách sinh viên");
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
      setMessage("❌ Không thể kết nối Backend API");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.studentId || !form.name || !form.email) {
      setMessage("⚠️ Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingId
              ? "Không thể cập nhật sinh viên"
              : "Không thể thêm sinh viên")
        );
      }

      setMessage(
        editingId
          ? "✅ Cập nhật sinh viên thành công!"
          : "✅ Thêm sinh viên thành công!"
      );

      setForm({
        studentId: "",
        name: "",
        email: "",
      });

      setEditingId(null);

      await fetchStudents();
    } catch (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);

    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    });

    setMessage("✏️ Đang chỉnh sửa sinh viên");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa sinh viên này không?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Không thể xóa sinh viên"
        );
      }

      setMessage("✅ Xóa sinh viên thành công!");

      if (editingId === id) {
        setEditingId(null);
        setForm({
          studentId: "",
          name: "",
          email: "",
        });
      }

      await fetchStudents();
    } catch (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      studentId: "",
      name: "",
      email: "",
    });

    setMessage("");
  };

  return (
    <div className="container">
      <h1>Student Management</h1>

      <div className="form-box">
        <h2>
          {editingId
            ? "Cập nhật sinh viên"
            : "Thêm sinh viên"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="studentId"
            placeholder="MSSV"
            value={form.studentId}
            onChange={handleChange}
          />

          <input
            type="text"
            name="name"
            placeholder="Họ tên"
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
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
          <p className="message">{message}</p>
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
                      onClick={() => handleEdit(student)}
                      disabled={loading}
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(student._id)
                      }
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
