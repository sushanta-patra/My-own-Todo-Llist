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
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";

import {
  ChecklistRounded,
  PersonRounded,
  EmailRounded,
  LockRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  ArrowForwardRounded,
  TaskAltRounded,
} from "@mui/icons-material";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }
      );

      console.log("Signup successful:", response.data);

      setName("");
      setEmail("");
      setPassword("");

      // Navigate to your Login page after successful signup.
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);

      setError(
        error.response?.data?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-orb signup-orb-one"></div>
      <div className="signup-orb signup-orb-two"></div>

      <Container maxWidth="md" className="signup-container">
        <Paper elevation={0} className="signup-shell">
          {/* LEFT BRAND PANEL */}
          <Box className="signup-brand-panel">
            <div className="signup-brand">
              <div className="signup-brand-icon">
                <ChecklistRounded />
              </div>

              <Typography className="signup-brand-name">
                TaskFlow
              </Typography>
            </div>

            <div className="signup-brand-content">
              <div className="signup-eyebrow">
                <AutoAwesomeIconFallback />
                <span>YOUR PRODUCTIVITY JOURNEY</span>
              </div>

              <Typography className="signup-brand-title">
                Start organizing.
                <br />
                Start achieving.
              </Typography>

              <Typography className="signup-brand-description">
                Create your account and bring your tasks, goals, and daily
                plans together in one simple workspace.
              </Typography>

              <div className="signup-benefit">
                <TaskAltRounded />
                <span>Keep all your tasks organized</span>
              </div>

              <div className="signup-benefit">
                <TaskAltRounded />
                <span>Track your daily progress</span>
              </div>

              <div className="signup-benefit">
                <TaskAltRounded />
                <span>Focus on what matters most</span>
              </div>
            </div>

            <Typography className="signup-brand-footer">
              Make every day a productive day.
            </Typography>
          </Box>

          {/* RIGHT FORM PANEL */}
          <Box className="signup-form-panel">
            <Stack
              component="form"
              onSubmit={handleSignup}
              spacing={2.3}
              className="signup-form"
            >
              <Box className="signup-mobile-logo">
                <div className="signup-brand-icon">
                  <ChecklistRounded />
                </div>

                <Typography className="signup-brand-name">
                  TaskFlow
                </Typography>
              </Box>

              <Box>
                <Typography className="signup-welcome">
                  Create your account
                </Typography>

                <Typography className="signup-subtitle">
                  Sign up to get started with your personal task manager.
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" className="signup-alert">
                  {error}
                </Alert>
              )}

              <TextField
                label="Full name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                autoComplete="name"
                disabled={loading}
                className="signup-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonRounded />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoComplete="email"
                disabled={loading}
                className="signup-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRounded />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="new-password"
                disabled={loading}
                className="signup-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRounded />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        disabled={loading}
                      >
                        {showPassword ? (
                          <VisibilityOffRounded />
                        ) : (
                          <VisibilityRounded />
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
                className="signup-submit-button"
                endIcon={
                  loading ? null : <ArrowForwardRounded />
                }
              >
                {loading ? (
                  <CircularProgress size={23} color="inherit" />
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="signup-divider">
                <span>ALREADY A MEMBER?</span>
              </div>

              <Button
                type="button"
                variant="outlined"
                fullWidth
                disabled={loading}
                className="signup-login-button"
                onClick={() => navigate("/")}
              >
                Log In to Your Account
              </Button>

              <Typography className="signup-terms">
                By creating an account, you can start managing your tasks
                in one place.
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}

// Small decorative icon for the left panel.
function AutoAwesomeIconFallback() {
  return <TaskAltRounded />;
}

export default SignUp;