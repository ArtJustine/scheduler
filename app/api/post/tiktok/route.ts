// This file is commented out for UI development
// Will be implemented later when integrating with the backend

import { NextResponse } from "next/server"

export async function POST(request: Request) {
  return NextResponse.json({ message: "TikTok posting API is not implemented yet" }, { status: 501 })
}
