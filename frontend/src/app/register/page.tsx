// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Basic authentication fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // User profile fields
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [faculty, setFaculty] = useState("");
  const [intention, setIntention] = useState("");
  
  // Multi-select fields
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  
  // Prompt fields - new structure
  const [selectedPrompts, setSelectedPrompts] = useState<Array<{prompt: string, answer: string}>>([
    { prompt: "", answer: "" },
    { prompt: "", answer: "" },
    { prompt: "", answer: "" }
  ]);
  
  // Form state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Available options for dropdowns
  const genderOptions = ["Male", "Female", "Nonbinary"];
  const studyLevelOptions = ["Undergraduate", "Postgraduate", "PhD"];
  const facultyOptions = [
    "Art, Design and Architecture", 
    "Business and Economics", 
    "Education", 
    "Engineering", 
    "Information Technology", 
    "Law", 
    "Medicine, Nursing and Health Sciences", 
    "Pharmacy and Pharmaceutical Sciences", 
    "Science"
  ];
  const intentionOptions = ["Make new friends", 
    "Find a study partner", 
    "Get help with a subject", 
    "Share notes or flashcards", 
    "Find people in my faculty", 
    "Study in group for motivation"];

  const hobbyOptions = [
    "Running or Jogging",
    "Rock Climbing or Bouldering",
    "Cycling",
    "Ultimate Frisbee",
    "Soccer",
    "Basketball",
    "Drawing / Illustration",
    "Photography",
    "Creative Writing / Poetry",
    "Music (Instrument or DJing)",
    "Coding / Hackathons",
    "Language Learning",
    "Chess / Strategy Games",
    "Debate / Public Speaking",
    "Student Clubs & Societies",
    "Volunteering",
    "Board-Game Nights",
    "Cooking Clubs or Potlucks",
    "Yoga / Meditation",
    "Gardening / Plant Care",
    "Reading for Pleasure",
    "Mindfulness Journaling",
    "3D Printing / Maker Spaces",
    "Electronics & Arduino Projects",
    "Woodworking / Leathercraft",
    "Podcasting / Video Production"
  ];

  const promptOptions = [
    "The subject I could teach you in 10 minutes is...",
    "My go-to study snack is...",
    "A study ritual I never skip is...",
    "The soundtrack I focus best to is...",
    "My dream on-campus study spot is...",
    "If we get stuck on a problem, my first move is...",
    "I'll always share my best flashcards on...",
    "The worst study advice I've ever received is...",
    "Let’s debate: group study vs. solo grind—who wins?",
    "My secret motivator when deadlines loom is...",
    "One thing that makes a study sesh 10× better is...",
    "I bookmark articles on...",
    "The trick I use to memorize formulas is...",
    "My favorite way to take a break between chapters is..."
  ];

  // Handle hobby selection
  const toggleHobby = (hobby: string) => {
    setSelectedHobbies(prev => 
      prev.includes(hobby) 
        ? prev.filter(h => h !== hobby) 
        : [...prev, hobby]
    );
  };

  // Handle prompt and answer updates
  const updatePromptAndAnswer = (index: number, field: 'prompt' | 'answer', value: string) => {
    setSelectedPrompts(prev => {
      const newPrompts = [...prev];
      if (field === 'prompt') {
        newPrompts[index] = { ...newPrompts[index], prompt: value };
      } else {
        newPrompts[index] = { ...newPrompts[index], answer: value };
      }
      return newPrompts;
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
  
    // Validate required fields
    if (!name || !birthDate || !gender || !studyLevel || !faculty || !intention) {
      setError("Please fill out all required fields");
      setLoading(false);
      return;
    }
  
    // Validate prompts and answers
    if (selectedPrompts.some(p => !p.prompt || !p.answer)) {
      setError("Please select all prompts and provide answers");
      setLoading(false);
      return;
    }
  
    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
  
      if (signUpError) {
        throw signUpError;
      }
  
      if (!data.user) {
        throw new Error("Failed to create user account");
      }
  
      // Step 2: Make sure faculty exists, then get faculty ID
      let facultyId;
      
      // First check if faculty exists
      const { data: existingFaculty } = await supabase
        .from('faculties')
        .select('id')
        .eq('name', faculty)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors
      
      if (existingFaculty) {
        facultyId = existingFaculty.id;
      } else {
        // Faculty doesn't exist, so create it
        const { data: newFaculty, error: insertFacultyError } = await supabase
          .from('faculties')
          .insert({ name: faculty })
          .select('id')
          .single();
        
        if (insertFacultyError) {
          console.error("Faculty insertion error:", insertFacultyError);
          throw new Error(`Error creating faculty: ${insertFacultyError.message}`);
        }
        
        facultyId = newFaculty.id;
      }
      
      // Step 3: Make sure intention exists, then get intention ID
      let intentionId;
      
      // First check if intention exists
      const { data: existingIntention } = await supabase
        .from('intentions')
        .select('id')
        .eq('label', intention)
        .maybeSingle(); // Use maybeSingle instead of single
      
      if (existingIntention) {
        intentionId = existingIntention.id;
      } else {
        // Intention doesn't exist, so create it
        const { data: newIntention, error: insertIntentionError } = await supabase
          .from('intentions')
          .insert({ label: intention })
          .select('id')
          .single();
        
        if (insertIntentionError) {
          console.error("Intention insertion error:", insertIntentionError);
          throw new Error(`Error creating intention: ${insertIntentionError.message}`);
        }
        
        intentionId = newIntention.id;
      }
  
      // Step 4: Insert the user data into the users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email: email,
          name: name,
          birth_date: birthDate,
          gender: gender,
          faculty_id: facultyId,
          intention_id: intentionId,
          study_level_id: studyLevel
        });
      
      if (insertError) {
        console.error("Supabase user insertion error:", insertError);
        throw new Error(`Error creating user record: ${insertError.message}`);
      }
  
      // Step 5: Process hobbies - create if they don't exist
      for (const hobby of selectedHobbies) {
        // Check if hobby exists or create it
        let hobbyId;
        
        const { data: existingHobby } = await supabase
          .from('hobbies')
          .select('id')
          .eq('name', hobby)
          .maybeSingle();
        
        if (existingHobby) {
          hobbyId = existingHobby.id;
        } else {
          // Create the hobby
          const { data: newHobby, error: insertHobbyError } = await supabase
            .from('hobbies')
            .insert({ name: hobby })
            .select('id')
            .single();
          
          if (insertHobbyError) {
            console.error(`Error creating hobby ${hobby}:`, insertHobbyError);
            continue; // Skip this hobby but continue with others
          }
          
          hobbyId = newHobby.id;
        }
        
        // Create user-hobby relationship
        const { error: hobbyRelError } = await supabase
          .from('user_hobbies')
          .insert({
            user_email: email,
            hobby_id: hobbyId // Changed from hobbies_id to hobby_id based on schema image
          });
        
        if (hobbyRelError) {
          console.error(`Error linking hobby ${hobby}:`, hobbyRelError);
        }
      }
  
      // Step 6: Process prompts with answers
      for (const { prompt: promptText, answer } of selectedPrompts) {
        // Check if prompt exists or create it
        let promptId;
        
        const { data: existingPrompt } = await supabase
          .from('prompt_questions')
          .select('id')
          .eq('text', promptText)
          .maybeSingle();
        
        if (existingPrompt) {
          promptId = existingPrompt.id;
        } else {
          // Create the prompt
          const { data: newPrompt, error: insertPromptError } = await supabase
            .from('prompt_questions')
            .insert({ text: promptText })
            .select('id')
            .single();
          
          if (insertPromptError) {
            console.error(`Error creating prompt ${promptText}:`, insertPromptError);
            continue;
          }
          
          promptId = newPrompt.id;
        }
        
        // Create user-prompt relationship with answer
        const { error: promptRelError } = await supabase
          .from('user_prompts')
          .insert({
            user_email: email,
            prompt_id: promptId,
            answer: answer
          });
        
        if (promptRelError) {
          console.error(`Error linking prompt ${promptText}:`, promptRelError);
        }
      }
  
      // Show success message or redirect
      alert("Registration successful! Check your email to confirm your account.");
      router.push("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12">
      <div className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Create an Account</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Authentication Section */}
          <div className="rounded-md bg-blue-50 p-4">
            <h2 className="mb-4 text-xl font-semibold text-blue-800">Account Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="rounded-md bg-green-50 p-4">
            <h2 className="mb-4 text-xl font-semibold text-green-800">Personal Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                  Birth Date *
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender *
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="rounded-md bg-purple-50 p-4">
            <h2 className="mb-4 text-xl font-semibold text-purple-800">Academic Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="studyLevel" className="block text-sm font-medium text-gray-700">
                  Study Level *
                </label>
                <select
                  id="studyLevel"
                  value={studyLevel}
                  onChange={(e) => setStudyLevel(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Study Level</option>
                  {studyLevelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">
                  Faculty *
                </label>
                <select
                  id="faculty"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Faculty</option>
                  {facultyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="intention" className="block text-sm font-medium text-gray-700">
                  Learning Style *
                </label>
                <select
                  id="intention"
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Intention</option>
                  {intentionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Hobbies Section */}
          {/* <div className="rounded-md bg-yellow-50 p-4">
            <h2 className="mb-4 text-xl font-semibold text-yellow-800">
              Hobbies & Interests
              <span className="ml-2 text-sm font-normal text-yellow-700">(Select at least one)</span>
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {hobbyOptions.map((hobby) => (
                <div key={hobby} className="flex items-center">
                  <input
                    id={`hobby-${hobby}`}
                    type="checkbox"
                    checked={selectedHobbies.includes(hobby)}
                    onChange={() => toggleHobby(hobby)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`hobby-${hobby}`} className="ml-2 text-sm text-gray-700">
                    {hobby}
                  </label>
                </div>
              ))}
            </div>
          </div> */}

          {/* Prompts Section */}
          <div className="rounded-md bg-pink-50 p-4">
            <h2 className="mb-4 text-xl font-semibold text-pink-800">
              Conversation Starters
              <span className="ml-2 text-sm font-normal text-pink-700">(Fill all three)</span>
            </h2>
            <div className="space-y-6">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Prompt {index + 1}
                    </label>
                    <select
                      value={selectedPrompts[index].prompt}
                      onChange={(e) => updatePromptAndAnswer(index, 'prompt', e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select a prompt</option>
                      {promptOptions.map((prompt) => (
                        <option 
                          key={prompt} 
                          value={prompt}
                          disabled={selectedPrompts.some((p, i) => i !== index && p.prompt === prompt)}
                        >
                          {prompt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Your Answer
                    </label>
                    <textarea
                      value={selectedPrompts[index].answer}
                      onChange={(e) => updatePromptAndAnswer(index, 'answer', e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                      rows={3}
                      placeholder="Type your answer here..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}