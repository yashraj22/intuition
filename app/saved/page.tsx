"use client";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useSavedStore } from "@/store/useSavedStore";
import { Share, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function SavedPost() {
	const { savedItems, isItemSaved, fetchSavedPost, deleteSavedPost } =
		useSavedStore();
	const { data: session } = useSession();
	const userId = session?.user?.id;

	useEffect(() => {
		if (userId) {
			console.log("Fetching saved posts for user:", userId);
			fetchSavedPost();
		}
	}, []);
	const savedLookup = useMemo(
		() =>
			savedItems.reduce((acc, item) => {
				if (item.feedItem) {
					acc[item.feedItem.id] = true;
				}
				return acc;
			}, {} as Record<string, boolean>),
		[savedItems],
	);
	const handleDelete = (savedItemId: string) => {
		if (window.confirm("Are you sure you want to delete this saved post?")) {
			deleteSavedPost(savedItemId);
		}
	};

	return (
		<div className="p-4 bg-black text-white min-h-screen">
			{savedItems.length === 0 ? (
				<div className="flex flex-col justify-center items-center h-[calc(100vh-7rem)]">
					<h1 className="text-gray-400 text-xl ">No Saved Posts here.</h1>
					<Image
						src="/emptypage.svg"
						width={500}
						height={500}
						alt="nothing is here"
					/>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
					{savedItems.map((savedItem) => {
						//@ts-expect-error FIXME: Update Type to fix this
						if (!savedItem.feedItem) {
							// Skip rendering if feedItem is undefined
							return null;
						}

						//@ts-expect-error FIXME: Update Type to fix this
						const item = savedItem.feedItem;

						const isSaved = Boolean(savedLookup[item.id]);

						return (
							<div
								key={savedItem.id} // Correct key prop
								className="relative w-full h-[400px] rounded-[10px] overflow-hidden shadow-lg">
								<Image
									src={item.imageUrl || "/default-image.jpg"}
									alt={item.title}
									width={300}
									height={500}
									className={cn(
										"w-full h-full object-cover transition-opacity duration-500",
										"opacity-100",
									)}
									loading="lazy"
								/>
								<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/100 via-gray-700/90 to-transparent backdrop-blur-md rounded-b-3x rounded-b-[10px]">
									<h2 className="text-md font-semibold text-white mb-2 line-clamp-2">
										{item.title}
									</h2>
									<p className="text-white/80 text-xs mb-4 line-clamp-3">
										{item.description}
									</p>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white">
												{item.author?.charAt(0) || "A"}
											</div>
											<span className="text-white/80 text-xs">
												{item.author || "Anonymous"}
											</span>
										</div>
										<div className="flex gap-2">
											<button
												onClick={() => handleDelete(savedItem.id)}
												className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
												<Trash2
													className={cn(
														"w-4 h-4 transition-colors duration-300",
														isSaved ? "fill-white text-white" : "text-white",
													)}
												/>
											</button>
											<button
												onClick={() => alert("Share functionality")}
												className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
												<Share className="w-4 h-4 text-white" />
											</button>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
