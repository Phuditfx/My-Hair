"use client";

import { useEffect, useState } from "react";
import { fetchAllUsers, updateUserRole, deleteUser } from "@/app/actions/admin";
import { Scissors, Shield, Trash2, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

type Profile = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const res = await fetchAllUsers();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setUsers(res.data);
    }
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const res = await updateUserRole(userId, newRole);
    if (res.error) {
      alert(res.error);
    } else {
      loadUsers(); // reload after change
    }
  }

  async function handleDelete(userId: string) {
    if (confirm("คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?")) {
      const res = await deleteUser(userId);
      if (res.error) {
        alert(res.error);
      } else {
        loadUsers();
      }
    }
  }

  const roleColors: Record<string, string> = {
    admin: "bg-purple-500/20 text-purple-500 border-purple-500/30",
    vip: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    member: "bg-green-500/20 text-green-500 border-green-500/30",
    pending: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  };

  const getRoleBadge = (role: string) => {
    const colorClass = roleColors[role] || "bg-muted text-muted-foreground";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass} capitalize`}>
        {role === "pending" && <Clock className="w-3 h-3 inline mr-1" />}
        {role === "admin" && <Shield className="w-3 h-3 inline mr-1" />}
        {role === "member" && <CheckCircle className="w-3 h-3 inline mr-1" />}
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <Scissors className="w-8 h-8 text-primary mb-4 animate-spin" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูลผู้ใช้...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6">
            <h2 className="font-bold text-lg mb-2">เข้าถึงไม่ได้</h2>
            <p>{error}</p>
          </div>
          <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" style={{ backgroundImage: "var(--gradient-surface)" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              จัดการผู้ใช้งาน
            </h1>
            <p className="text-muted-foreground mt-1">อนุมัติและจัดการระดับสิทธิ์ของผู้ใช้งาน</p>
          </div>
          <Link href="/" className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-muted transition">
            กลับหน้าหลัก
          </Link>
        </div>

        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-6 py-4 text-sm font-medium text-muted-foreground">ผู้ใช้งาน (Email/ID)</th>
                  <th className="px-6 py-4 text-sm font-medium text-muted-foreground">สถานะ (Role)</th>
                  <th className="px-6 py-4 text-sm font-medium text-muted-foreground">วันที่สมัคร</th>
                  <th className="px-6 py-4 text-sm font-medium text-muted-foreground text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">{u.email || u.id}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1 truncate max-w-[200px]">{u.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <select
                          className="bg-muted border border-border text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/50"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="pending">รออนุมัติ (Pending)</option>
                          <option value="member">สมาชิกทั่วไป (Member)</option>
                          <option value="vip">สมาชิกพิเศษ (VIP)</option>
                          <option value="admin">แอดมิน (Admin)</option>
                        </select>
                        
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                          title="ลบผู้ใช้นี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      ไม่พบผู้ใช้งานในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
