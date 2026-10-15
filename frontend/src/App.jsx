import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css"
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
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Box,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [todoList, setTodoList] = useState([]);
  const [task, setTask] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [taskError, setTaskError] = useState("");

  // Fetch todos ONCE when the page loads (your old [todoList] caused an endless loop)
  useEffect(() => {
    const getTodos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/todos", {
          withCredentials: true,
        });
        setTodoList(response.data);
      } catch (error) {
        console.error("Fetch failed:", error.response?.data || error.message);
      }
    };
    getTodos();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const addTask = async () => {
    if (task.trim() === "") {
      setTaskError("Enter your task please");
      return;
    }
    setTaskError("");

    if (taskId === null) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/todos",
          { title: task, isDone: false },
          { withCredentials: true }
        );
        setTodoList([...todoList, response.data]);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const response = await axios.patch(
          `http://localhost:5000/api/auth/todos/edit/${taskId}`,
          { title: task },
          { withCredentials: true }
        );
        setTodoList(
          todoList.map((todo) => (todo._id === taskId ? response.data : todo))
        );
      } catch (error) {
        console.log(error);
      }
    }
    setTaskId(null);
    setTask("");
  };

  const removeTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/todos/${id}`, {
        withCredentials: true,
      });
      setTodoList(todoList.filter((todo) => todo._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const editTodo = (id) => {
    const todo = todoList.find((todo) => todo._id === id);
    if (!todo) return;
    setTaskId(todo._id);
    setTask(todo.title);
  };

  const todoMark = async (key) => {
    const todo = todoList.find((todo) => todo._id === key);
    if (!todo) return;

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/auth/todos/${key}`,
        { isDone: !todo.isDone },
        { withCredentials: true }
      );
      setTodoList(
        todoList.map((todo) => (todo._id === key ? response.data : todo))
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="app-page">
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {`Hi ${user?.name || "User"}!`}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, bgcolor: "rgba(255,255,255,0.92)", borderRadius: 3 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              label="Add or Update todo"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              error={Boolean(taskError)}
              helperText={taskError}
              fullWidth
              size="small"
            />
            <Button variant="contained" onClick={addTask}>
              {taskId === null ? "Add" : "Update"}
            </Button>
          </Stack>

          <Typography variant="h5" sx={{ mt: 3 }}>
            Todo List
          </Typography>

          <List>
            {todoList.length === 0 && (
              <Typography color="text.secondary">No todos yet.</Typography>
            )}

            {todoList.map((todo) => (
              <ListItem
                key={todo._id}
                disableGutters
                secondaryAction={
                  <>
                    <IconButton onClick={() => editTodo(todo._id)} aria-label="edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => removeTodo(todo._id)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <Checkbox
                  checked={Boolean(todo.isDone)}
                  onChange={() => todoMark(todo._id)}
                />
                <ListItemText
                  primary={todo.title}
                  sx={{
                    textDecoration: todo.isDone ? "line-through" : "none",
                    color: todo.isDone ? "text.secondary" : "text.primary",
                    pr: 10,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </Box>
    </div>
  );
}

export default App;