'use client';

import { useState } from 'react';
import TopNavButtons from '@/components/topnavbar'; // Import the TopNavButtons component

const matchesData = [
  {
    name: 'Sophia',
    age: 26,
    bio: 'Adventurer, foodie, and dog lover. Always looking for my next travel buddy!',
    photo: '/images/apple.jpg',
  },
  {
    name: 'Liam',
    age: 31,
    bio: 'Fitness enthusiast and tech nerd. Love hiking and playing video games.',
    photo: '/images/orange.jpg',
  },
  {
    name: 'Emma',
    age: 24,
    bio: 'Passionate about photography and painting. Let’s explore art galleries together!',
    photo: '/images/banana.jpeg',
  },
];

export default function MatchesPage() {
  const [liked, setLiked] = useState<string[]>([]);
  const [disliked, setDisliked] = useState<string[]>([]);

  const handleLike = (name: string) => {
    setLiked((prev) => [...prev, name]);
  };

  const handleDislike = (name: string) => {
    setDisliked((prev) => [...prev, name]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      {/* Top Navigation Buttons */}
      <TopNavButtons />

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg mt-16 p-6 space-y-6">
        <h2 className="text-2xl font-semibold">Your Matches</h2>
        
        {/* Loop through matches data */}
        {matchesData.map((match, index) => (
          <div key={index} className="relative bg-gray-200 rounded-xl shadow-md overflow-hidden p-4 space-y-4">
            {/* Match Photo */}
            <div className="relative w-full h-72 rounded-lg overflow-hidden">
              <img
                src={match.photo}
                alt={`Match ${match.name}`}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>

            {/* Match Info */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{match.name}, {match.age}</h3>
              <p className="text-gray-600">{match.bio}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handleDislike(match.name)}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
              >
                ✘ Dislike
              </button>
              <button
                onClick={() => handleLike(match.name)}
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
              >
                ❤️ Like
              </button>
            </div>
          </div>
        ))}

        {/* Display Liked/Disliked */}
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-semibold text-lg">You liked:</h3>
            <ul>
              {liked.map((name, index) => (
                <li key={index} className="text-green-600">{name}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg">You disliked:</h3>
            <ul>
              {disliked.map((name, index) => (
                <li key={index} className="text-red-600">{name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
