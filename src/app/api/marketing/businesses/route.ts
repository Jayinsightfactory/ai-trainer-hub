import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

const BUSINESSES_PATH = path.join(process.cwd(), "data", "businesses.json");

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = fs.readFileSync(BUSINESSES_PATH, "utf-8");
    const businesses = JSON.parse(raw);
    return NextResponse.json(businesses);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
