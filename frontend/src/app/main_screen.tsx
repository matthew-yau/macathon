"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { FaBirthdayCake } from "react-icons/fa";
import { MdOutlinePerson2 } from "react-icons/md";
import { IoBookSharp } from "react-icons/io5";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import confetti from "canvas-confetti";
import { GiCoffeeCup } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import TopNavButtons from '@/components/topnavbar';

type MyTableRow = {
  email: string;
  name: string;
  birth_date: Date;
  gender: string;
  study_level_id: string;
  faculty_id: number;
  intention_id: number;
};

export default function MainScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<MyTableRow | null>(null);
  const [matches, setMatches] = useState<MyTableRow[]>([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [facultyName, setFacultyName] = useState<string>("");
  const [intentionLabel, setIntentionLabel] = useState<string>("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [userPrompts, setUserPrompts] = useState<
    { question: string; answer: string }[]
  >([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [isMatched, setIsMatched] = useState(false);
  const [showMatchedText, setShowMatchedText] = useState(false);

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
    const d1 = new Date(u1.birth_date).getTime();
    const d2 = new Date(u2.birth_date).getTime();
    score -= Math.abs(d1 - d2) / (1000 * 60 * 60 * 24 * 365); // years

    if (u1.gender === u2.gender) score += 1;
    if (u1.study_level_id === u2.study_level_id) score += 2;
    if (u1.faculty_id === u2.faculty_id) score += 3;

    return score;
  };

  const fetchAndSortMatches = async (currentUser: MyTableRow) => {
    // 1. Get all users
    const { data: allUsers, error: userError } = await supabase
      .from("users")
      .select("*");
    if (userError || !allUsers) {
      console.error("Error fetching users:", userError?.message);
      return;
    }

    // 2. Get rejected users from relationships
    const { data: rejectedRelationships, error: relError } = await supabase
      .from("user_relationships")
      .select("target_email")
      .eq("email", currentUser.email)
      .eq("action", "rejected");

    if (relError) {
      console.error("Error fetching relationships:", relError.message);
      return;
    }

    const rejectedEmails = new Set(
      rejectedRelationships?.map((r) => r.target_email)
    );

    // 3. Filter out current user and rejected users
    const filtered = allUsers.filter(
      (u: MyTableRow) =>
        u.email !== currentUser.email && !rejectedEmails.has(u.email)
    );

    // 4. Calculate and sort by similarity
    const sorted = filtered
      .map((u) => ({
        user: u,
        score: -calculateSimilarity(currentUser, u),
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

  useEffect(() => {
    const resolveForeignKeys = async () => {
      const current = matches[matchIndex];
      if (!current) return;

      const [facultyRes, intentionRes, photoRes, promptRes] = await Promise.all(
        [
          supabase
            .from("faculties")
            .select("name")
            .eq("id", current.faculty_id)
            .single(),
          supabase
            .from("intentions")
            .select("label")
            .eq("id", current.intention_id)
            .single(),
          supabase
            .from("user_photos")
            .select("photo_url")
            .eq("user_email", current.email),
          supabase
            .from("user_prompts")
            .select("answer, prompt_questions(text)")
            .eq("user_email", current.email),
        ]
      );

      setFacultyName(facultyRes.data?.name || "Unknown");
      setIntentionLabel(intentionRes.data?.label || "Unknown");
      setPhotoUrls(photoRes.data?.map((p) => p.photo_url) || []);
      setUserPrompts(
        promptRes.data?.map((p) => ({
          question: p.prompt_questions.text,
          answer: p.answer,
        })) || []
      );
    };

    resolveForeignKeys();
  }, [matchIndex, matches]);

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
      }
    }
    setMatchIndex((prev) => (prev + 1) % matches.length);
  };
  const handleLike = async () => {
    const target = matches[matchIndex];
    if (!userData || !target) return;

    // Check if they already liked you
    const { data: existingLike, error: likeError } = await supabase
      .from("user_relationships")
      .select("*")
      .eq("email", target.email)
      .eq("target_email", userData.email)
      .eq("action", "liked")
      .single();

    if (likeError && likeError.code !== "PGRST116") {
      console.error("Error checking existing like:", likeError.message);
      return;
    }

    if (existingLike) {
      // Insert 'matched' relationship both ways
      const { error: matchError } = await supabase
        .from("user_relationships")
        .upsert([
          {
            email: userData.email,
            target_email: target.email,
            action: "matched",
          },
          {
            email: target.email,
            target_email: userData.email,
            action: "matched",
          },
        ]);

      if (matchError) {
        console.error("Error inserting match:", matchError.message);
        return;
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { x: 0.5, y: 0.5 }, // center of the screen
      });

      setShowMatchedText(true); // <-- show the "MATCHED" text

      setTimeout(() => {
        setShowConfetti(false);
        setShowMatchedText(false); // <-- hide the text too
        setMatchIndex((prev) => (prev + 1) % matches.length);
      }, 2000); // confetti + text for 2 seconds

      setIsMatched(true); // 🔥 tell React we are in a match
      return; // Exit here so we don’t call setMatchIndex too early
    }

    // Just a normal like
    const { error: likeInsertError } = await supabase
      .from("user_relationships")
      .insert([
        {
          email: userData.email,
          target_email: target.email,
          action: "liked",
        },
      ]);

    if (likeInsertError) {
      console.error("Error inserting like:", likeInsertError.message);
      return;
    }

    setMatchIndex((prev) => (prev + 1) % matches.length);
  };

  if (loading) return <div>Loading...</div>;
  if (!user || !userData || matches.length === 0)
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            You’ve run out of matches 😢
          </h1>
          <p className="text-gray-500">
            Please check back later — we’re working on finding more people for
            you!
          </p>
        </div>
      </div>
    );

  const currentMatch = matches[matchIndex];
  const fallbackPhotos = [
    "/images/sample-profile1.jpg",
    "/images/sample-profile2.jpg",
    "/images/sample-profile3.jpg",
  ];
  const combinedContent = Array.from({ length: 3 }).map((_, i) => ({
    photo: (photoUrls.length > 0 ? photoUrls : fallbackPhotos)[i],
    prompt: userPrompts[i] ?? { question: "Prompt not available", answer: "—" },
  }));
  const calculateAge = (birthDate: string | Date) => {
    const dob = new Date(birthDate);
    const now = new Date();
    const age = now.getFullYear() - dob.getFullYear();
    const hasHadBirthday =
      now.getMonth() > dob.getMonth() ||
      (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
    return hasHadBirthday ? age : age - 1;
  };

  const age = calculateAge(currentMatch.birth_date);
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      {/* Top Navigation Bar */}
      <TopNavButtons />
      {showConfetti && <Confetti width={width} height={height} />}
      {showMatchedText && (
        <div
          className="absolute z-50 top-1/2 left-1/2 transform -translate-y-1/2 animate-slideIn text-5xl italic font-bold bg-gradient-to-r from-red-500 to-orange-400 text-transparent bg-clip-text"
          style={{
            animationDuration: "0.8s",
            animationFillMode: "forwards",
          }}
        >
          MATCHED!
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4">
          <h1 className="text-4xl font-semibold my-1">{currentMatch.name}</h1>
          <p className="text-gray-600 mt-1">{currentMatch.study_level_id}</p>
          <p className="text-gray-500 text-sm mt-4">
            Similarity Score: {score.toFixed(2)}
          </p>
        </div>

        <div className="overflow-y-scroll max-h-[calc(100vh-20rem)] p-4 space-y-6">
          {combinedContent.map((item, index) => (
            <div key={index} className="space-y-4">
              {/* Photo */}
              <div className="relative w-full h-96">
                <img
                  src={item.photo}
                  alt={`Photo ${index + 1}`}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>

              {/* Prompt */}
              <div>
                <p className="font-semibold">{item.prompt.question}</p>
                <input
                  type="text"
                  value={item.prompt.answer ?? ''}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100 mt-1"
                />
              </div>


              {/* Extra info box (only after first item) */}
              {index === 0 && (
                <div className="bg-gray-50 border rounded-xl p-4 my-8 shadow-sm">
                  <div className="grid grid-cols-2 gap-6 justify-items-center text-center">
                    <div className="flex flex-col items-center gap-1 w-32">
                      <FaBirthdayCake className="text-pink-400" size={20} />
                      <p className="text-xs text-gray-500">Age</p>
                      <p className="font-semibold text-lg">{age}</p>
                    </div>

                    <div className="flex flex-col items-center gap-1 w-32">
                      <MdOutlinePerson2 className="text-blue-400" size={20} />
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-semibold text-lg">
                        {currentMatch.gender}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 w-32">
                      <IoBookSharp className="text-green-500" size={20} />
                      <p className="text-xs text-gray-500">Faculty</p>
                      <p className="font-semibold text-sm leading-5 break-words">
                        {facultyName}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 w-32">
                      <MdOutlinePerson2 className="text-yellow-500" size={20} />
                      <p className="text-xs text-gray-500">Intention</p>
                      <p className="font-semibold text-sm leading-5 break-words">
                        {intentionLabel}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Like / Dislike Buttons */}
        <div className="flex justify-between mt-6 p-4 bg-transparent">
          <button
            className="bg-red-100 text-red-600 px-6 py-3 rounded-full text-2xl hover:bg-red-300 hover:scale-110 active:scale-95 transition-transform duration-300"
            onClick={handleNextMatch}
          >
            <RxCross1 />
          </button>
          <button
            className="bg-purple-400 text-white px-6 py-3 rounded-full text-2xl hover:bg-purple-800 hover:scale-110 active:scale-95 transition-transform duration-300"
            onClick={handleLike}
          >
            <GiCoffeeCup />
          </button>
        </div>
      </div>
    </div>
  );
}
