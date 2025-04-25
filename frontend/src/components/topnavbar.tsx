"use client";
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { GiHearts } from "react-icons/gi";

export default function TopNavButtons() {
  const router = useRouter();

  return (
    <div className="w-full flex justify-center gap-4 px-4 py-1 bg-[#202020] rounded-t-2xl">
      <button
        onClick={() => router.push("/")}
        className="p-3 rounded-full hover:bg-blue-800 text-white transition duration-300 shadow-sm"
        title="Main"
      >
        <FaHome size={20} />
      </button>
      <button
        onClick={() => router.push("/editprofile")}
        className="p-3 rounded-full hover:bg-yellow-800 text-white transition duration-300 shadow-sm"
        title="Edit Profile"
      >
        <MdEdit size={20} />
      </button>
      <button
        onClick={() => router.push("/matches")}
        className="p-3 rounded-full hover:bg-purple-800 text-white transition duration-300 shadow-sm"
        title="Matches"
      >
        <GiHearts size={20} />
      </button>
    </div>
  );
}
