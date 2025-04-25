'use client';
import { useRouter } from 'next/navigation';

export default function TopNavButtons() {
  const router = useRouter();

  return (
    <div className="absolute top-4 left-4 space-x-2 z-50">
      <button
        onClick={() => router.push('/')}
        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm hover:bg-blue-200"
      >
        🏠 Main
      </button>
      <button
        onClick={() => router.push('/editprofile')}
        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm hover:bg-yellow-200"
      >
        ✏️ Edit Profile
      </button>
      <button
        onClick={() => router.push('/matches')}
        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-md text-sm hover:bg-purple-200"
      >
        📱 Chat
      </button>
    </div>
  );
}
