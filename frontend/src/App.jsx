import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Swal from "sweetalert2";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  Checkbox,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Snackbar,
  Divider,
} from "@mui/material";

import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import toast from "react-hot-toast";

const API = "http://localhost:5000/api/auth";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state?.user;

  const [todoList, setTodoList] = useState([]);
  const [task, setTask] = useState("");
  const [taskId, setTaskId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [taskError, setTaskError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch Todos from MongoDB
  useEffect(() => {
    let active = true;

    const getTodos = async () => {
      try {
        const response = await axios.get(`${API}/todos`, {
          withCredentials: true,
        });

        if (active) {
          const todos = Array.isArray(response.data)
            ? response.data
            : response.data.todos || [];

          setTodoList(todos);
        }
      } catch (err) {
        if (!active) return;

        console.error("Fetch failed:", err.response?.data || err.message);

        if (err.response?.status === 401) {
          navigate("/", { replace: true });
        } else {
          setError(err.response?.data?.message || "Unable to load your tasks.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    getTodos();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Add or edit a Todo
  const addOrUpdateTodo = async (event) => {
    event.preventDefault();

    const title = task.trim();

    if (!title) {
      setTaskError("Please enter a task title.");
      return;
    }

    setTaskError("");
    setError("");
    setSaving(true);

    try {
      if (taskId !== null) {
        // Update an existing task
        const response = await axios.patch(
          `${API}/todos/edit/${taskId}`,
          { title },
          { withCredentials: true },
        );

        setTodoList((previous) =>
          previous.map((todo) => (todo._id === taskId ? response.data : todo)),
        );

        setSuccess("Task updated successfully.");
      } else {
        // Save a new task in MongoDB
        const response = await axios.post(
          `${API}/todos`,
          {
            title,
            isDone: false,
          },
          { withCredentials: true },
        );

        setTodoList((previous) => [...previous, response.data]);

        // setSuccess("Task added successfully.");
        toast.success("Task added successfully.", {
          position: "top-right",
        });
      }

      setTask("");
      setTaskId(null);
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);

      setError(err.response?.data?.message || "Unable to save the task.");
    } finally {
      setSaving(false);
    }
  };

  // Start editing a task
  const editTodo = (todo) => {
    setTaskId(todo._id);
    setTask(todo.title);
    setTaskError("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setTask("");
    setTaskId(null);
    setTaskError("");
    setError("");
  };

  // Delete a task

  const removeTodo = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Red color for   delete
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      // Only runs if the user clicks "Yes, delete it!"
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API}/todos/${id}`, {
            withCredentials: true,
          });

          setTodoList((previous) => previous.filter((todo) => todo._id !== id));

          if (taskId === id) {
            cancelEdit();
          }

          toast.success("Task deleted successfully.", {
            position: "top-right",
          });
        } catch (err) {
          console.error("Delete failed:", err.response?.data || err.message);
          toast.error(err.response?.data?.message || "Failed to delete task.");
        }
      }
    });
  };

  // Mark a task complete or incomplete
  const todoMark = async (id) => {
    const selectedTodo = todoList.find((todo) => todo._id === id);

    if (!selectedTodo) return;

    setError("");

    try {
      const response = await axios.patch(
        `${API}/todos/${id}`,
        { isDone: !selectedTodo.isDone },
        { withCredentials: true },
      );

      setTodoList((previous) =>
        previous.map((todo) => (todo._id === id ? response.data : todo)),
      );

      setSuccess(
        !selectedTodo.isDone ? "Task completed!" : "Task marked as pending.",
      );
    } catch (err) {
      console.error("Status update failed:", err.response?.data || err.message);

      setError(err.response?.data?.message || "Unable to update the task.");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post(`${API}/logout`, {}, { withCredentials: true });

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log out. Please try again.",
      );
    }
  };

  // Task statistics
  const completedCount = todoList.filter((todo) => todo.isDone).length;

  const pendingCount = todoList.length - completedCount;

  const progress = todoList.length
    ? Math.round((completedCount / todoList.length) * 100)
    : 0;

  // Search and filter tasks
  const visibleTodos = todoList.filter((todo) => {
    const matchesSearch = (todo.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !todo.isDone) ||
      (filter === "completed" && todo.isDone);

    return matchesSearch && matchesFilter;
  });

  // Loading screen
  if (loading) {
    return (
      <Box className="todo-loading">
        <Box className="loading-content">
          <Box className="loading-logo">
            <ChecklistRoundedIcon />
          </Box>

          <CircularProgress size={30} />

          <Typography variant="body1" fontWeight={600}>
            Loading your workspace...
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Getting your tasks ready
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="todo-page">
      <Box className="background-orb background-orb-one" />
      <Box className="background-orb background-orb-two" />

      {/* Navigation */}
      <AppBar position="sticky" elevation={0} className="todo-appbar">
        <Toolbar className="todo-toolbar">
          <Box className="brand">
            <Box className="brand-icon">
              <ChecklistRoundedIcon />
            </Box>

            <Box>
              <Typography className="brand-name">TaskFlow</Typography>

              <Typography className="brand-caption">
                PERSONAL WORKSPACE
              </Typography>
            </Box>
          </Box>

          <Box className="toolbar-spacer" />

          <Box className="profile-section">
            <Box className="profile-text">
              <Typography className="profile-name">
                {user?.name || "User"}
              </Typography>

              <Typography className="profile-email">
                {user?.email || "Your personal account"}
              </Typography>
            </Box>

            <Avatar className="profile-avatar">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </Avatar>

            <Tooltip title="Log out">
              <IconButton
                onClick={handleLogout}
                className="logout-button"
                aria-label="Log out"
              >
                <LogoutRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="todo-container">
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

        {/* Welcome section */}
        <Paper elevation={0} className="welcome-banner">
          <Box className="welcome-decoration welcome-decoration-one" />
          <Box className="welcome-decoration welcome-decoration-two" />

          <Box className="welcome-copy">
            <Chip
              icon={<TaskAltRoundedIcon sx={{ color: "inherit !important" }} />}
              label="YOUR PERSONAL TASK MANAGER"
              className="welcome-chip"
            />

            <Typography className="welcome-title">
              Hello, {user?.name || "there"}!
            </Typography>

            <Typography className="welcome-description">
              Organize your day, focus on your goals, and make progress one task
              at a time.
            </Typography>
          </Box>

          <Box className="progress-panel">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <Typography className="progress-label">
                Overall progress
              </Typography>

              <Typography className="progress-percentage">
                {progress}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progress}
              className="progress-bar"
            />

            <Typography className="progress-caption">
              {completedCount} of {todoList.length} tasks completed
            </Typography>
          </Box>
        </Paper>

        {/* Statistics cards */}
        <Box className="stats-grid">
          {[
            {
              label: "Total tasks",
              value: todoList.length,
              detail: "All your tasks",
              icon: <ChecklistRoundedIcon />,
              color: "#4F46E5",
              bg: "#EEF2FF",
            },
            {
              label: "Pending tasks",
              value: pendingCount,
              detail: "Still to be done",
              icon: <PendingActionsRoundedIcon />,
              color: "#D97706",
              bg: "#FFF7E6",
            },
            {
              label: "Completed tasks",
              value: completedCount,
              detail: "Successfully finished",
              icon: <TaskAltRoundedIcon />,
              color: "#059669",
              bg: "#E8FAF1",
            },
          ].map((stat) => (
            <Card key={stat.label} elevation={0} className="stat-card">
              <CardContent className="stat-card-content">
                <Box>
                  <Typography className="stat-label">{stat.label}</Typography>

                  <Typography className="stat-value">{stat.value}</Typography>

                  <Typography className="stat-detail">{stat.detail}</Typography>
                </Box>

                <Box
                  className="stat-icon"
                  sx={{
                    color: stat.color,
                    bgcolor: stat.bg,
                  }}
                >
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Add or edit task */}
        <Paper elevation={0} className="composer-panel">
          <Box className="section-heading">
            <Box className="section-icon">
              {taskId === null ? <AddTaskRoundedIcon /> : <EditRoundedIcon />}
            </Box>

            <Box>
              <Typography className="section-title">
                {taskId === null ? "Create a new task" : "Update your task"}
              </Typography>

              <Typography className="section-subtitle">
                {taskId === null
                  ? "What would you like to accomplish today?"
                  : "Make changes to your selected task."}
              </Typography>
            </Box>
          </Box>

          <Box
            component="form"
            onSubmit={addOrUpdateTodo}
            className="task-form"
          >
            <TextField
              label="Task title"
              placeholder="e.g. Complete project report"
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                if (taskError) setTaskError("");
              }}
              error={Boolean(taskError)}
              helperText={taskError}
              fullWidth
              required
              inputProps={{ maxLength: 200 }}
              className="task-input"
            />

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={
                saving ? null : taskId === null ? (
                  <AddTaskRoundedIcon />
                ) : (
                  <EditRoundedIcon />
                )
              }
              className="task-submit-button"
            >
              {saving
                ? "Saving..."
                : taskId === null
                  ? "Add task"
                  : "Update task"}
            </Button>

            {taskId !== null && (
              <Button
                type="button"
                onClick={cancelEdit}
                startIcon={<CloseRoundedIcon />}
                className="cancel-button"
              >
                Cancel
              </Button>
            )}
          </Box>
        </Paper>

        {/* Todo list */}
        <Paper elevation={0} className="todo-list-panel">
          <Box className="todo-list-heading">
            <Box>
              <Typography className="list-title">My tasks</Typography>

              <Typography className="list-subtitle">
                Your tasks, all in one place.
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-field"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Filters */}
          <Tabs
            value={filter}
            onChange={(_, value) => setFilter(value)}
            variant="scrollable"
            allowScrollButtonsMobile
            className="todo-tabs"
          >
            <Tab value="all" label={`All tasks (${todoList.length})`} />

            <Tab value="pending" label={`Pending (${pendingCount})`} />

            <Tab value="completed" label={`Completed (${completedCount})`} />
          </Tabs>

          <Divider className="list-divider" />

          {/* Task items */}
          <Stack className="todo-items" spacing={1.5}>
            {visibleTodos.map((todo) => (
              <Paper
                key={todo._id}
                elevation={0}
                className={`todo-item ${
                  todo.isDone ? "todo-item-completed" : ""
                }`}
              >
                <Checkbox
                  checked={Boolean(todo.isDone)}
                  onChange={() => todoMark(todo._id)}
                  className="todo-checkbox"
                  color="success"
                  inputProps={{
                    "aria-label": `Mark ${todo.title} ${
                      todo.isDone ? "pending" : "complete"
                    }`,
                  }}
                />

                <Box className="todo-item-content">
                  <Typography
                    className={`todo-item-title ${
                      todo.isDone ? "completed-title" : ""
                    }`}
                  >
                    {todo.title}
                  </Typography>

                  <Typography className="todo-item-caption">
                    {todo.isDone ? "Task completed" : "Ready when you are"}
                  </Typography>
                </Box>

                <Chip
                  label={todo.isDone ? "Completed" : "Pending"}
                  size="small"
                  className={
                    todo.isDone
                      ? "status-chip status-completed"
                      : "status-chip status-pending"
                  }
                />

                <Box className="todo-actions">
                  <Tooltip title="Edit task">
                    <IconButton
                      onClick={() => editTodo(todo)}
                      aria-label="Edit task"
                      className="edit-action"
                    >
                      <EditRoundedIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete task">
                    <IconButton
                      onClick={() => removeTodo(todo._id)}
                      aria-label="Delete task"
                      className="delete-action"
                    >
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            ))}

            {/* Empty state */}
            {visibleTodos.length === 0 && (
              <Box className="empty-state">
                <Box className="empty-state-icon">
                  <ChecklistRoundedIcon />
                </Box>

                <Typography className="empty-state-title">
                  {search
                    ? "No matching tasks"
                    : filter === "completed"
                      ? "No completed tasks yet"
                      : filter === "pending"
                        ? "You're all caught up!"
                        : "Your task list is empty"}
                </Typography>

                <Typography className="empty-state-description">
                  {search
                    ? "Try searching with a different keyword."
                    : filter === "all"
                      ? "Add your first task above to get started."
                      : "Choose another filter to view your tasks."}
                </Typography>

                {filter !== "all" && (
                  <Button
                    onClick={() => setFilter("all")}
                    className="view-all-button"
                  >
                    View all tasks
                  </Button>
                )}
              </Box>
            )}
          </Stack>

          {/* Footer */}
          <Divider className="list-divider" />

          <Box className="todo-list-footer">
            <Typography>
              Showing {visibleTodos.length} of {todoList.length} tasks
            </Typography>

            <Typography>
              {completedCount} completed · {pendingCount} pending
            </Typography>
          </Box>
        </Paper>

        <Typography className="page-footer">
          Made for better focus, one task at a time.
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

export default App;
