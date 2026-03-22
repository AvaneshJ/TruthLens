import { NextRequest, NextResponse } from "next/server"
import { createUser, emailExists } from "../../lib/userStore"

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }

    if (emailExists(email)) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    createUser(email, name, password)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
