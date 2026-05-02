import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/mongodb";

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" }
});

const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    }
  );
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { fullName, email, password } = await req.json();

    const existingUser = await mongoose
      .model("User")
      .findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        {
          status: 409,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await mongoose.model("User").create({
      fullName,
      email,
      password: hashedPassword,
      role: "user"
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}