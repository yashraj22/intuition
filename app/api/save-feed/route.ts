import { NextResponse } from "next/server";
import prisma from '../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const items = await req.json();
    
    // Use Prisma's createMany with skipDuplicates option
    // This assumes you have a unique constraint on either url or title in your schema
    const result = await prisma.feedItem.createMany({
      data: items,
      skipDuplicates: true, // This will skip items that would violate unique constraints
    });

    // Fetch and return only the newly created items
    const savedItems = await prisma.feedItem.findMany({
      where: {
        OR: items.map(item => ({
          url: item.url,
        })),
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60) // Items created in the last minute
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: savedItems,
      message: `${result.count} new items saved` 
    });
  } catch (error) {
    console.error('Error saving feed items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save feed items' },
      { status: 500 }
    );
  }
}
