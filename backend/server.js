import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Todo from "./models/Todo.js";
import dns from "dns";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";


dotenv.config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

// Middleware
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());

// Auth routes
app.use("/api/auth", authRouter);

// Connect MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});