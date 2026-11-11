import { useState } from "react";
import axios from "axios";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "https://anas044-attendance-nodejs.hf.space/api/login",
        form,
        { withCredentials: true } // IMPORTANT for cookies
      );

      if (res.status === 200) {
        alert("Login successful!");
        navigate("/");      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Login</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input"
          onChange={handleChange}
          required
        />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
        <p className="signup-link">
            Forgor your password <a href="/password-reset">Reset your password</a>
          </p>
      </form>
    </div>
  );
}
