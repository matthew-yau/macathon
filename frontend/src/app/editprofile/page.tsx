'use client';

import { useState } from 'react';
import TopNavButtons from '@/components/topnavbar';

const genderOptions = ['Male', 'Female', 'Other'];
const studyOptions = ['Undergraduate', 'Postgraduate', 'PHD'];
const facultyOptions = ['Arts', 'Science', 'Engineering', 'Business', 'IT'];
const hobbyOptions = ['Reading', 'Hiking', 'Gaming', 'Cooking'];
const intentionOptions = ['Study Buddy', 'Friendship', 'Networking'];

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: '',
    study: '',
    faculty: '',
    hobbies: [] as string[],
    intentions: '',
    prompts: ['', '', ''],
    profileImages: [null, null, null] as (File | null)[],
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...formData.prompts];
    newPrompts[index] = value;
    setFormData({ ...formData, prompts: newPrompts });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Later: Save to backend or Supabase
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <TopNavButtons />

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl space-y-4 mt-16">
        <h2 className="text-2xl font-bold">Edit Profile</h2>

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        <input
          type="date"
          value={formData.birth_date}
          onChange={(e) => handleChange('birth_date', e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        <select
          value={formData.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Gender</option>
          {genderOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          value={formData.study}
          onChange={(e) => handleChange('study', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Study Program</option>
          {studyOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={formData.faculty}
          onChange={(e) => handleChange('faculty', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Faculty</option>
          {facultyOptions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <label className="block font-semibold">Hobbies</label>
        <div className="flex flex-wrap gap-2">
          {hobbyOptions.map((hobby) => (
            <label key={hobby} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={hobby}
                checked={formData.hobbies.includes(hobby)}
                onChange={(e) => {
                  const newHobbies = e.target.checked
                    ? [...formData.hobbies, hobby]
                    : formData.hobbies.filter((h) => h !== hobby);
                  handleChange('hobbies', newHobbies);
                }}
              />
              <span>{hobby}</span>
            </label>
          ))}
        </div>

        <select
          value={formData.intentions}
          onChange={(e) => handleChange('intentions', e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Intention</option>
          {intentionOptions.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>

        {/* Profile Image Upload - 3 Fixed Slots */}
        <div className="space-y-2">
        <label className="block font-semibold">Profile Pictures (Max 3)</label>
        <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
            <div key={index} className="relative group w-full aspect-square bg-gray-100 border border-dashed border-gray-400 rounded-md overflow-hidden">
                <label className="absolute inset-0 flex items-center justify-center cursor-pointer z-10">
                {formData.profileImages[index] ? (
                    <>
                    <img
                        src={URL.createObjectURL(formData.profileImages[index] as File)}
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
                    handleChange('profileImages', newImages);
                    }}
                    className="hidden"
                />
                </label>
            </div>
            ))}
        </div>
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

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
          Save Profile
        </button>
      </form>
    </div>
  );
}
