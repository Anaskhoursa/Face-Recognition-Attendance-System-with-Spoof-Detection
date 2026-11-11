import { useState } from "react";
import axios from "axios";
import "./Signup.css";

export default function Signup() {
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "student",
  });
  const [code, setCode] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("https://anas044-attendance-nodejs.hf.space/api/signup", form);

      if (res.status === 201) {
        alert("Account created successfully!");
        window.location.href = "/login";
      }
    } catch (err) {
      
        alert(err.response?.data?.message || "Error");
      
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("https://anas044-attendance-nodejs.hf.space/api/signup", {
        ...form,
        code,
      });

      if (res.status === 200) {
        alert("Account created successfully!");
        window.location.href = "/login";
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">

      {step === "form" && (
        <form className="signup-form" onSubmit={handleSignup}>
          <h1>Create Account</h1>

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="input"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
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
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <p className="signup-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      )}

      {step === "verify" && (
        <form className="signup-form" onSubmit={handleVerify}>
          <h1>Email Verification</h1>
          <p>Enter the 6-digit code sent to:</p>
          <p className="email-preview">{form.email}</p>

          <input
            type="text"
            maxLength={6}
            placeholder="Verification Code"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
