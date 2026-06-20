"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resetPasswordImmediate(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!email || !newPassword) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  // เรียกใช้ RPC function เพื่อตั้งรหัสผ่านใหม่ทันที (สำหรับทดสอบ)
  const { error } = await supabase.rpc("set_user_password", {
    user_email: email,
    new_password: newPassword,
  });

  if (error) {
    console.error("RPC Error:", error);
    return { 
      error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน (โปรดตรวจสอบว่าได้รัน set_password_function.sql ใน Supabase แล้ว)",
      details: error.message
    };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
