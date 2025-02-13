# Intuition: Your Personalized Article Feed

Intuition is a personalized article feed application inspired by the streamlined experience of TikTok, but designed for text-based content. Unlike traditional news aggregators or social media feeds, Intuition puts *you* in control.  Curate a feed of articles that truly matter to you by adding your preferred RSS feeds.  No more endless scrolling through irrelevant content – Intuition delivers a focused stream of articles tailored to your specific interests.

## Table of Contents

-   [Introduction](#introduction)
-   [Features](#features)
-   [Technologies Used](#technologies-used)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Contributing](#contributing)
-   [Future Enhancements](#future-enhancements)
-   [License](#license)

## Introduction

In today's fast-paced digital world, information overload is a constant challenge.  Traditional news and social media platforms often bombard users with a barrage of content, much of which is irrelevant or uninteresting. Intuition aims to solve this problem by providing a highly personalized experience.  Users define their interests by adding RSS feeds, and Intuition aggregates articles from those feeds into a clean, TikTok-like interface.  Scroll through a curated stream of content you care about, eliminating distractions and saving you valuable time.

## Features

-   **Personalized Feeds:** Add your own RSS feeds to curate a feed of articles that match your interests.
-   **Clean and Intuitive Interface:** Inspired by TikTok's user experience, Intuition offers a seamless and engaging way to browse articles.
-   **Category Filtering:** Easily filter articles by predefined categories (Top Stories, Tech & Science, Finance, Art, and more).
-   **Save Articles:** Save articles for later reading.
-   **Sharing:** Share interesting articles with others.
-   **Loading Indicator:** A loading indicator keeps you informed while new articles are fetched.
-   **Infinite Scrolling:**  As you scroll, Intuition seamlessly loads more articles from your chosen feeds.
-   **Responsive Design:**  Intuition adapts to different screen sizes for optimal viewing on any device.

## Technologies Used

-   **Frontend:** React, Next.js, react-modal, lucide-react, sonner
-   **Data Fetching:** Fetch API, DOMParser
-   **Styling:** Custom CSS (Tailwind CSS could be a future option)
-   **Other:**  CORS proxy (api.allorigins.win) for handling CORS issues with RSS feeds.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/yashraj22/intuition.git](https://github.com/yashraj22/intuition.git)
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd intuition
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add any necessary environment variables.  Currently, no environment variables are strictly required for the application to run, but you may add them in the future.

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

1.  **Add RSS Feeds:** Click the "+" button in the top bar to open the modal. Enter the URL of the RSS feed you want to add and click "Add".
2.  **Browse Articles:** Scroll through the feed to see articles from your added RSS feeds.
3.  **Filter by Category:** Click on the category buttons in the header to filter the articles.
4.  **Save Articles:** Click the heart icon on an article card to save it.
5.  **Share Articles:** Click the share icon on an article card to share it.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes.
4.  Commit your changes and push them to your branch.
5.  Submit a pull request.

## Future Enhancements

-   **User Authentication:** Allow users to create accounts and save their preferred feeds.
-   **Customizable Categories:** Enable users to define their own categories.
-   **Search Functionality:** Add a search bar to find specific articles.
-   **Integration with Readability API:** Improve article readability by using a readability API.
-   **Offline Mode:** Allow users to access saved articles offline.
-   **Improved Styling:** Enhance the UI/UX with better styling and animations.
-   **More Robust Error Handling:** Implement more detailed and user-friendly error messages.
