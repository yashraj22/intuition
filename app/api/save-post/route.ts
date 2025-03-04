import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest) {
    const body = await req.json();
        const { userId, feedItemID } = await body;
        console.log(userId, feedItemID);
try  {
    prisma.saved.create({
        data: {
            userId: userId as string,
            feedItemId: feedItemID as string,
        },
    })
    return new NextResponse(("Post saved successfully!"), { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);

  }
}