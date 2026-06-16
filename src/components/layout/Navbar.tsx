"use client"

import { useTheme } from "next-themes"
import { useWorkspace } from "../workspace-provider"
import { Moon, Sun, Scissors, LogOut, Shield, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Navbar({ role }: { role: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const { workspace, setWorkspace } = useWorkspace()
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return (
          <span className="badge-admin text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" />
            แอดมิน
          </span>
        )
      case "vip":
        return (
          <span className="badge-vip text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            VIP
          </span>
        )
      case "member":
        return (
          <span className="badge-member text-xs font-semibold px-2.5 py-1 rounded-full">
            สมาชิก
          </span>
        )
      default:
        return (
          <span className="badge-pending text-xs font-semibold px-2.5 py-1 rounded-full">
            รออนุมัติ
          </span>
        )
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-6xl">
        <div className="flex items-center gap-2.5 font-bold text-lg">
          <div className="p-1.5 rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline-block gradient-text font-extrabold tracking-tight">
            HairMaster Pro
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Workspace Switcher */}
          <div className="flex bg-muted/80 p-1 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => setWorkspace("salon")}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                workspace === "salon"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              💇‍♀️ ซาลอน
            </button>
            <button
              onClick={() => setWorkspace("barber")}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                workspace === "barber"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              💈 บาร์เบอร์
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-all duration-300 hover:scale-105"
            title={mounted && resolvedTheme === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
          >
            {mounted && resolvedTheme === "dark" 
              ? <Sun className="h-4 w-4 text-warning" /> 
              : <Moon className="h-4 w-4" />
            }
          </button>

          <div className="h-6 w-px bg-border/50"></div>

          {/* Role Badge */}
          {getRoleBadge()}

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
            title="ออกจากระบบ"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
