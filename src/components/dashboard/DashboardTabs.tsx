"use client"

import * as Tabs from "@radix-ui/react-tabs"
import { BookOpen, Palette, Sparkles, PlusCircle } from "lucide-react"
import { useState } from "react"
import LessonEditor from "./LessonEditor"
import ColorFormulaEditor from "./ColorFormulaEditor"

export default function DashboardTabs({ role }: { role: string }) {
  const [activeTab, setActiveTab] = useState("lessons")

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-6">
      <Tabs.List className="flex w-full bg-muted/50 p-1 rounded-xl overflow-x-auto">
        <Tabs.Trigger 
          value="lessons" 
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap"
        >
          <BookOpen className="w-4 h-4" />
          Lesson Notebooks
        </Tabs.Trigger>
        <Tabs.Trigger 
          value="colors" 
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all whitespace-nowrap"
        >
          <Palette className="w-4 h-4" />
          Colorist Archive
        </Tabs.Trigger>
        
        {role === "admin" && (
          <Tabs.Trigger 
            value="ai-editor" 
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            AI Custom Editor
          </Tabs.Trigger>
        )}
      </Tabs.List>

      <Tabs.Content value="lessons" className="outline-none min-h-[500px]">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Knowledge Base</h2>
              <p className="text-sm text-muted-foreground mt-1">Browse and search existing haircut and styling lessons.</p>
            </div>
            {role === "admin" && (
              <button onClick={() => setActiveTab("ai-editor")} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90">
                <PlusCircle className="w-4 h-4" /> Create Lesson
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
            <p>No lessons found in this workspace.</p>
          </div>
        </div>
      </Tabs.Content>

      <Tabs.Content value="colors" className="outline-none min-h-[500px]">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Color Formula Archive</h2>
              <p className="text-sm text-muted-foreground mt-1">Database of color transformations and formulas.</p>
            </div>
            {role === "admin" && (
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90">
                <PlusCircle className="w-4 h-4" /> Add Formula
              </button>
            )}
          </div>

          <ColorFormulaEditor role={role} />
        </div>
      </Tabs.Content>

      {role === "admin" && (
        <Tabs.Content value="ai-editor" className="outline-none min-h-[500px]">
          <LessonEditor />
        </Tabs.Content>
      )}
    </Tabs.Root>
  )
}
