"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const DUMMY_PASSWORD = "EmailOnlyLogin123!"

export async function loginWithEmailOnly(formData: FormData) {
  const email = formData.get("email") as string
  if (!email) {
    return { error: "Email is required" }
  }

  const supabase = await createClient()

  // Determine target role based on email
  const isAdmin = email === 'phudit.fx@gmail.com' || email === 'phudit.mahawongsanan@gmail.com'
  const targetRole = isAdmin ? 'admin' : 'pending'

  // Try to sign in first
  let user = null
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: DUMMY_PASSWORD,
  })

  user = signInData?.user

  // If sign in fails, try to sign up
  if (signInError) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: DUMMY_PASSWORD,
    })
    
    if (signUpError) {
      return { error: signUpError.message }
    }
    
    user = signUpData?.user
  }

  // Ensure their profile exists and role is correct
  if (user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        role: targetRole 
      })
      
    if (profileError) {
      console.error("Failed to update profile role:", profileError)
    }
  }

  redirect("/")
}
