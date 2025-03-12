"use client";

import { signIn } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { User } from "lucide-react"

export default function SignIn() {
  const handleButtonClick = async () => {
    // Initiate Google sign-in
    await signIn("google");
  };

  return (
    <Avatar>
      <button className = "text-white" onClick={handleButtonClick}>
        <User/>
      </button>
    </Avatar>
  );
}
