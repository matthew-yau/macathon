"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import MainScreen from "./main_screen_test";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    };

    checkSession();
  }, [supabase, router]);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return null;

  return <MainScreen />;
}
