'use client';

import { useState } from 'react';
import TopNavButtons from '@/components/topnavbar'; // Make sure to import your TopNavButtons component

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
    // Later: Save to Supabase or your backend service
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      {/* Top Navigation Buttons */}
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
