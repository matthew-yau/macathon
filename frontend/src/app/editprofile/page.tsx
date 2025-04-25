"use client";

import { useEffect, useState } from "react";
import TopNavButtons from "@/components/topnavbar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function EditProfilePage() {
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
    gender: "",
    study: "",
    faculty: "",
    hobbies: [] as string[],
    intentions: "",
    prompts: ["", "", ""],
    profileImages: [null, null, null] as (File | null)[],
  });

  const [genderOptions] = useState(["Male", "Female", "Other"]);
  const [studyOptions, setStudyOptions] = useState<string[]>([]);
  const [facultyOptions, setFacultyOptions] = useState<string[]>([]);
  const [intentionOptions, setIntentionOptions] = useState<string[]>([]);
  const [hobbyOptions] = useState(["Reading", "Hiking", "Gaming", "Cooking"]);

  useEffect(() => {
    const fetchOptions = async () => {
      const { data: studies } = await supabase
        .from("study_levels")
        .select("label");
      const { data: faculties } = await supabase
        .from("faculties")
        .select("name");
      const { data: intentions } = await supabase
        .from("intentions")
        .select("label");

      setStudyOptions(studies?.map((s) => s.label) || []);
      setFacultyOptions(faculties?.map((f) => f.name) || []);
      setIntentionOptions(intentions?.map((i) => i.label) || []);
    };

    fetchOptions();
  }, [supabase]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...formData.prompts];
    newPrompts[index] = value;
    setFormData({ ...formData, prompts: newPrompts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return alert("You must be logged in");

    // Update user data
    const { error } = await supabase
      .from("users")
      .update({
        name: formData.name,
        birth_date: formData.birth_date,
        gender: formData.gender,
        study_level_id: formData.study,
        faculty_id: formData.faculty,
        intention_id: formData.intentions,
      })
      .eq("email", user.email);

    if (error) {
      console.error("Error updating user:", error.message);
      return;
    }

    // Update prompts
    await supabase.from("user_prompts").delete().eq("user_email", user.email);
    for (let prompt of formData.prompts) {
      if (prompt.trim()) {
        await supabase.from("user_prompts").insert({
          user_email: user.email,
          answer: prompt,
        });
      }
    }

    // Upload photos
    for (let i = 0; i < formData.profileImages.length; i++) {
      const file = formData.profileImages[i];
      if (file) {
        const filePath = `${user.email}/photo${i}.jpg`;
        const { data, error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (!uploadError) {
          const { error: photoDbError } = await supabase
            .from("user_photos")
            .upsert({
              user_email: user.email,
              photo_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-photos/${filePath}`,
            });

          if (photoDbError) console.error(photoDbError.message);
        } else {
          console.error(uploadError.message);
        }
      }
    }

    alert("Profile updated!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4 overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg flex flex-col max-h-[calc(100vh-2rem)] relative">
        {/* Top Navigation Bar */}
        <TopNavButtons />

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold">Edit Profile</h2>

            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full p-2 border rounded-md"
            />

            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => handleChange("birth_date", e.target.value)}
              className="w-full p-2 border rounded-md"
            />

            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Gender</option>
              {genderOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={formData.study}
              onChange={(e) => handleChange("study", e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Study Program</option>
              {studyOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={formData.faculty}
              onChange={(e) => handleChange("faculty", e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Faculty</option>
              {facultyOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <select
              value={formData.intentions}
              onChange={(e) => handleChange("intentions", e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Intention</option>
              {intentionOptions.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>

            <label className="block font-semibold">
              Profile Pictures (Max 3)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="relative group w-full aspect-square bg-gray-100 border border-dashed border-gray-400 rounded-md overflow-hidden"
                >
                  <label className="absolute inset-0 flex items-center justify-center cursor-pointer z-10">
                    {formData.profileImages[index] ? (
                      <>
                        <img
                          src={URL.createObjectURL(
                            formData.profileImages[index] as File
                          )}
                          alt={`Profile ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                          Change Photo
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 text-sm w-full h-full">
                        <span>Click to upload</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const newImages = [...formData.profileImages];
                        newImages[index] = file;
                        handleChange("profileImages", newImages);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {formData.prompts.map((prompt, idx) => (
                <textarea
                  key={idx}
                  placeholder={`Prompt ${idx + 1}`}
                  value={prompt}
                  onChange={(e) => handlePromptChange(idx, e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={2}
                />
              ))}
            </div>

            <button
              type="submit"
              className="block w-[150px] mx-auto bg-purple-500 text-white py-2 rounded-md hover:bg-purple-700"
            >
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
