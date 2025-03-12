import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth"; // Adjust the path to your auth.ts
import prisma from "@/lib/prisma";

export async function GET() {
	const session = await auth();
	const userId = session?.user?.id;

	try {
		const sourceItems = await prisma.source.findMany({
			where: {
				userId: userId,
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json({
			success: true,
			data: sourceItems,
		});
	} catch (error) {
		console.error("Error fetching source items:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch source items" },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { userId, source } = await body;
	try {
		await prisma.source.create({
			data: {
				userId: userId as string,
				url: source.url as string,
				name: source.name as string,
			},
		});
		return new NextResponse("Post source successfully!", { status: 201 });
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

		await prisma.source.delete({
			where: {
				id: itemId, // Use itemId to delete the specific saved item
				userId: userId,
			},
		});

		return NextResponse.json(
			{ success: true, message: "Post Deleted successfully!" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error Deleting post", error);
		return NextResponse.json(
			{ success: false, message: "Failed to delete saved item" },
			{ status: 500 },
		);
	}
}
