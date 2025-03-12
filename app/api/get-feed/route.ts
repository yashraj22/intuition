// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function GET() {
//   try {
//     const feedItems = await prisma.feedItem.findMany({
//       orderBy: { createdAt: "desc" }, // Fetch latest items first
//     });

//     return NextResponse.json({
//       success: true,
//       data: feedItems,
//     });
//   } catch (error) {
//     console.error("Error fetching feed items:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch feed items" },
//       { status: 500 }
//     );
//   }
// }






import { NextResponse } from "next/server";
import Redis from "ioredis";
import prisma from '@/lib/prisma';

// Add connection options for better error handling
const redis = new Redis(process.env.NEXT_PUBLIC_REDIS_URL as string, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  }
});

// Log Redis connection status
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export async function GET() {
  try {
    console.log("Attempting to fetch from Redis cache");
    const cachedData = await redis.get("feedItems");

    if (cachedData) {
      console.log("Cache hit, returning data from Redis");
      const parsedData = JSON.parse(cachedData);
      return NextResponse.json({
        success: true,
        data: parsedData,
        source: "redis",
      });
    }

    console.log("Cache miss, fetching from database");
    const feedItems = await prisma.feedItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    console.log(`Found ${feedItems.length} items in database`);
    
    // Only cache if we have items
    if (feedItems.length > 0) {
      await redis.set("feedItems", JSON.stringify(feedItems), "EX", 300);
      console.log("Data cached successfully");
    }

    return NextResponse.json({
      success: true,
      data: feedItems,
      source: "database",
    });
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch feed items", error: error.message },
      { status: 500 }
    );
  }
}