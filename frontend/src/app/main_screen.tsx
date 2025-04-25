'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import TopNavButtons from '@/components/topnavbar';

export default function MainScreen() {

  const router = useRouter();

  const goToEditProfile = () => {
    router.push('/edit-profile'); 
  };

  // Sample profile data for multiple photos and prompts
  const profileData = {
    name: "Alex",
    age: 29,
    gender: "Male",
    study: "Undergraduate",
    faculty: "Engineering",
    hobbies: ["Reading", "Hiking", "Cooking"],
    intentions: "Networking",
    photos: [
        "/images/apple.jpg",
        "/images/orange.jpg",
        "/images/banana.jpeg",
      ],
    prompts: [
      { question: "My favorite food is", answer: "Pizza" },
      { question: "I'm really good at", answer: "Photography" },
      { question: "A fun fact about me", answer: "I’ve been to over 10 countries!" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">

      {/* Top Navigation Buttons */}
      <TopNavButtons />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="p-4">
          <h1 className="text-2xl font-semibold">{profileData.name}, {profileData.age}</h1>
        </div>

        {/* Options Display */}
        <div className="p-4 space-y-2">
          {/* Options (on a single line) */}
          <div className="flex gap-1 overflow-x-auto whitespace-nowrap -mt-4">
            {/* Gender */}
            <span className="px-2 py-1 rounded-full bg-blue-200 text-blue-800 text-xs">{profileData.gender}</span>
            {/* Study Program */}
            <span className="px-2 py-1 rounded-full bg-green-200 text-green-800 text-xs">{profileData.study}</span>
            {/* Faculty */}
            <span className="px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 text-xs">{profileData.faculty}</span>
            {/* Hobbies */}
            {profileData.hobbies.map((hobby, index) => (
              <span key={index} className="px-2 py-1 rounded-full bg-purple-200 text-purple-800 text-xs">{hobby}</span>
            ))}
            {/* Intentions */}
            <span className="px-2 py-1 rounded-full bg-red-200 text-red-800 text-xs">{profileData.intentions}</span>
          </div>
        </div>

        {/* Scrollable Profile Content */}
        <div className="overflow-y-scroll max-h-[calc(100vh-20rem)] p-4 space-y-8">
          {/* Alternating Photos and Prompts */}
          {profileData.photos.map((photo, index) => (
            <div key={index} className="space-y-4">
              {/* Display Photo */}
              <div className="relative w-full h-96">
                <img
                  src={photo}
                  alt={`Profile Photo ${index + 1}`}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>

              {/* Display Prompt */}
              <div className="space-y-2">
                <p className="font-semibold">{profileData.prompts[index].question}</p>
                <input
                  type="text"
                  value={profileData.prompts[index].answer}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Like / Dislike Buttons */}
        <div className="flex justify-between mt-6 p-4">
          <button className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-xl hover:bg-red-200">
            ✘
          </button>
          <button className="bg-green-400 text-white px-4 py-2 rounded-full text-xl hover:bg-green-600">
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
}
