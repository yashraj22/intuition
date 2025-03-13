import { useState } from "react";

export const parseHtmlContent = (html: string): string => {
	const doc = new DOMParser().parseFromString(html, "text/html");
	return doc.body.textContent || "";
};
