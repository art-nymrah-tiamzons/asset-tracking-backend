import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/mongodb";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String
  },
  email:{
    type: String
  },
  password: {
    type: String
  },
  role: {
    type: String
  }
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

    const { email, password } = await req.json();

    const user = await mongoose.model("User").findOne({
      email
    }) as any;

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid Email"
        },

        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json(
        {
          message: "Invalid Password"
        },

        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      },
      
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (_error) {
    return NextResponse.json(
      {
        message: "Server error"
      },

      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}