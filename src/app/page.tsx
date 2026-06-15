import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import DashboardTabs from "@/components/dashboard/DashboardTabs"

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
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Awaiting Approval</h2>
          <p className="text-neutral-500 mb-6">Your account is pending administrator approval. Please check back later.</p>
          <form action={async () => {
            "use server"
            const sb = await createClient()
            await sb.auth.signOut()
            redirect("/login")
          }}>
            <button type="submit" className="text-sm font-medium text-black hover:underline">
              Log out
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Workspace</h1>
          <p className="text-muted-foreground">Manage your lessons, color formulas, and AI generations.</p>
        </div>
        
        <DashboardTabs role={role} />
      </main>
    </div>
  )
}
