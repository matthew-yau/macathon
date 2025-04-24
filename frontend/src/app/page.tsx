import Image from "next/image";
import Link from 'next/link'
import React from 'react'

export default function Home() {
  return (
    <div>
      <h1>Welcome!</h1>
      <Link href="/supa/test">
        Go to Supa page
      </Link>
    </div>
  );
}
