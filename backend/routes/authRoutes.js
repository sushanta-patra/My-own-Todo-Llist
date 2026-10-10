import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Todo from "../models/Todo.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all todos
router.get("/todos",protect, async (req, res) => {
    try {
        const data = await Todo.find();

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});


// POST todo
router.post("/todos",protect, async (req, res) => {
    try {
        const newTodo = await Todo.create({
            title: req.body.title,
        });

        res.status(201).json(newTodo);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// PATCH todo
router.patch("/todos/:id",protect, async (req, res) => {
    try {
        const id = req.params.id;
        const { isDone } = req.body;

        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            {
                isDone: isDone
            },
            {
                returnDocument: "after"
            }
        );

        res.status(200).json(updatedTodo);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// DELETE todo
router.delete("/todos/:id",protect, async (req, res) => {
    try {
        const delId = req.params.id;

        const deletedTodo = await Todo.findByIdAndDelete(delId);

        res.status(200).json(deletedTodo);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Signup
router.post("/signup",async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Signup successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({  
            message: error.message
        });
    }
});

// Sigin
router.post("/login",async(req,res)=>{
    try{
        const {email,password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if(!passwordMatch){
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        //token create
        const token = jwt.sign(
            {
                userId:user._id,
                Role:user.role
            },
            process.env.SECRETE_KEY,
            {
                expiresIn: "1d"
            }
        );

        // store cookies
        res.cookie("token",token,{
            httpOnly:true,
            secure: false,
            sameSite: "lax"
        });

        res.json({
            message:"login Successfully",
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
        
    }catch(error){
        res.status(500).json({
            message:error.message
        });
    }
})

// Logout
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