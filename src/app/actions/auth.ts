"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const DUMMY_PASSWORD = "EmailOnlyLogin123!"

export async function loginWithEmailOnly(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string
    if (!email) {
      return { error: "Email is required" }
    }

    const supabase = await createClient()

    const isAdmin = email === 'phudit.fx@gmail.com' || email === 'phudit.mahawongsanan@gmail.com'
    const targetRole = isAdmin ? 'admin' : 'pending'

    let user = null
    let session = null
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: DUMMY_PASSWORD,
    })

    user = signInData?.user
    session = signInData?.session

    if (signInError) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: DUMMY_PASSWORD,
      })
      
      if (signUpError) {
        let msg = signUpError.message || JSON.stringify(signUpError);
        return { error: `Supabase Auth Error: ${msg}` }
      }
      
      user = signUpData?.user
      session = signUpData?.session
    }

    if (user && !session) {
      return { error: "Please disable 'Confirm Email' in Supabase Auth Settings to allow email-only login." }
    }

    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email: email, role: targetRole })
        
      if (profileError) {
        console.error("Profile update error:", profileError)
      }
    }

  } catch (err: any) {
    console.error("Action Exception:", err);
    return { error: `Server Exception: ${err?.message || JSON.stringify(err) || "Unknown error"}` }
  }

  redirect("/")
}
