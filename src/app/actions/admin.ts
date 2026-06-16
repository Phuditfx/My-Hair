"use server"

import { createClient } from "@/lib/supabase/server"

export async function fetchAllUsers() {
  const supabase = await createClient()
  
  // Check if the requester is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "ไม่ได้เข้าสู่ระบบ" }

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (requesterProfile?.role !== "admin") {
    return { error: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้" }
  }

  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { error: `เกิดข้อผิดพลาด: ${error.message}` }
  }

  return { data: profiles }
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "ไม่ได้เข้าสู่ระบบ" }

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (requesterProfile?.role !== "admin") {
    return { error: "คุณไม่มีสิทธิ์ดำเนินการนี้" }
  }

  // Prevent changing own role
  if (userId === user.id) {
    return { error: "ไม่สามารถเปลี่ยนสถานะของตัวเองได้" }
  }

  const validRoles = ["admin", "vip", "member", "pending"]
  if (!validRoles.includes(newRole)) {
    return { error: "สถานะไม่ถูกต้อง" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId)

  if (error) {
    return { error: `เกิดข้อผิดพลาด: ${error.message}` }
  }

  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "ไม่ได้เข้าสู่ระบบ" }

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (requesterProfile?.role !== "admin") {
    return { error: "คุณไม่มีสิทธิ์ดำเนินการนี้" }
  }

  if (userId === user.id) {
    return { error: "ไม่สามารถลบบัญชีตัวเองได้" }
  }

  // Delete profile (user in auth will still exist but can't access)
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId)

  if (error) {
    return { error: `เกิดข้อผิดพลาด: ${error.message}` }
  }

  return { success: true }
}
