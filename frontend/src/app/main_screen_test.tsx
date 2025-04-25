"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";

type MyTableRow = {
  email: string;
  name: string;
  birth_date: Date;
  gender: string;
  ug_pg_phd: string;
  faculty: string;
};

export default function MainScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<MyTableRow | null>(null);
  const [matches, setMatches] = useState<MyTableRow[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [score, setScore] = useState(0);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndLoadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: currentUserData, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      setUserData(currentUserData);
      await fetchAndSortMatches(currentUserData);
      setLoading(false);
    };

    checkSessionAndLoadData();
  }, [supabase, router]);

  const calculateSimilarity = (u1: MyTableRow, u2: MyTableRow) => {
    let score = 0;

    // Birth date similarity
    const d1 = new Date(u1.birth_date).getTime();
    const d2 = new Date(u2.birth_date).getTime();
    score -= Math.abs(d1 - d2) / (1000 * 60 * 60 * 24 * 365); // years

    if (u1.gender === u2.gender) score += 1;
    if (u1.ug_pg_phd === u2.ug_pg_phd) score += 2;
    if (u1.faculty === u2.faculty) score += 3;

    return score;
  };

  const fetchAndSortMatches = async (currentUser: MyTableRow) => {
    const { data: allUsers, error } = await supabase.from("users").select("*");

    if (error || !allUsers) {
      console.error("Error fetching all users:", error?.message);
      return;
    }

    const others = allUsers.filter(
      (u: MyTableRow) => u.email !== currentUser.email
    );
    const sorted = others
      .map((u) => ({
        user: u,
        score: -calculateSimilarity(currentUser, u), // negative for descending sort
      }))
      .sort((a, b) => a.score - b.score)
      .map((entry) => entry.user);

    setMatches(sorted);
  };
  useEffect(() => {
    if (userData && matches.length > 0) {
      const current = matches[matchIndex];
      const matchScore = calculateSimilarity(userData, current);
      setScore(matchScore);
    }
  }, [matchIndex, userData, matches]);

  const handleNextMatch = async () => {
    const target = matches[matchIndex];

    if (userData && target) {
      const { error } = await supabase.from("user_relationships").insert([
        {
          email: userData.email,
          target_email: target.email,
          action: "rejected",
        },
      ]);

      if (error) {
        console.error("Failed to insert relationship: ", error.message);
      } else {
        console.log("Rejected relationship recorded");
      }
    }
    setMatchIndex((prev) => (prev + 1) % matches.length);
  };

  if (loading) return <div>Loading...</div>;
  if (!user || !userData) return null;

  const currentMatch = matches[matchIndex];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {userData.name}</h1>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Top Match</h2>
        {currentMatch ? (
          <div className="border rounded p-4 shadow">
            <p>
              <strong>Similarity Score:</strong> {score}
            </p>
            <p>
              <strong>Name:</strong> {currentMatch.name}
            </p>
            <p>
              <strong>Email:</strong> {currentMatch.email}
            </p>
            <p>
              <strong>Gender:</strong> {currentMatch.gender}
            </p>
            <p>
              <strong>Birth Date:</strong>{" "}
              {new Date(currentMatch.birth_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Study Level:</strong> {currentMatch.ug_pg_phd}
            </p>
            <p>
              <strong>Faculty:</strong> {currentMatch.faculty}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleNextMatch}
            >
              Next Match
            </button>
          </div>
        ) : (
          <p>No matches found.</p>
        )}
      </div>
    </div>
  );
}
