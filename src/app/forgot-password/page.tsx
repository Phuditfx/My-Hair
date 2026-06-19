"use client";

import { useActionState } from "react";
import { Scissors, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4" style={{ backgroundImage: "var(--gradient-surface)" }}>
      <div className="animate-scale-in max-w-md w-full glass-card rounded-2xl shadow-xl p-8 relative">
        <Link href="/login" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="p-3.5 rounded-xl mb-4 glow-hover" style={{ background: "var(--gradient-primary)" }}>
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">ลืมรหัสผ่าน</h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
          </p>
        </div>

        {state?.error && (
          <div className="animate-slide-down bg-destructive/10 text-destructive p-3 rounded-xl text-sm mb-6 border border-destructive/20">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="animate-slide-down bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm mb-6 border border-emerald-500/20 text-center">
            {state.success}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">อีเมลที่ใช้สมัคร</label>
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
            {isPending ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}
