"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";

const Profile = () => {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.email}!</h1>
          <p>User ID: {user.id}</p>
        </div>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

export default Profile;
