"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const DUMMY_PASSWORD = "EmailOnlyLogin123!"

export async function loginWithEmailOnly(prevState: any, formData: FormData) {
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
  let session = null
  
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: DUMMY_PASSWORD,
  })

  user = signInData?.user
  session = signInData?.session

  // If sign in fails, try to sign up
  if (signInError) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: DUMMY_PASSWORD,
    })
    
    if (signUpError) {
      let errorMessage = signUpError.message;
      if (!errorMessage || errorMessage === "{}" || typeof errorMessage === "object") {
        errorMessage = JSON.stringify(signUpError);
      }
      return { error: `SignUp Error: ${errorMessage} | SignIn Error: ${signInError.message}` }
    }
    
    user = signUpData?.user
    session = signUpData?.session
  }

  // If we got a user but NO session, it means Confirm Email is likely enabled in Supabase!
  // Without a session, the user is NOT logged in, so they will get stuck in an infinite redirect loop.
  if (user && !session) {
    return { error: "Please disable 'Confirm Email' in Supabase Auth Settings to allow email-only login without verification." }
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

  // With useActionState, redirecting directly from the Server Action is safe and robust!
  redirect("/")
}
