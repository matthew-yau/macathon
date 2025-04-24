// src/app/supa/test/route.js
import { NextResponse } from 'next/server'
import { supabase } from '../../../../supabaseClient'

export async function GET() {
  // (optional) sanity‐check your env-vars in the server logs:
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0,8) + '…')

  const { data, error, status } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: status || 500 }
    )
  }

  return NextResponse.json({ data }, { status: 200 })
}
