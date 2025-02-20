import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AvailableUserRoles, UserRolesEnum } from "../utils/userRoles.js";



const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/\S+@\S+\.\S+/, "Invalid Email"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    // mobileNumber: {
    //   type: String,
    //   required: [true, "Mobile number is required"],
    // },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);


// Pre-save hook to hash password before saving it to DB
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});


userSchema.methods.isPasswordCorrect = async function (password) {
  console.log(`password: ${password}`);
  return await bcrypt.compare(password, this.password);
};


//Generate Refresh Token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: process.env.TOKEN_EXPIRY,
    }
  );
};


userSchema.index({ name: 1, email: 1 });


const User = mongoose.model("User", userSchema);


export default User;