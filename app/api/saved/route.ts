
import { NextResponse, NextRequest} from "next/server";
import { auth } from "@/auth"; // Adjust the path to your auth.ts
import prisma from '@/lib/prisma';




export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  try {
      const savedItems = await prisma.saved.findMany({
          where: {
              userId: userId,
          },
          include: {
              feedItem: true, // Include the related FeedItem data
          },
          orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
          success: true,
          data: savedItems,
      });
  } catch (error) {
      console.error("Error fetching saved items:", error);
      return NextResponse.json(
          { success: false, message: "Failed to fetch saved items" },
          { status: 500 }
      );
  }
}



export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, feedItemID } = await body;
  try {
    await prisma.saved.create({
      data: {
        userId: userId as string,
        feedItemId: feedItemID as string,
      },
    });
    return new NextResponse("Post saved successfully!", { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
  }
}



export async function DELETE(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  try {
    const body = await req.json();
    const { itemId } = body;

    await prisma.saved.delete({
      where: {
        id: itemId, // Use itemId to delete the specific saved item
        userId: userId,
      },
    });

    return NextResponse.json({ success: true, message:"Post Deleted successfully!"}, { status: 200 }
      
    );
  } catch (error) {
    console.error("Error Deleting post", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete saved item" },
      { status: 500 }
    );
  }
}