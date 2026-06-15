"use client"

import { useTheme } from "next-themes"
import { useWorkspace } from "../workspace-provider"
import { Moon, Sun, Scissors, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function Navbar({ role }: { role: string }) {
  const { theme, setTheme } = useTheme()
  const { workspace, setWorkspace } = useWorkspace()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-6xl">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Scissors className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline-block">HairMaster Pro</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setWorkspace("salon")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                workspace === "salon" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Salon
            </button>
            <button
              onClick={() => setWorkspace("barber")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                workspace === "barber" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Barber
            </button>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="h-6 w-px bg-border mx-1"></div>
          
          <div className="text-xs font-medium px-2 py-1 bg-muted rounded-md uppercase tracking-wider">
            {role}
          </div>

          <button 
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors ml-2"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
