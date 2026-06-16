"use client"

import { useEffect, useState, useTransition } from "react"
import { fetchAllUsers, updateUserRole, deleteUser } from "@/app/actions/admin"
import { Search, Shield, Sparkles, UserCheck, Clock, Trash2, ChevronDown, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface Profile {
  id: string
  email: string
  role: string
  created_at: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    const result = await fetchAllUsers()
    if (result.data) {
      setUsers(result.data)
    } else if (result.error) {
      toast.error(result.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)
      if (result.success) {
        toast.success("เปลี่ยนสถานะสำเร็จ")
        loadUsers()
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด")
      }
      setOpenDropdown(null)
    })
  }

  const handleDelete = (userId: string, email: string) => {
    if (!confirm(`คุณต้องการลบผู้ใช้ ${email} ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) return

    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result.success) {
        toast.success(`ลบผู้ใช้ ${email} เรียบร้อยแล้ว`)
        loadUsers()
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด")
      }
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="badge-admin text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Shield className="w-3 h-3" /> แอดมิน
          </span>
        )
      case "vip":
        return (
          <span className="badge-vip text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> VIP
          </span>
        )
      case "member":
        return (
          <span className="badge-member text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> สมาชิก
          </span>
        )
      default:
        return (
          <span className="badge-pending text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> รออนุมัติ
          </span>
        )
    }
  }

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  const roleOptions = [
    { value: "admin", label: "แอดมิน", icon: Shield },
    { value: "vip", label: "VIP", icon: Sparkles },
    { value: "member", label: "สมาชิก", icon: UserCheck },
    { value: "pending", label: "รออนุมัติ", icon: Clock },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <RefreshCw className="w-8 h-8 animate-spin mb-4 opacity-50" />
        <p className="font-medium">กำลังโหลดข้อมูลผู้ใช้...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search & Stats Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาด้วยอีเมลหรือสถานะ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
          />
        </div>
        <button
          onClick={loadUsers}
          disabled={isPending}
          className="p-2.5 rounded-xl hover:bg-muted transition-all"
          title="รีเฟรช"
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {[
          { label: "ทั้งหมด", count: users.length, color: "text-foreground" },
          { label: "รออนุมัติ", count: users.filter(u => u.role === "pending").length, color: "text-warning" },
          { label: "สมาชิก", count: users.filter(u => u.role === "member").length, color: "text-success" },
          { label: "VIP", count: users.filter(u => u.role === "vip").length, color: "text-accent" },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 font-semibold text-muted-foreground">อีเมล</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">สถานะ</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">วันที่สมัคร</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <p className="font-medium">{user.email || "ไม่มีอีเมล"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{user.id.slice(0, 8)}...</p>
                  </td>
                  <td className="p-4">{getRoleBadge(user.role)}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Role Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-all"
                        >
                          เปลี่ยนสถานะ <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdown === user.id && (
                          <div className="absolute right-0 top-full mt-1 z-50 w-40 glass-card rounded-xl shadow-xl border border-border/50 py-1 animate-scale-in">
                            {roleOptions.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => handleRoleChange(user.id, opt.value)}
                                disabled={user.role === opt.value}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        title="ลบผู้ใช้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    {search ? "ไม่พบผู้ใช้ที่ตรงกับการค้นหา" : "ยังไม่มีผู้ใช้ในระบบ"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
