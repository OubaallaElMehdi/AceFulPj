import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './signup.css';
import LoginImage from '../../assets/login.png';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_USER');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const signupData = {
      username,
      email,
      password,
      roles: [{ name: role }],
    };

    try {
      const response = await fetch('http://localhost:8082/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const responseText = await response.text();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'User registered successfully!',
          text: 'Your account has been created.',
          confirmButtonText: 'OK',
        }).then(() => {
          window.location.href = '/login';
        });
      } else {
        let errorResponse;
        try {
          errorResponse = JSON.parse(responseText);
        } catch {
          errorResponse = { message: responseText };
        }
        Swal.fire({
          icon: 'error',
          title: 'Signup Error',
          text: errorResponse.message || 'An error occurred during signup.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      Swal.fire({
        icon: 'error',
        title: 'An error occurred',
        text: 'Please try again later.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="ROLE_USER">User</option>
              <option value="ROLE_ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="signup-button">
            Sign up
          </button>
        </form>
        <div className="options">
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
      <div className="signup-right">
        <img src={LoginImage} alt="Signup Illustration" className="signup-image" />
      </div>
    </div>
  );
}

export default Signup;
