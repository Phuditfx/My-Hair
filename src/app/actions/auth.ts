'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
  // ตรวจสอบ Environment Variables ก่อนเลย
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Vercel Error: ไม่พบค่า NEXT_PUBLIC_SUPABASE_URL ใน Environment Variables (อาจพิมพ์ชื่อ Key ผิด หรือยังไม่ได้ตั้งค่า)" }
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: "Vercel Error: ไม่พบค่า NEXT_PUBLIC_SUPABASE_ANON_KEY ใน Environment Variables" }
  }

  try {
    const supabase = await createClient()

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      return { error: `Supabase Error: ${error.message}` }
    }

    // ตรวจสอบสถานะรออนุมัติ
    if (authData?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profile?.role === 'pending') {
        await supabase.auth.signOut()
        return { error: 'บัญชีของคุณกำลังรอการอนุมัติจาก Admin' }
      }
    }
  } catch (err: any) {
    return { error: `System Error: ${err.message}` }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/pending')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
