"use client"

import * as Tabs from "@radix-ui/react-tabs"
import { BookOpen, Palette, Sparkles, PlusCircle, Users, Package } from "lucide-react"
import { useState } from "react"
import LessonEditor from "./LessonEditor"
import ColorFormulaEditor from "./ColorFormulaEditor"
import AdminPanel from "./AdminPanel"
import BrandManager from "./BrandManager"

export default function DashboardTabs({ role }: { role: string }) {
  const [activeTab, setActiveTab] = useState("lessons")

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-6 pb-24 md:pb-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <Tabs.List className="flex w-full glass-card p-1.5 overflow-x-auto fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl rounded-b-none border-t border-border/50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:relative md:rounded-xl md:border-t-0 md:pb-1.5 md:shadow-none">
        <Tabs.Trigger 
          value="lessons" 
          className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-sm font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary md:data-[state=active]:bg-card md:data-[state=active]:text-foreground md:data-[state=active]:shadow-sm transition-all duration-300 whitespace-nowrap"
        >
          <BookOpen className="w-5 h-5 md:w-4 md:h-4" />
          บทเรียน
        </Tabs.Trigger>
        <Tabs.Trigger 
          value="colors" 
          className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-sm font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary md:data-[state=active]:bg-card md:data-[state=active]:text-foreground md:data-[state=active]:shadow-sm transition-all duration-300 whitespace-nowrap"
        >
          <Palette className="w-5 h-5 md:w-4 md:h-4" />
          สูตรสี
        </Tabs.Trigger>
        <Tabs.Trigger 
          value="products" 
          className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-sm font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary md:data-[state=active]:bg-card md:data-[state=active]:text-foreground md:data-[state=active]:shadow-sm transition-all duration-300 whitespace-nowrap"
        >
          <Package className="w-5 h-5 md:w-4 md:h-4" />
          ผลิตภัณฑ์
        </Tabs.Trigger>
        
        {role === "admin" && (
          <>
            <Tabs.Trigger 
              value="ai-editor" 
              className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-sm font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary md:data-[state=active]:bg-card md:data-[state=active]:text-foreground md:data-[state=active]:shadow-sm transition-all duration-300 whitespace-nowrap"
            >
              <Sparkles className="w-5 h-5 md:w-4 md:h-4" />
              เนื้อหา
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="admin" 
              className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 text-[10px] md:text-sm font-medium rounded-lg text-muted-foreground data-[state=active]:text-primary md:data-[state=active]:bg-card md:data-[state=active]:text-foreground md:data-[state=active]:shadow-sm transition-all duration-300 whitespace-nowrap"
            >
              <Users className="w-5 h-5 md:w-4 md:h-4" />
              ผู้ใช้
            </Tabs.Trigger>
          </>
        )}
      </Tabs.List>

      <Tabs.Content value="lessons" className="outline-none min-h-[500px]">
        <div className="glass-card rounded-2xl p-6 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">คลังความรู้</h2>
              <p className="text-sm text-muted-foreground mt-1">เรียกดูและค้นหาบทเรียนเกี่ยวกับการตัดผมและจัดทรง</p>
            </div>
            {role === "admin" && (
              <button onClick={() => setActiveTab("ai-editor")} className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-all glow-hover" style={{ background: "var(--gradient-primary)" }}>
                <PlusCircle className="w-4 h-4" /> สร้างบทเรียน
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">ยังไม่มีบทเรียนในพื้นที่นี้</p>
            <p className="text-sm opacity-60 mt-1">เริ่มสร้างเนื้อหาใหม่เพื่อเพิ่มบทเรียน</p>
          </div>
        </div>
      </Tabs.Content>

      <Tabs.Content value="colors" className="outline-none min-h-[500px]">
        <div className="glass-card rounded-2xl p-6 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">คลังสูตรสี</h2>
              <p className="text-sm text-muted-foreground mt-1">ฐานข้อมูลสูตรสีผมและเทคนิคการผสมสี</p>
            </div>
            {role === "admin" && (
              <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-all glow-hover" style={{ background: "var(--gradient-primary)" }}>
                <PlusCircle className="w-4 h-4" /> เพิ่มสูตรสี
              </button>
            )}
          </div>

          <ColorFormulaEditor role={role} />
        </div>
      </Tabs.Content>

      {role === "admin" && (
        <>
          <Tabs.Content value="ai-editor" className="outline-none min-h-[500px]">
            <LessonEditor />
          </Tabs.Content>
          <Tabs.Content value="admin" className="outline-none min-h-[500px]">
            <div className="glass-card rounded-2xl p-6 shadow-sm animate-fade-in">
              <h2 className="text-xl font-bold mb-1">จัดการผู้ใช้งาน</h2>
              <p className="text-sm text-muted-foreground mb-6">อนุมัติ เปลี่ยนสถานะ หรือลบผู้ใช้งานในระบบ</p>
              <AdminPanel />
            </div>
          </Tabs.Content>
        </>
      )}

      <Tabs.Content value="products" className="outline-none min-h-[500px]">
        <div className="glass-card rounded-2xl p-6 shadow-sm animate-fade-in">
          <h2 className="text-xl font-bold mb-1">ผลิตภัณฑ์และแบรนด์</h2>
          <p className="text-sm text-muted-foreground mb-6">รวมแบรนด์สีผม น้ำยาดัด น้ำยายืด ที่ใช้ในร้าน</p>
          <BrandManager role={role} />
        </div>
      </Tabs.Content>
    </Tabs.Root>
  )
}
