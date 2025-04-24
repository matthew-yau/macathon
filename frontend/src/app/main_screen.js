// src/app/main_screen.js

import ProfileCard from './profileCard';

export default function Home() {
  return (
    <div className="container">
      <ProfileCard />
      <div className="navbar">
        <a href="#">Home</a>
        <a href="#">Likes</a>
        <a href="#">Profile</a>
      </div>
    </div>
  );
}
