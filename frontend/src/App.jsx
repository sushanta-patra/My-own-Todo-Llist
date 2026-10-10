import "./App.css";
import React from "react";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function App() {
  const location = useLocation();
  const user = location.state?.user;
  let [todoList, setTodoList] = useState([]);

  let [task, setTask] = useState("");

  useEffect(() => {
    const getTodos = async () => {
      const response = await axios.get("http://localhost:5000/api/auth/todos", {
        withCredentials: true,
      });
      setTodoList(response.data);
    };
    getTodos();
  }, [todoList]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  let addTask = async () => {
    if (task.trim() !== "") {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/todos",
          {
            title: task,
            isDone: false,
          },
          {
            withCredentials: true,
          },
        );
        setTodoList([...todoList, response.data]);
        setTask("");
      } catch (error) {
        console.log(error);
      }
    }
  };

  let removeTodo = async (id) => {
    try {
      let response = await axios.delete(
        `http://localhost:5000/api/auth/todos/${id}`,
        {
          withCredentials: true,
        },
      );
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  let todoMark = async (key) => {
    const todo = todoList.find((todo) => todo._id === key);

    const newIsDone = !todo.isDone;

    try {
      // Send new isDone value to backend
      const response = await axios.patch(
        `http://localhost:5000/api/auth/todos/${key}`,
        {
          isDone: newIsDone,
        },
        {
          withCredentials: true,
        },
      );

      // Update frontend with MongoDB response
      setTodoList(
        todoList.map((todo) => {
          if (todo._id === key) {
            return response.data;
          }

          return todo;
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="nav-bar">
        <div className="prof">
          <div className="profile-log">{`Hi ${user?.name || "User"}!`}</div>
          <div className="log-out">
            <button onClick={handleLogout}>
              &nbsp;&nbsp;<i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </div>
      <section id="center">
        <input
          type="text"
          placeholder="Add a new todo..."
          style={{ padding: "10px", borderRadius: "5px" }}
          onChange={(e) => {
            setTask(e.target.value);
          }}
          value={task}
        ></input>
        <br />
        <button
          style={{
            padding: "10px",
            borderRadius: "5px",
            background: "lightblue",
          }}
          onClick={addTask}
        >
          Add Task
        </button>
        <hr />
        <h1 style={{ textDecoration: "underline" }}>Todo List</h1>
        <ul style={{ listStyleType: "none" }}>
          {todoList.map((todo) => {
            return (
              <li key={todo._id}>
                <input
                  type="checkbox"
                  checked={todo.isDone}
                  onChange={() => todoMark(todo._id)}
                />
                <span className={todo.isDone ? "completed" : ""}>
                  {todo.title} &nbsp;
                </span>
                <button onClick={() => removeTodo(todo._id)}>
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
