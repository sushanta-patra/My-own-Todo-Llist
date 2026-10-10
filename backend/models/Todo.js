import mongoose from "mongoose";
const todoSchema = new mongoose.Schema(
    {
        title: {
            type: "String",
            required: true,
            trim: true
        },
        isDone: {
            type: "Boolean",
            default: false
        }
    },
);

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;