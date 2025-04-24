'use client';

import { useState } from 'react';

export default function MainScreen() {
  // Sample profile data for multiple photos and prompts
  const profileData = {
    name: "Alex",
    age: 29,
    bio: "Loves hiking, cooking, and spontaneous road trips.",
    photos: [
      "/images/sample-profile1.jpg",
      "/images/sample-profile2.jpg",
      "/images/sample-profile3.jpg",
    ],
    prompts: [
      { question: "My favorite food is", answer: "Pizza" },
      { question: "I'm really good at", answer: "Photography" },
      { question: "A fun fact about me", answer: "I’ve been to over 10 countries!" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="p-4">
          <h1 className="text-2xl font-semibold">{profileData.name}, {profileData.age}</h1>
          <p className="text-gray-600 mt-1">{profileData.bio}</p>
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
          <button className="bg-green-500 text-white px-6 py-2 rounded-full text-xl hover:bg-green-600">
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
}
