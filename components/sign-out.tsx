"use client";

import { signOut } from "next-auth/react";

export default function SignOut() {
  const handleButtonClick = async () => {
    // Initiate Google sign-in
    await signOut();
  };

  return (
    <button
      onClick={handleButtonClick}
      className="text-white border border-white px-3 py-1 rounded-lg"
    >
      Sign Out
    </button>
  );
}
