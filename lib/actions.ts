import { FeedItem, Source } from "@/types/feed";
import { useFeedStore } from "@/store/useFeedStore";

export const parseHtmlContent = (html: string): string => {
	const doc = new DOMParser().parseFromString(html, "text/html");
	return doc.body.textContent || "";
};

export const fetchRssItems = async (source: Source) => {
	const corsProxy = "https://api.allorigins.win/raw?url=";
	const fetchedItems: FeedItem[] = [];
	const items: FeedItem[] = useFeedStore.getState().feedItems;
	// Check if the source URL is already in the feed items

	try {
		const response = await fetch(corsProxy + encodeURIComponent(source.url));
		if (!response.ok) throw new Error(`Failed to fetch ${source.url}`);

		const data = await response.text();
		const parser = new DOMParser();
		const xml = parser.parseFromString(data, "text/xml");
		const xmlItems = xml.querySelectorAll("item").length
			? xml.querySelectorAll("item")
			: xml.querySelectorAll("entry");

		for (const item of xmlItems) {
			const title = item.querySelector("title")?.textContent || "";
			const articleUrl =
				item.querySelector("link")?.textContent ||
				item.querySelector("link")?.getAttribute("href") ||
				"";
			// Check if this item already exists in the current state
			const isDuplicate = items.some(
				(existingItem: FeedItem) =>
					existingItem.url === articleUrl || existingItem.title === title,
			);
			if (!isDuplicate) {
				let imageUrl = "";

				// Handling XML Namespace
				const mediaGroup =
					item.getElementsByTagName("media:group")[0] ||
					item.getElementsByTagName("media")[0];
				if (mediaGroup) {
					const thumbnail =
						mediaGroup.getElementsByTagName("media:thumbnail")[0];
					if (thumbnail) {
						imageUrl = thumbnail.getAttribute("url") || "";
					}
				}
				if (!imageUrl && articleUrl) {
					try {
						const articleResponse = await fetch(
							corsProxy + encodeURIComponent(articleUrl),
						);
						const articleHtml = await articleResponse.text();
						const articleDoc = parser.parseFromString(articleHtml, "text/html");

						imageUrl =
							articleDoc
								.querySelector('meta[property="og:image"]')
								?.getAttribute("content") || "";
					} catch (error) {
						console.error("Error fetching article metadata:", error);
					}
				}

				if (!imageUrl) {
					imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
						title,
					)}`;
				}

				fetchedItems.push({
					id: articleUrl || title.toLowerCase().replace(/\s+/g, "-"),
					title,
					description: parseHtmlContent(
						item.querySelector("description")?.textContent ||
							item.querySelector("summary")?.textContent ||
							item.querySelector("media\\:description")?.textContent ||
							"",
					),
					imageUrl,
					saved: false,
					author:
						item.querySelector("author")?.getElementsByTagName("name")[0]
							.textContent || source.name,
					url: articleUrl,
				});
			}
		}
	} catch (error) {
		console.error("Error fetching source:", error);
	} finally {
		return fetchedItems;
	}
};
