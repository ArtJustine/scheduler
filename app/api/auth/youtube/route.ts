// This file is commented out for UI development
// Will be implemented later when integrating with the backend

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  return NextResponse.json({ message: "YouTube auth API is not implemented yet" }, { status: 501 })
}
