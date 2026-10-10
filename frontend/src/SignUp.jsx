import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error,setError]= useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name,
          email,
          password,
        }
      );

      console.log(response.data);
      
      setName("");
      setEmail("");
      setPassword("");


      navigate("/");

    } catch (error) {
      console.log(error.response?.data);
      setError(error.response?.data.message);
    }
  };

  return (
    <div>
      <div className="signUpError">{error}</div>
      <form onSubmit={handleSignup}>
        <div className="mb-2">
          <label htmlFor="user-name" className="form-label">
            Name
          </label>

          <input
            type="text"
            className="form-control"
            id="user-name"
            placeholder="Enter user name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label htmlFor="email" className="form-label">
            Email
          </label>

          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter your email Id..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label htmlFor="password" className="form-label">
            Password
          </label>

          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignUp;