"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  const handleButtonClick = async () => {
    // Initiate Google sign-in
    await signIn("google");
  };

  return (
    <button
      onClick={handleButtonClick}
      className="text-white border border-white px-3 py-1 rounded-lg"
    >
      Sign in
    </button>
  );
}
