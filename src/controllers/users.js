import User from "../models/users";

export const getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({ success: true, users })
})

export const updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true })
    res.status(200).json({ success: true, user })
})

export const deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.user._id)
    res.status(200).json({ success: true, message: "User deleted successfully" })
})



