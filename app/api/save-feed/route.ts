import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const feedItems = await request.json(); // Array of feed items

    // Save feed items to the database
    const savedItems = await prisma.feedItem.createMany({
      data: feedItems,
      skipDuplicates: true, // Skip duplicates based on unique constraints
    });

    return NextResponse.json({
      success: true,
      message: "Feed items saved successfully",
      data: savedItems,
    });
  } catch (error) {
    console.error("Error saving feed items:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save feed items" },
      { status: 500 }
    );
  }
}