"use client";

import { Clock, LogOut } from "lucide-react";
import { signout } from "@/app/actions/auth";

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4" style={{ backgroundImage: "var(--gradient-surface)" }}>
      <div className="animate-scale-in max-w-md w-full glass-card rounded-2xl shadow-xl p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 rounded-full mb-6 bg-amber-500/10 text-amber-500 animate-pulse">
            <Clock className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold mb-2">รอการอนุมัติสิทธิ์</h1>
          <p className="text-muted-foreground text-sm">
            บัญชีของคุณกำลังรอการตรวจสอบและอนุมัติสิทธิ์การเข้าใช้งานจากผู้ดูแลระบบ
            โปรดลองเข้าสู่ระบบใหม่อีกครั้งในภายหลัง
          </p>
        </div>

        <form action={signout} className="mt-8">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-foreground bg-muted/50 hover:bg-muted transition-colors w-full border border-border"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
