import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Câu 47: Lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");

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

  // Câu 48: Xử lý Form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Câu 49: Gửi dữ liệu POST
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.studentId || !form.name || !form.email) {
      setMessage("⚠️ Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể thêm sinh viên");
      }

      setMessage("✅ Thêm sinh viên thành công!");

      setForm({
        studentId: "",
        name: "",
        email: "",
      });

      fetchStudents();
    } catch (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Quản lý sinh viên</h1>

      {/* Câu 48 */}
      <div className="form-box">
        <h2>Thêm sinh viên</h2>

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
            {loading ? "Đang gửi..." : "Thêm sinh viên"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>

      {/* Câu 47 */}
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
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
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