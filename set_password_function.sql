-- สำหรับการทดสอบ: ฟังก์ชันนี้ใช้เพื่อเปลี่ยนรหัสผ่านได้ทันทีโดยไม่ต้องส่งอีเมลยืนยัน
-- ⚠️ คำเตือน: ไม่ควรใช้ในระบบ Production เด็ดขาด ควรใช้สำหรับช่วงทดสอบเท่านั้น
-- วิธีใช้: นำโค้ดนี้ไปรันใน SQL Editor ของ Supabase Project ของคุณ

CREATE OR REPLACE FUNCTION set_user_password(user_email text, new_password text)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
