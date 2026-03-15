"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { signToken } from "@/lib/auth"

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "Missing required fields" }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })

    const token = await signToken({ userId: user.id, email: user.email })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Failed to register user" }
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Missing credentials" }
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return { error: "Invalid credentials" }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { error: "Invalid credentials" }
    }

    const token = await signToken({ userId: user.id, email: user.email })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Failed to login" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}
