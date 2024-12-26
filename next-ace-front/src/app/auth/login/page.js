"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);

    // Check credentials
    if (email === "admin@gmail.com" && password === "123") {
      router.push("/admin/home");
    } 
    else if (email === "client@gmail.com" && password === "123"){
      router.push("/client/home");
    }
    else {
      alert("Invalid credentials");
    }
  };

  return (
      <div className={styles.container}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button}>
            Login
          </button>
        </form>
      </div>
  );
};

export default Login;
