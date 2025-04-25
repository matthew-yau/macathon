// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import MainScreen from "./main_screen";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkSession();
  }, [supabase, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return null; // This will not render while redirecting
  }

  return <MainScreen />;
}