-- สร้าง Enum สำหรับ Role (ไม่บังคับ แต่ช่วยควบคุมข้อมูลได้ดีขึ้น)
-- CREATE TYPE user_role AS ENUM ('owner', 'admin', 'receptionist', 'driver', 'maid', 'pending');

-- สร้างตาราง Employee_Profile
CREATE TABLE IF NOT EXISTS public."Employee_Profile" (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT "Employee_Profile_pkey" PRIMARY KEY (id)
);

-- เปิด Row Level Security (RLS)
ALTER TABLE public."Employee_Profile" ENABLE ROW LEVEL SECURITY;

-- สร้าง Policy สำหรับ RLS (ตัวอย่าง: อนุญาตให้ผู้ใช้ที่ล็อกอินสามารถอ่านข้อมูลตัวเองได้)
DROP POLICY IF EXISTS "Users can view own profile" ON public."Employee_Profile";
CREATE POLICY "Users can view own profile" 
ON public."Employee_Profile" FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- (ตัวเลือก) อนุญาตให้ owner/admin อ่านข้อมูลทุกคนได้ 
-- CREATE POLICY "Admins can view all profiles"
-- ON public."Employee_Profile" FOR SELECT 
-- TO authenticated
-- USING ( (SELECT role FROM public."Employee_Profile" WHERE id = auth.uid()) IN ('owner', 'admin') );

-- สร้าง Function สำหรับ Trigger เมื่อมีคนสมัครสมาชิกใหม่
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  -- Super Admin Backdoor Logic
  IF NEW.email IN ('phudit.fx@gmail.com', 'phudit.mahawongsanan@gmail.com') THEN
    assigned_role := 'owner';
  ELSE
    assigned_role := 'pending';
  END IF;

  -- นำข้อมูลจาก auth.users มาใส่ในตาราง Employee_Profile
  INSERT INTO public."Employee_Profile" (id, email, role)
  VALUES (NEW.id, NEW.email, assigned_role);
  
  RETURN NEW;
END;
$$;

-- สร้าง Trigger ผูกกับตาราง auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
