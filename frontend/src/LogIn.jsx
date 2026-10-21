import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login.css";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email.trim(),
          password,
        },
        {
          withCredentials: true,
        }
      );

      const loggedInUser = response.data.user;

      // Redirect based on the role returned by the backend
      const destination =
        loggedInUser.role === "admin" ? "/admin" : "/app";

      navigate(destination, {
        replace: true,
        state: {
          user: loggedInUser,
        },
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to log in. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-page">
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />
      <div className="login-orb login-orb-three" />

      <Container maxWidth="md" className="login-container">
        <Paper elevation={0} className="login-shell">
          {/* Left branding section */}
          <Box className="login-visual">
            <div className="visual-circle visual-circle-one" />
            <div className="visual-circle visual-circle-two" />

            <Box className="brand-content">
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                className="brand-logo"
              >
                <Box className="brand-logo-icon">
                  <ChecklistRoundedIcon />
                </Box>

                <Typography variant="h6" fontWeight={800}>
                  TodoFlow
                </Typography>
              </Stack>

              <Box className="brand-message">
                <Typography className="brand-eyebrow">
                  YOUR PERSONAL WORKSPACE
                </Typography>

                <Typography
                  component="h1"
                  className="brand-heading"
                >
                  Turn your plans into progress.
                </Typography>

                <Typography className="brand-description">
                  Organize your tasks, stay focused, and make
                  every day more productive.
                </Typography>
              </Box>

              <Stack spacing={2} className="brand-features">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TaskAltRoundedIcon />
                  <Typography variant="body2">
                    Keep all your tasks organized
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TaskAltRoundedIcon />
                  <Typography variant="body2">
                    Track your daily progress
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TaskAltRoundedIcon />
                  <Typography variant="body2">
                    Focus on what matters most
                  </Typography>
                </Stack>
              </Stack>

              <Typography className="brand-footer">
                Small steps. Meaningful progress.
              </Typography>
            </Box>
          </Box>

          {/* Right login section */}
          <Box className="login-form-panel">
            <Box className="login-form-content">
              <Box className="mobile-logo">
                <Box className="brand-logo-icon">
                  <ChecklistRoundedIcon />
                </Box>
                <Typography fontWeight={800} variant="h6">
                  TodoFlow
                </Typography>
              </Box>

              <Typography className="form-eyebrow">
                WELCOME BACK
              </Typography>

              <Typography
                component="h2"
                variant="h4"
                className="login-heading"
              >
                Sign in
              </Typography>

              <Typography
                color="text.secondary"
                className="login-subtitle"
              >
                Enter your details to access your workspace.
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                  sx={{ mt: 3, borderRadius: 2 }}
                >
                  {error}
                </Alert>
              )}

              <Stack
                component="form"
                onSubmit={handleLogin}
                spacing={2.5}
                sx={{ mt: 4 }}
              >
                <TextField
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  fullWidth
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  fullWidth
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? (
                            <VisibilityOffRoundedIcon />
                          ) : (
                            <VisibilityRoundedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  endIcon={
                    loading ? null : <ArrowForwardRoundedIcon />
                  }
                  className="login-submit"
                >
                  {loading ? (
                    <>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      Signing in...
                    </>
                  ) : (
                    "Sign in to your account"
                  )}
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  SECURE WORKSPACE
                </Typography>
              </Divider>

              <Button
                type="button"
                variant="outlined"
                fullWidth
                className="signup-button"
                onClick={() => navigate("/signup")}
                disabled={loading}
              >
                Don't have an account? Sign up
              </Button>

              <Typography className="login-bottom-note">
                Your productivity starts here.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;