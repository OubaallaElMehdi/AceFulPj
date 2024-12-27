"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import AuthService from "@/services/AuthService"; // Adjust the path based on your project structure

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    try {
      const data = await AuthService.login(username, password);

      // Save the token in cookies
      Cookies.set("token", data.token);
      Cookies.set("loggedin", true);

      // Extract role names from the roles array
      const roleNames = data.roles.map((role) => role.name);

      // Role-based redirection
      if (roleNames.includes("ROLE_ADMIN")) {
        router.push("/admin/home");
      } else if (roleNames.includes("ROLE_USER")) {
        router.push("/client/home");
      } else {
        setError("Unauthorized role");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
      <div className="login-container">
        {/* Animated Background */}
        <div className="animated-background"></div>

        {/* Login Form */}
        <div className="container mt-5 p-4 border rounded shadow-sm" style={{ maxWidth: "400px", position: "relative", zIndex: 1 }}>
          <h1 className="text-center mb-4">Login</h1>
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {error && <div className="alert alert-danger">{error}</div>}
            <div>
              <label htmlFor="username" className="form-label">
                Username:
              </label>
              <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  required
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label">
                Password:
              </label>
              <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>

        {/* Styles */}
        <style jsx>{`
          .login-container {
            position: relative;
            height: 100vh;
            width: 100%;
            overflow: hidden;
          }

          .animated-background {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, rgba(0, 0, 0, 0.9) 0%, rgba(50, 50, 50, 0.8) 50%, rgba(0, 0, 0, 0.9) 100%);
            background-size: 200% 200%;
            animation: animateBackground 6s linear infinite;
            z-index: 0;
          }

          @keyframes animateBackground {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .container {
            background-color: rgba(255, 255, 255, 0.41);
            z-index: 1;
          }
        `}</style>
      </div>
  );
};

export default Login;
