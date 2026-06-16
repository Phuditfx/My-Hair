import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import DashboardTabs from "@/components/dashboard/DashboardTabs"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role || "pending"

  if (role === "pending") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="animate-scale-in glass-card p-8 rounded-2xl text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--gradient-primary)" }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">รอการอนุมัติ</h2>
          <p className="text-muted-foreground mb-6">บัญชีของคุณอยู่ระหว่างรอแอดมินอนุมัติ กรุณาตรวจสอบอีกครั้งในภายหลัง</p>
          <form action={async () => {
            "use server"
            const sb = await createClient()
            await sb.auth.signOut()
            redirect("/login")
          }}>
            <button type="submit" className="text-sm font-medium text-primary hover:underline transition-colors">
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar role={role} />
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold tracking-tight mb-2 gradient-text">พื้นที่ทำงาน</h1>
          <p className="text-muted-foreground">จัดการบทเรียน สูตรสี และเนื้อหาต่างๆ ของคุณ</p>
        </div>
        
        <DashboardTabs role={role} />
      </main>
    </div>
  )
}
