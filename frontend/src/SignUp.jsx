import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        { name, email, password }
      );

      console.log(response.data);

      setName("");
      setEmail("");
      setPassword("");

      navigate("/");
    } catch (error) {
      console.log(error.response?.data);
      setError(error.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="signup-page">
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Stack component="form" onSubmit={handleSignup} spacing={2}>
          <Typography variant="h5" align="center">
            Sign Up
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Name"
            placeholder="Enter user name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Email"
            type="email"
            placeholder="Enter your email Id..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />

          <Button type="submit" variant="contained" size="large">
            Sign Up
          </Button>

          <Button variant="text" onClick={() => navigate("/signin")}>
            Already have an account? Log In
          </Button>
        </Stack>
      </Paper>
    </Container>
    </div>
  );
}

export default SignUp;