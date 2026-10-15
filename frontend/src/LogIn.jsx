import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      console.log(response.data);
      navigate("/app", {
        state: { user: response.data.user },
      });
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
          <Stack component="form" onSubmit={handleLogin} spacing={2}>
            <Typography variant="h5" align="center">
              Log In
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

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
              Log In
            </Button>

            <Button variant="text" onClick={() => navigate("/signup")}>
              Don't have an account? Sign Up
            </Button>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}

export default Login;