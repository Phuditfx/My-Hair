"use client"

import { useState, useCallback } from "react"
import { Image as ImageIcon, X, Save, Plus, Trash2, GripVertical, Crown, Eye, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useWorkspace } from "../workspace-provider"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Step {
  id: string
  title: string
  content: string
  imageFile: File | null
  imagePreview: string | null
}

export default function LessonEditor() {
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [isVip, setIsVip] = useState(false)
  const [steps, setSteps] = useState<Step[]>([
    { id: crypto.randomUUID(), title: "", content: "", imageFile: null, imagePreview: null }
  ])
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { workspace } = useWorkspace()

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("กรุณาระบุชื่อบทเรียน")
      return
    }

    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("กรุณาเข้าสู่ระบบก่อนบันทึก")
        return
      }

      // Convert steps to JSON (excluding raw File objects)
      const contentData = steps.map(s => ({
        id: s.id,
        title: s.title,
        content: s.content,
        // In a full implementation, you would upload s.imageFile to Supabase Storage
        // and save the returned URL here.
      }))

      const { error } = await supabase.from('lessons').insert({
        title,
        tags,
        is_vip: isVip,
        content_data: contentData,
        workspace,
        created_by: user.id
      })

      if (error) throw error

      toast.success("บันทึกบทเรียนสำเร็จ!")
      // Reset form
      setTitle("")
      setTags("")
      setSteps([{ id: crypto.randomUUID(), title: "", content: "", imageFile: null, imagePreview: null }])
      setCoverImage(null)
      setCoverPreview(null)
    } catch (err: any) {
      console.error(err)
      toast.error("เกิดข้อผิดพลาดในการบันทึก: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

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

  const handleCoverImage = (file: File) => {
    setCoverImage(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
      {/* Editor Side */}
      <div className="glass-card rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold mb-1">สร้างบทเรียนใหม่</h2>
            <p className="text-sm text-muted-foreground">เพิ่มเนื้อหาแบบขั้นตอน (Step-by-step)</p>
          </div>
          {/* VIP Toggle */}
          <button
            onClick={() => setIsVip(!isVip)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              isVip 
                ? "badge-vip shadow-md" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Crown className="w-4 h-4" />
            {isVip ? "VIP" : "ทั่วไป"}
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">ชื่อบทเรียน</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น วิธีตัดผมทรง Modern Mullet"
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium mb-1.5">รูปปก</label>
            {!coverPreview ? (
              <div
                className="border-2 border-dashed border-border/50 rounded-xl p-4 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => document.getElementById("cover-upload")?.click()}
              >
                <ImageIcon className="w-5 h-5 text-muted-foreground mb-1.5" />
                <p className="text-sm text-muted-foreground">คลิกเพื่ออัปโหลดรูปปก</p>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleCoverImage(file)
                  }}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="ปก" className="object-cover w-full h-full" />
                <button
                  onClick={() => { setCoverImage(null); setCoverPreview(null) }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white p-1.5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Steps */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium">ขั้นตอน ({steps.length})</label>
              <button onClick={addStep} className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity">
                <Plus className="w-3.5 h-3.5" /> เพิ่มขั้นตอน
              </button>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3 animate-scale-in">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "var(--gradient-primary)" }}>
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => updateStep(step.id, "title", e.target.value)}
                      placeholder={`หัวข้อขั้นตอนที่ ${index + 1}`}
                      className="flex-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                    />
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(step.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <textarea
                    value={step.content}
                    onChange={e => updateStep(step.id, "content", e.target.value)}
                    placeholder="เขียนรายละเอียดของขั้นตอนนี้..."
                    className="w-full h-24 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-y transition-all"
                  />

                  {/* Step Image */}
                  {!step.imagePreview ? (
                    <button
                      onClick={() => document.getElementById(`step-img-${step.id}`)?.click()}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> แนบรูปภาพ
                      <input
                        id={`step-img-${step.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handleStepImage(step.id, file)
                        }}
                      />
                    </button>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden bg-muted h-32">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={step.imagePreview} alt={`ขั้นตอน ${index + 1}`} className="object-cover w-full h-full" />
                      <button
                        onClick={() => updateStep(step.id, "imagePreview", null)}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-black text-white p-1 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1.5">แท็ก (คั่นด้วยจุลภาค)</label>
            <input 
              type="text" 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="เช่น ตัดผม, เทคนิค, ทรง mullet"
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-2.5 rounded-xl font-semibold text-white hover:opacity-90 transition-all glow-hover flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "กำลังบันทึก..." : `บันทึกลง${workspace === 'salon' ? 'ซาลอน' : 'บาร์เบอร์'}`}
          </button>
        </div>
      </div>

      {/* Live Preview Side */}
      <div className="bg-card rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-[88px] border border-border/50">
        <div className="p-4 glass-card border-b border-border/50 flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            ตัวอย่างเนื้อหา
            {isVip && <span className="badge-vip text-[10px] px-1.5 py-0.5 rounded-full">VIP</span>}
          </h3>
          <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => window.print()}>
            <Save className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8" id="lesson-preview">
          {coverPreview && (
            <div className="mb-6 rounded-xl overflow-hidden shadow-lg max-w-sm mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreview} alt="รูปปก" className="w-full h-auto" />
            </div>
          )}

          {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
          
          {steps.some(s => s.title || s.content) ? (
            <div className="space-y-6">
              {steps.map((step, index) => (
                (step.title || step.content) && (
                  <div key={step.id} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "var(--gradient-primary)" }}>
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      {step.title && <h3 className="font-semibold text-lg">{step.title}</h3>}
                      {step.content && <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{step.content}</p>}
                      {step.imagePreview && (
                        <div className="rounded-xl overflow-hidden mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={step.imagePreview} alt={`ขั้นตอน ${index + 1}`} className="w-full h-auto" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-4">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <p>เนื้อหาจะแสดงที่นี่เมื่อคุณเริ่มเขียน</p>
            </div>
          )}

          {tags && (
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.split(",").map((tag, i) => (
                <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
