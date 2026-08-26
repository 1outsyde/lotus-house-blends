import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vendor/register-external`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": process.env.INTERNAL_API_KEY!,
        },
        body: JSON.stringify({ name, email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? "Registration failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({ user: data.user }, { status: 201 });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
