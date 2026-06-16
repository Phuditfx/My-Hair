"use client";

import { useActionState } from "react";
import { Scissors } from "lucide-react";
import { loginWithEmailOnly } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginWithEmailOnly, null);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4" style={{ backgroundImage: "var(--gradient-surface)" }}>
      <div className="animate-scale-in max-w-md w-full glass-card rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-xl mb-4 glow-hover" style={{ background: "var(--gradient-primary)" }}>
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">ยินดีต้อนรับ</h1>
          <p className="text-muted-foreground text-sm mt-1">เข้าสู่ระบบเพื่อใช้งาน HairMaster Pro</p>
        </div>

        {state?.error && (
          <div className="animate-slide-down bg-destructive/10 text-destructive p-3 rounded-xl text-sm mb-6 border border-destructive/20">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">อีเมล</label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300 placeholder:text-muted-foreground/50"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-50 glow-hover"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>

      <p className="text-muted-foreground/50 text-xs mt-8">
        © 2026 HairMaster Pro — สงวนลิขสิทธิ์
      </p>
    </div>
  );
}
