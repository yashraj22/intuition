"use client";
import { useState } from "react";
import { Bookmark, Share } from "lucide-react";
import { FeedItem } from "../types/feed";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useFeedStore } from "@/store/useFeedStore";
import { useSession } from "next-auth/react";
import { useSavedStore } from "@/store/useSavedStore";

interface FeedCardProps {
	item: FeedItem;
	// onSave: (id: string) => void; now zustand will handle this bad boy.
	onShare: (id: string) => void;
}

const FeedCard = ({ item, onShare }: FeedCardProps) => {
	const [imageLoaded, setImageLoaded] = useState(false);
	// const { toggleSavedItem, isItemSaved } = useSavedStore();
	const { toggleSaveItem } = useFeedStore();
	const isSaved = useSavedStore((state) =>
		state.savedItems.some((saved) => saved.feedItem.id === item.id),
	);

	const { data: session } = useSession();
	const handleSave = () => {
		const userId = session?.user?.id || "anonymous";
		toggleSaveItem(item, userId);
	};

	return (
		<div className="relative w-full h-[calc(100vh-7rem)] snap-center rounded-3xl overflow-hidden mx-auto max-w-md mb-4">
			{/* Image */}
			{/* <img
        src={item.imageUrl}
        alt={item.title}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setImageLoaded(true)}
        loading="lazy"
      /> */}

			<Image
				src={item.imageUrl || "/default-image.jpg"}
				alt={item.title}
				width={500}
				height={500}
				className={cn(
					"w-full h-full object-cover transition-opacity duration-500",
					imageLoaded ? "opacity-100" : "opacity-0",
				)}
				onLoad={() => setImageLoaded(true)}
				loading="lazy"
			/>

			{/* Content overlay */}
			<div className=" absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/100 via-gray-700/80 to-transparent backdrop-blur-md rounded-b-3xl">
				<h2 className="text-2xl font-semibold text-white mb-2 line-clamp-2">
					{item.title}
				</h2>
				<p className="text-white/80 text-base mb-6 line-clamp-3">
					{item.description}
				</p>

				{/* Author and actions */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white">
							{item.author?.charAt(0) || "A"}
						</div>
						<span className="text-white/80 text-sm">
							{item.author || "Anonymous"}
						</span>
					</div>

					{/* Action buttons */}
					<div className="flex gap-3">
						<button
							onClick={handleSave}
							className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
							<Bookmark
								className={cn(
									"w-5 h-5 transition-colors duration-300",
									isSaved ? "fill-white text-white" : "text-white",
								)}
							/>
						</button>
						<button
							onClick={() => onShare(item.id)}
							className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
							<Share className="w-5 h-5 text-white" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FeedCard;
