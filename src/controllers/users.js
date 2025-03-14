import User from "../models/users.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js";



export const createUser = asyncHandler(async (req, res, next) => {
    const { name, email,password ,role} = req.body;

    // Validate input
    if (!name || !email ||!password || !role) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Hash the password


    // Create new user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    res.status(201).json({ success: true, message: "User created successfully", user });
});


export const getUser = asyncHandler(async (req, res, next) => {
    const {id} = req.params;
    const user = await User.findById(id);
    res.status(200).json({ success: true, user });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({ success: true, users })
})

export const updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params; // Get user ID from request params

    try {
        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update user with the provided data
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { 
            new: true, 
            runValidators: true 
        });

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


export const deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.user._id)
    res.status(200).json({ success: true, message: "User deleted successfully" })
})



