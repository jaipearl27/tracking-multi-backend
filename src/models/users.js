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
    phone: {
      type: String,
      required: false,
      default: '',
      maxLength: 15,
    },
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
  console.log("Entered Password:", password);
  console.log("Stored Hashed Password:", this.password);

  if (!password || !this.password) {
    console.log("Missing password for comparison");
    return false; // Prevents crashing
  }

  const isMatch = await bcrypt.compare(password, this.password);
  console.log("Password Match:", isMatch);

  return isMatch;
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

userSchema.methods.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(password, salt);
  return newPassword;
}


userSchema.index({ name: 1, email: 1 });


const User = mongoose.model("User", userSchema);


export default User;