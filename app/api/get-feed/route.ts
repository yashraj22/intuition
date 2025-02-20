import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const feedItems = await prisma.feedItem.findMany({
      orderBy: { createdAt: "desc" }, // Fetch latest items first
    });

    return NextResponse.json({
      success: true,
      data: feedItems,
    });
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch feed items" },
      { status: 500 }
    );
  }
}