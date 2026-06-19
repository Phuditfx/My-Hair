"use client";

import { useActionState } from "react";
import { Scissors } from "lucide-react";
import { signup } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, null);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4" style={{ backgroundImage: "var(--gradient-surface)" }}>
      <div className="animate-scale-in max-w-md w-full glass-card rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-xl mb-4 glow-hover" style={{ background: "var(--gradient-primary)" }}>
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">สมัครสมาชิก</h1>
          <p className="text-muted-foreground text-sm mt-1">สร้างบัญชีผู้ใช้ใหม่สำหรับ HairMaster Pro</p>
        </div>

        {state?.error && (
          <div className="animate-slide-down bg-destructive/10 text-destructive p-3 rounded-xl text-sm mb-6 border border-destructive/20">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">อีเมล / ไอดี (ID)</label>
            <input
              name="email"
              type="text"
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300 placeholder:text-muted-foreground/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">รหัสผ่าน</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all duration-300 placeholder:text-muted-foreground/50"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-50 glow-hover"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isPending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          มีบัญชีอยู่แล้วใช่ไหม? <Link href="/login" className="text-primary hover:underline font-medium">เข้าสู่ระบบ</Link>
        </p>
      </div>

      <p className="text-muted-foreground/50 text-xs mt-8">
        © 2026 HairMaster Pro — สงวนลิขสิทธิ์
      </p>
    </div>
  );
}
