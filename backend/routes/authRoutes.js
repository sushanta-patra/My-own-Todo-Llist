import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";
import Todo from "../models/Todo.js";
import protect from "../middleware/authMiddleware.js";
import authorizeCheck from "../middleware/authorizationCheck.js";
import { sendTodoEmail } from "../utils/sendTodoEmail.js";

const router = express.Router();

// Helper: Send a notification without failing the Todo operation
async function notifyTodoEmail(userId, action, title) {
  try {
    await sendTodoEmail(userId, action, title);
  } catch (error) {
    console.error("Todo email failed:", error.message);
  }
}

// GET: Current logged-in user's information
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("name email role");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Failed to get user information",
    });
  }
});

// GET: Admin can view all tasks.
// Normal users can view only their own tasks.
router.get("/todos", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { user: req.user.userId };

    const todos = await Todo.find(filter).sort({
      _id: -1,
    });

    return res.status(200).json(todos);
  } catch (error) {
    console.error("Get Todos error:", error);

    return res.status(500).json({
      message: "Failed to fetch Todos",
    });
  }
});

// GET: Admin can see all normal users.
router.get(
  "/admin/users",
  protect,
  authorizeCheck("admin"),
  async (req, res) => {
    try {
      const users = await User.find({
        role: "user",
      })
        .select("name email role")
        .sort({ name: 1 });

      return res.status(200).json(users);
    } catch (error) {
      console.error("Fetch users error:", error);

      return res.status(500).json({
        message: "Unable to fetch users",
      });
    }
  }
);

// GET: Admin can view tasks belonging to one selected user.
router.get(
  "/admin/users/:userId/todos",
  protect,
  authorizeCheck("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      const selectedUser = await User.findOne({
        _id: userId,
        role: "user",
      }).select("_id");

      if (!selectedUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const todos = await Todo.find({
        user: selectedUser._id,
      }).sort({ _id: -1 });

      return res.status(200).json(todos);
    } catch (error) {
      console.error("Fetch user Todos error:", error);

      return res.status(500).json({
        message: "Unable to fetch this user's tasks",
      });
    }
  }
);

// POST: Normal users create their own tasks.
// Admins can assign tasks to a selected normal user.
router.post(
  "/todos",
  protect,
  authorizeCheck("user", "admin"),
  async (req, res) => {
    try {
      const { title, assignedUserId } = req.body;

      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          message: "Task title is required",
        });
      }

      let ownerId;

      if (req.user.role === "admin") {
        // Admin must select a valid user.
        if (
          !assignedUserId ||
          !mongoose.isValidObjectId(assignedUserId)
        ) {
          return res.status(400).json({
            message: "Please select a valid user",
          });
        }

        const assignedUser = await User.findOne({
          _id: assignedUserId,
          role: "user",
        }).select("_id");

        if (!assignedUser) {
          return res.status(404).json({
            message: "Selected user not found",
          });
        }

        // Store the selected user's ID, not the admin's ID.
        ownerId = assignedUser._id;
      } else {
        // Ignore any assignedUserId supplied by a normal user.
        ownerId = req.user.userId;
      }

      const todo = await Todo.create({
        title: title.trim(),
        isDone: false,
        user: ownerId,
      });

      // Notify the person who owns the task.
      const action =
        req.user.role === "admin"
          ? "assigned to you"
          : "added";

      await notifyTodoEmail(
        ownerId,
        action,
        todo.title
      );

      return res.status(201).json(todo);
    } catch (error) {
      console.error("Add Todo error:", error);

      return res.status(500).json({
        message: "Failed to add Todo",
      });
    }
  }
);

// PATCH: Mark a task complete/incomplete.
// Users can update their own tasks; admins can update any task.
router.patch(
  "/todos/:id",
  protect,
  authorizeCheck("user", "admin"),
  async (req, res) => {
    try {
      const { isDone } = req.body;

      if (typeof isDone !== "boolean") {
        return res.status(400).json({
          message: "isDone must be true or false",
        });
      }

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid Todo ID",
        });
      }

      const filter =
        req.user.role === "admin"
          ? { _id: req.params.id }
          : {
              _id: req.params.id,
              user: req.user.userId,
            };

      const updatedTodo = await Todo.findOneAndUpdate(
        filter,
        { $set: { isDone } },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

      if (!updatedTodo) {
        return res.status(404).json({
          message: "Task not found or access denied",
        });
      }

      const action = updatedTodo.isDone
        ? "marked as completed"
        : "marked as incomplete";

      // Notify the task owner, including when the admin updates it.
      await notifyTodoEmail(
        updatedTodo.user,
        action,
        updatedTodo.title
      );

      return res.status(200).json(updatedTodo);
    } catch (error) {
      console.error("Mark Todo error:", error);

      return res.status(500).json({
        message: "Failed to update Todo status",
      });
    }
  }
);

// PATCH: Edit a task title.
// Normal users can edit their own tasks; admins can edit any task.
router.patch(
  "/todos/edit/:id",
  protect,
  authorizeCheck("admin"),
  async (req, res) => {
    try {
      const { title } = req.body;

      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return res.status(400).json({
          message: "Task title cannot be empty",
        });
      }

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid Todo ID",
        });
      }

      const filter =
        req.user.role === "admin"
          ? { _id: req.params.id }
          : {
              _id: req.params.id,
              user: req.user.userId,
            };

      const updatedTodo = await Todo.findOneAndUpdate(
        filter,
        { $set: { title: title.trim() } },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

      if (!updatedTodo) {
        return res.status(404).json({
          message: "Task not found or access denied",
        });
      }

      await notifyTodoEmail(
        updatedTodo.user,
        "updated",
        updatedTodo.title
      );

      return res.status(200).json(updatedTodo);
    } catch (error) {
      console.error("Edit Todo error:", error);

      return res.status(500).json({
        message: "Failed to update Todo",
      });
    }
  }
);

// DELETE: Admin-only deletion, preserving your current permission policy.
router.delete(
  "/todos/:id",
  protect,
  authorizeCheck("admin","user"),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid Todo ID",
        });
      }

      const todo = await Todo.findByIdAndDelete(
        req.params.id
      );

      if (!todo) {
        return res.status(404).json({
          message: "Todo not found",
        });
      }

      // Notify the task owner rather than the admin who deleted it.
      await notifyTodoEmail(
        todo.user,
        "deleted",
        todo.title
      );

      return res.status(200).json({
        message: "Todo deleted successfully",
        id: todo._id,
      });
    } catch (error) {
      console.error("Delete Todo error:", error);

      return res.status(500).json({
        message: "Failed to delete Todo",
      });
    }
  }
);

// SIGNUP: Public signup always creates a normal user.
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      // Do not accept a public role from the request.
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handles duplicate emails in case simultaneous requests race.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    return res.status(500).json({
      message: "Signup failed",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.SECRETE_KEY,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // For localhost development; use HTTPS settings in production.
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({
    message: "Logout successful",
  });
});

export default router;