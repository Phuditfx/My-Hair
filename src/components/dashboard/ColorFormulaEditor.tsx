"use client"

import { useState } from "react"
import { Plus, Trash2, Crown, ImageIcon, X, Save } from "lucide-react"

interface Step {
  id: string
  title: string
  content: string
  imageFile: File | null
  imagePreview: string | null
}

export default function ColorFormulaEditor({ role }: { role: string }) {
  const [level, setLevel] = useState("")
  const [target, setTarget] = useState("")
  const [brand, setBrand] = useState("")
  const [isVip, setIsVip] = useState(false)
  const [steps, setSteps] = useState<Step[]>([
    { id: crypto.randomUUID(), title: "", content: "", imageFile: null, imagePreview: null }
  ])

  const addStep = () => {
    setSteps(prev => [...prev, {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      imageFile: null,
      imagePreview: null,
    }])
  }

  const removeStep = (id: string) => {
    if (steps.length <= 1) return
    setSteps(prev => prev.filter(s => s.id !== id))
  }

  const updateStep = (id: string, field: keyof Step, value: any) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleStepImage = (id: string, file: File) => {
    const preview = URL.createObjectURL(file)
    setSteps(prev => prev.map(s => s.id === id ? { ...s, imageFile: file, imagePreview: preview } : s))
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
      {/* Editor */}
      <div className="bg-muted/20 border border-border/50 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">เพิ่มสูตรสี</h3>
          <button
            onClick={() => setIsVip(!isVip)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isVip ? "badge-vip" : "bg-muted text-muted-foreground"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            {isVip ? "VIP" : "ทั่วไป"}
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Base Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">ระดับสีเดิม (Base)</label>
              <input 
                type="text" value={level} onChange={e => setLevel(e.target.value)} 
                placeholder="เช่น 5" 
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">สีเป้าหมาย</label>
              <input 
                type="text" value={target} onChange={e => setTarget(e.target.value)} 
                placeholder="เช่น Ash Blonde" 
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
              />
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-medium mb-1">แบรนด์ที่ใช้</label>
            <input 
              type="text" value={brand} onChange={e => setBrand(e.target.value)} 
              placeholder="เช่น Wella, Schwarzkopf, L'Oréal" 
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
            />
          </div>

          {/* Steps */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium">ขั้นตอนการผสมสี ({steps.length})</label>
              <button onClick={addStep} className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80">
                <Plus className="w-3 h-3" /> เพิ่มขั้นตอน
              </button>
            </div>
            
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="bg-background border border-border/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "var(--gradient-primary)" }}>
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => updateStep(step.id, "title", e.target.value)}
                      placeholder={`ขั้นตอนที่ ${index + 1}: เช่น ฟอกสี, ลงสี`}
                      className="flex-1 px-2 py-1 text-sm border-b border-border focus:border-primary outline-none bg-transparent transition-all"
                    />
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(step.id)} className="p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={step.content}
                    onChange={e => updateStep(step.id, "content", e.target.value)}
                    className="w-full h-16 px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary/50 outline-none resize-y font-mono"
                    placeholder="รายละเอียด: สูตร, อัตราส่วน, เวลาพัก..."
                  />
                  {!step.imagePreview ? (
                    <button
                      onClick={() => document.getElementById(`formula-img-${step.id}`)?.click()}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      <ImageIcon className="w-3 h-3" /> แนบรูป
                      <input
                        id={`formula-img-${step.id}`}
                        type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleStepImage(step.id, f) }}
                      />
                    </button>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden h-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={step.imagePreview} alt="" className="object-cover w-full h-full" />
                      <button
                        onClick={() => { updateStep(step.id, "imageFile", null); updateStep(step.id, "imagePreview", null) }}
                        className="absolute top-1 right-1 bg-black/50 text-white p-0.5 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            className="w-full py-2 rounded-xl font-semibold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Save className="w-4 h-4" /> บันทึกสูตรสี
          </button>
        </div>
      </div>
      
      {/* Preview */}
      <div className="glass-card rounded-xl p-6">
        {(level || target || steps.some(s => s.content)) ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">ตัวอย่างสูตร</h3>
              {isVip && <span className="badge-vip text-[10px] px-1.5 py-0.5 rounded-full">VIP</span>}
            </div>
            {(level || target) && (
              <div className="flex gap-3 text-sm">
                {level && <span className="bg-muted px-3 py-1 rounded-lg">Base: <strong>{level}</strong></span>}
                {target && <span className="bg-muted px-3 py-1 rounded-lg">เป้าหมาย: <strong>{target}</strong></span>}
                {brand && <span className="bg-muted px-3 py-1 rounded-lg">แบรนด์: <strong>{brand}</strong></span>}
              </div>
            )}
            <div className="space-y-3">
              {steps.map((step, index) => (
                (step.title || step.content) && (
                  <div key={step.id} className="flex gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--gradient-primary)" }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      {step.title && <p className="font-medium text-sm">{step.title}</p>}
                      {step.content && <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-0.5">{step.content}</p>}
                      {step.imagePreview && (
                        <div className="rounded-lg overflow-hidden mt-2 max-h-32">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={step.imagePreview} alt="" className="w-full h-auto" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <p className="font-medium">คลังสูตรสีจะแสดงที่นี่</p>
            <p className="text-sm mt-2 opacity-70">กรอกข้อมูลด้านซ้ายเพื่อดูตัวอย่าง</p>
          </div>
        )}
      </div>
    </div>
  )
}
