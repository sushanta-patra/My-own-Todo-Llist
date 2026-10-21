import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const API = "http://localhost:5000/api/auth";

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [todos, setTodos] = useState([]);

  const [task, setTask] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [userSearch, setUserSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [todosLoading, setTodosLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the logged-in admin and all normal users.
  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const meResponse = await axios.get(`${API}/me`, {
          withCredentials: true,
        });

        const currentUser = meResponse.data.user;

        if (!active) return;

        if (currentUser?.role !== "admin") {
          navigate("/app", { replace: true });
          return;
        }

        setAdmin(currentUser);

        const usersResponse = await axios.get(
          `${API}/admin/users`,
          { withCredentials: true }
        );

        const usersData = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : usersResponse.data.users || [];

        if (!active) return;

        setUsers(usersData);

        if (usersData.length > 0) {
          setSelectedUserId(usersData[0]._id);
        }
      } catch (err) {
        if (!active) return;

        console.error(
          "Admin dashboard error:",
          err.response?.data || err.message
        );

        if (err.response?.status === 401) {
          navigate("/", { replace: true });
        } else if (err.response?.status === 403) {
          navigate("/app", { replace: true });
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load the admin dashboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Fetch the selected user's tasks.
  useEffect(() => {
    let active = true;

    if (!selectedUserId) {
      setTodos([]);
      setTodosLoading(false);

      return () => {
        active = false;
      };
    }

    const loadUserTodos = async () => {
      setTodosLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${API}/admin/users/${selectedUserId}/todos`,
          { withCredentials: true }
        );

        if (active) {
          const todosData = Array.isArray(response.data)
            ? response.data
            : response.data.todos || [];

          setTodos(todosData);
        }
      } catch (err) {
        if (!active) return;

        console.error(
          "Fetch user tasks error:",
          err.response?.data || err.message
        );

        setTodos([]);

        setError(
          err.response?.data?.message ||
            "Unable to load this user's tasks."
        );
      } finally {
        if (active) setTodosLoading(false);
      }
    };

    loadUserTodos();

    return () => {
      active = false;
    };
  }, [selectedUserId]);

  // Currently selected user.
  const selectedUser = users.find(
    (item) => item._id === selectedUserId
  );

  // Search users by name or email.
  const filteredUsers = users.filter((item) => {
    const query = userSearch.toLowerCase();

    return (
      (item.name || "").toLowerCase().includes(query) ||
      (item.email || "").toLowerCase().includes(query)
    );
  });

  // Statistics for the selected user's tasks.
  const completedCount = todos.filter(
    (todo) => todo.isDone
  ).length;

  const pendingCount = todos.length - completedCount;

  const progress = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0;

  // Select a user and exit edit mode if necessary.
  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setTask("");
    setTaskId(null);
    setError("");
    setSuccess("");
  };

  // Add a new task OR update an existing task.
  const handleAssignTask = async (event) => {
    event.preventDefault();

    const title = task.trim();

    if (!selectedUserId) {
      setError("Please select a user first.");
      return;
    }

    if (!title) {
      setError("Please enter a task title.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (taskId !== null) {
        // Update the selected user's existing task.
        const response = await axios.patch(
          `${API}/todos/edit/${taskId}`,
          { title },
          { withCredentials: true }
        );

        setTodos((previous) =>
          previous.map((todo) =>
            todo._id === taskId ? response.data : todo
          )
        );

        setSuccess("Task updated successfully.");
      } else {
        // Create a task assigned to the selected user.
        const response = await axios.post(
          `${API}/todos`,
          {
            title,
            assignedUserId: selectedUserId,
          },
          { withCredentials: true }
        );

        const createdTodo = response.data.todo || response.data;

        if (createdTodo?._id) {
          setTodos((previous) => [
            createdTodo,
            ...previous,
          ]);
        } else {
          // Reload the tasks if the backend uses another response shape.
          const refreshed = await axios.get(
            `${API}/admin/users/${selectedUserId}/todos`,
            { withCredentials: true }
          );

          setTodos(
            Array.isArray(refreshed.data)
              ? refreshed.data
              : refreshed.data.todos || []
          );
        }

        setSuccess(
          `Task assigned to ${selectedUser?.name || "user"}.`
        );
      }

      setTask("");
      setTaskId(null);
    } catch (err) {
      console.error(
        "Task save error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to save the task."
      );
    } finally {
      setSaving(false);
    }
  };

  // Start editing a pending task.
  const handleEditTodo = (todo) => {
    if (todo.isDone) {
      setError("Completed tasks cannot be edited.");
      return;
    }

    setTaskId(todo._id);
    setTask(todo.title);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel editing.
  const cancelEdit = () => {
    setTask("");
    setTaskId(null);
    setError("");
  };

  // Delete a task belonging to the selected user.
  const handleDeleteTodo = async (todo) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${todo.title}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await axios.delete(`${API}/todos/${todo._id}`, {
        withCredentials: true,
      });

      setTodos((previous) =>
        previous.filter((item) => item._id !== todo._id)
      );

      if (taskId === todo._id) {
        setTask("");
        setTaskId(null);
      }

      setSuccess("Task deleted successfully.");
    } catch (err) {
      console.error(
        "Delete task error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete the task."
      );
    }
  };

  // Logout.
  const handleLogout = async () => {
    try {
      await axios.post(
        `${API}/logout`,
        {},
        { withCredentials: true }
      );

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to log out. Please try again."
      );
    }
  };

  // Loading screen.
  if (loading) {
    return (
      <Box className="admin-loading">
        <CircularProgress />

        <Typography color="text.secondary">
          Loading admin dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="admin-page">
      {/* Navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        className="admin-appbar"
      >
        <Toolbar className="admin-toolbar">
          <Box className="admin-brand-icon">
            <ChecklistRoundedIcon />
          </Box>

          <Box>
            <Typography className="admin-brand-name">
              TaskFlow
            </Typography>

            <Typography className="admin-brand-caption">
              ADMIN WORKSPACE
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Chip
            label="Administrator"
            className="admin-role-chip"
          />

          <Avatar className="admin-avatar">
            {(admin?.name || "A").charAt(0).toUpperCase()}
          </Avatar>

          <Tooltip title="Log out">
            <IconButton
              onClick={handleLogout}
              aria-label="Log out"
              className="admin-logout"
            >
              <LogoutRoundedIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" className="admin-container">
        {/* Error message */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Welcome banner */}
        <Paper elevation={0} className="admin-welcome">
          <Box className="admin-welcome-decoration" />

          <Box className="admin-welcome-content">
            <Chip
              icon={<GroupsRoundedIcon />}
              label="USER AND TASK MANAGEMENT"
              className="admin-welcome-chip"
            />

            <Typography className="admin-welcome-title">
              Welcome, {admin?.name || "Admin"}!
            </Typography>

            <Typography className="admin-welcome-text">
              Manage users, review their tasks, assign new work,
              and update tasks from one place.
            </Typography>
          </Box>
        </Paper>

        {/* Main dashboard */}
        <Box className="admin-layout">
          {/* Users panel */}
          <Paper elevation={0} className="admin-users-panel">
            <Box className="admin-panel-heading">
              <Box className="admin-heading-icon">
                <GroupsRoundedIcon />
              </Box>

              <Box>
                <Typography className="admin-panel-title">
                  Users
                </Typography>

                <Typography className="admin-muted-text">
                  {users.length} registered user
                  {users.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
            </Box>

            <TextField
              size="small"
              fullWidth
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search users..."
              className="admin-user-search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1} className="admin-user-list">
              {filteredUsers.map((item) => {
                const selected = item._id === selectedUserId;

                return (
                  <Box
                    component="button"
                    type="button"
                    key={item._id}
                    onClick={() => handleSelectUser(item._id)}
                    className={`admin-user-item ${
                      selected ? "admin-user-selected" : ""
                    }`}
                  >
                    <Avatar className="admin-user-avatar">
                      {(item.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>

                    <Box className="admin-user-details">
                      <Typography className="admin-user-name">
                        {item.name || "Unnamed user"}
                      </Typography>

                      <Typography className="admin-user-email">
                        {item.email}
                      </Typography>
                    </Box>

                    <PersonRoundedIcon className="admin-user-arrow" />
                  </Box>
                );
              })}

              {filteredUsers.length === 0 && (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 4, fontSize: 13 }}
                >
                  {users.length === 0
                    ? "No registered users found."
                    : "No matching users found."}
                </Typography>
              )}
            </Stack>
          </Paper>

          {/* Selected user and tasks */}
          <Box className="admin-right-column">
            {/* User summary */}
            <Paper elevation={0} className="admin-user-summary">
              {selectedUser ? (
                <>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                  >
                    <Avatar className="selected-user-avatar">
                      {(selectedUser.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography className="selected-user-name">
                        {selectedUser.name}
                      </Typography>

                      <Typography className="admin-muted-text">
                        {selectedUser.email}
                      </Typography>
                    </Box>

                    <Chip
                      label="Selected user"
                      className="selected-user-chip"
                    />
                  </Stack>

                  <Divider sx={{ my: 2.5 }} />

                  <Box className="admin-user-progress-row">
                    <Typography className="admin-muted-text">
                      Task completion
                    </Typography>

                    <Typography fontWeight={800} color="#4F46E5">
                      {progress}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    className="admin-progress"
                  />

                  <Box className="admin-mini-stats">
                    <Box className="admin-mini-stat">
                      <Typography className="admin-muted-text">
                        Total tasks
                      </Typography>

                      <Typography className="admin-mini-number">
                        {todos.length}
                      </Typography>
                    </Box>

                    <Box className="admin-mini-stat">
                      <Typography className="admin-muted-text">
                        Pending
                      </Typography>

                      <Typography className="admin-mini-number pending-number">
                        {pendingCount}
                      </Typography>
                    </Box>

                    <Box className="admin-mini-stat">
                      <Typography className="admin-muted-text">
                        Completed
                      </Typography>

                      <Typography className="admin-mini-number completed-number">
                        {completedCount}
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box className="admin-empty-users">
                  <GroupsRoundedIcon />

                  <Typography>
                    Select a user to view their tasks.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Assign or edit a task */}
            <Paper elevation={0} className="admin-assign-panel">
              <Box className="admin-panel-heading">
                <Box className="admin-heading-icon">
                  {taskId !== null ? (
                    <EditRoundedIcon />
                  ) : (
                    <AddTaskRoundedIcon />
                  )}
                </Box>

                <Box>
                  <Typography className="admin-panel-title">
                    {taskId !== null
                      ? "Edit task"
                      : "Assign a new task"}
                  </Typography>

                  <Typography className="admin-muted-text">
                    {taskId !== null
                      ? "Update the selected task's title."
                      : "Assign a task directly to the selected user."}
                  </Typography>
                </Box>
              </Box>

              <Box
                component="form"
                onSubmit={handleAssignTask}
                className="admin-assign-form"
              >
                <TextField
                  fullWidth
                  label={
                    taskId !== null
                      ? "Edit task title"
                      : "Task title"
                  }
                  placeholder="e.g. Complete monthly report"
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  inputProps={{ maxLength: 200 }}
                  required
                  disabled={!selectedUser || saving}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!selectedUser || saving}
                  startIcon={
                    saving ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : taskId !== null ? (
                      <EditRoundedIcon />
                    ) : (
                      <AddTaskRoundedIcon />
                    )
                  }
                  className="admin-assign-button"
                >
                  {saving
                    ? taskId !== null
                      ? "Updating..."
                      : "Assigning..."
                    : taskId !== null
                      ? "Update task"
                      : "Assign task"}
                </Button>

                {taskId !== null && (
                  <Button
                    type="button"
                    onClick={cancelEdit}
                    startIcon={<CloseRoundedIcon />}
                    disabled={saving}
                    sx={{
                      minHeight: 55,
                      borderRadius: "11px",
                      textTransform: "none",
                      color: "#64748b",
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>

              {selectedUser && (
                <Typography className="admin-assignment-note">
                  <PersonRoundedIcon />

                  {taskId !== null ? (
                    <>
                      Editing a task for{" "}
                      <strong>{selectedUser.name}</strong>
                    </>
                  ) : (
                    <>
                      Assigning to{" "}
                      <strong>{selectedUser.name}</strong>
                    </>
                  )}
                </Typography>
              )}
            </Paper>

            {/* Selected user's task list */}
            <Paper elevation={0} className="admin-tasks-panel">
              <Box className="admin-panel-heading">
                <Box className="admin-heading-icon">
                  <AssignmentRoundedIcon />
                </Box>

                <Box>
                  <Typography className="admin-panel-title">
                    {selectedUser
                      ? `${selectedUser.name}'s tasks`
                      : "User tasks"}
                  </Typography>

                  <Typography className="admin-muted-text">
                    Edit pending tasks or delete tasks for this user.
                  </Typography>
                </Box>
              </Box>

              {todosLoading ? (
                <Box className="admin-tasks-loading">
                  <CircularProgress size={28} />

                  <Typography color="text.secondary">
                    Loading tasks...
                  </Typography>
                </Box>
              ) : todos.length === 0 ? (
                <Box className="admin-empty-tasks">
                  <AssignmentRoundedIcon />

                  <Typography className="admin-empty-title">
                    No tasks yet
                  </Typography>

                  <Typography className="admin-muted-text">
                    Assign the first task using the form above.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5} className="admin-tasks-list">
                  {todos.map((todo) => (
                    <Box
                      key={todo._id}
                      className="admin-task-row"
                    >
                      <Box
                        className={`admin-task-status-icon ${
                          todo.isDone ? "task-is-complete" : ""
                        }`}
                      >
                        <TaskAltRoundedIcon />
                      </Box>

                      <Box className="admin-task-information">
                        <Typography
                          className={`admin-task-title ${
                            todo.isDone
                              ? "admin-task-title-done"
                              : ""
                          }`}
                        >
                          {todo.title}
                        </Typography>

                        <Typography className="admin-muted-text">
                          {todo.isDone
                            ? "Task completed"
                            : "Task pending"}
                        </Typography>
                      </Box>

                      <Chip
                        label={todo.isDone ? "Completed" : "Pending"}
                        size="small"
                        className={
                          todo.isDone
                            ? "admin-status-completed"
                            : "admin-status-pending"
                        }
                      />

                      {/* Edit and delete actions */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        <Tooltip
                          title={
                            todo.isDone
                              ? "Completed tasks cannot be edited"
                              : "Edit task"
                          }
                        >
                          <span>
                            <IconButton
                              onClick={() => handleEditTodo(todo)}
                              disabled={todo.isDone}
                              aria-label="Edit task"
                              sx={{
                                color: "#5146d9",
                                "&:hover": {
                                  backgroundColor: "#eef2ff",
                                },
                                "&.Mui-disabled": {
                                  color: "#c5cad5",
                                },
                              }}
                            >
                              <EditRoundedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Delete task">
                          <IconButton
                            onClick={() => handleDeleteTodo(todo)}
                            aria-label="Delete task"
                            sx={{
                              color: "#929aab",
                              "&:hover": {
                                color: "#dc2626",
                                backgroundColor: "#fef2f2",
                              },
                            }}
                          >
                            <DeleteOutlineRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        </Box>

        <Typography className="admin-footer">
          TaskFlow · Admin Workspace
        </Typography>
      </Container>

      {/* Success notification */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSuccess("")}
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard;