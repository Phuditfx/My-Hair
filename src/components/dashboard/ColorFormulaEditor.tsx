"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Crown, ImageIcon, X, Save, Loader2, Eye, ChevronLeft, Palette } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "../workspace-provider"
import { toast } from "sonner"

interface Step {
  id: string
  title: string
  content: string
  imageFile: File | null
  imagePreview: string | null
}

interface SavedFormula {
  id: string
  base_level: string
  target_color: string
  brand: string
  steps_data: any[]
  is_vip: boolean
  workspace: string
  created_at: string
}

export default function ColorFormulaEditor({ role }: { role: string }) {
  const [level, setLevel] = useState("")
  const [target, setTarget] = useState("")
  const [brand, setBrand] = useState("")
  const [isVip, setIsVip] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [savedFormulas, setSavedFormulas] = useState<SavedFormula[]>([])
  const [loadingFormulas, setLoadingFormulas] = useState(true)
  const [viewingFormula, setViewingFormula] = useState<SavedFormula | null>(null)
  const { workspace } = useWorkspace()
  const [steps, setSteps] = useState<Step[]>([
    { id: crypto.randomUUID(), title: "", content: "", imageFile: null, imagePreview: null }
  ])

  // Fetch saved formulas
  useEffect(() => {
    fetchFormulas()
  }, [workspace])

  const fetchFormulas = async () => {
    setLoadingFormulas(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("color_formulas")
        .select("*")
        .eq("workspace", workspace)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSavedFormulas(data || [])
    } catch (err: any) {
      console.error("Error fetching formulas:", err)
    } finally {
      setLoadingFormulas(false)
    }
  }

  const handleSave = async () => {
    if (!level || !target) {
      toast.error("กรุณาระบุ Base และสีเป้าหมาย")
      return
    }

    setIsSaving(true)
    try {
      const supabase = createClient()

      // Upload images for steps
      const uploadedSteps = await Promise.all(steps.map(async (step) => {
        let imageUrl = null
        if (step.imageFile) {
          const fileExt = step.imageFile.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${workspace}/colors/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("lessons")
            .upload(filePath, step.imageFile)

          if (uploadError) throw uploadError

          const { data } = supabase.storage
            .from("lessons")
            .getPublicUrl(filePath)

          imageUrl = data.publicUrl
        }

        return {
          title: step.title,
          content: step.content,
          imagePreview: imageUrl || step.imagePreview
        }
      }))

      // Save to Database
      const { error } = await supabase
        .from("color_formulas")
        .insert({
          base_level: level,
          target_color: target,
          brand: brand,
          steps_data: uploadedSteps,
          is_vip: isVip,
          workspace: workspace
        })

      if (error) throw error

      toast.success("บันทึกสูตรสีสำเร็จ!")

      // Reset form & go back to list
      setLevel("")
      setTarget("")
      setBrand("")
      setIsVip(false)
      setSteps([{ id: crypto.randomUUID(), title: "", content: "", imageFile: null, imagePreview: null }])
      setShowEditor(false)
      fetchFormulas()

    } catch (err: any) {
      toast.error("เกิดข้อผิดพลาด: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm("ต้องการลบสูตรสีนี้หรือไม่?")) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from("color_formulas").delete().eq("id", formulaId)
      if (error) throw error
      toast.success("ลบสูตรสีสำเร็จ")
      setSavedFormulas(prev => prev.filter(f => f.id !== formulaId))
      if (viewingFormula?.id === formulaId) setViewingFormula(null)
    } catch (err: any) {
      toast.error("ลบไม่สำเร็จ: " + err.message)
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

  // ========== VIEW: Formula Detail ==========
  if (viewingFormula) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setViewingFormula(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> กลับไปรายการสูตรสี
        </button>

        <div className="glass-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">Base {viewingFormula.base_level} → {viewingFormula.target_color}</h3>
              {viewingFormula.brand && <p className="text-sm text-muted-foreground mt-1">แบรนด์: {viewingFormula.brand}</p>}
            </div>
            <div className="flex items-center gap-2">
              {viewingFormula.is_vip && <span className="badge-vip text-xs px-2 py-1 rounded-full font-semibold">VIP</span>}
              <span className="text-xs text-muted-foreground">
                {new Date(viewingFormula.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {viewingFormula.steps_data?.map((step: any, index: number) => (
              <div key={index} className="flex gap-3 p-4 bg-muted/20 rounded-xl border border-border/30">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "var(--gradient-primary)" }}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  {step.title && <p className="font-medium mb-1">{step.title}</p>}
                  {step.content && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{step.content}</p>}
                  {step.imagePreview && (
                    <div className="rounded-lg overflow-hidden mt-3 max-h-48 border border-border/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={step.imagePreview} alt="" className="w-full h-auto max-h-48 object-contain" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!viewingFormula.steps_data || viewingFormula.steps_data.length === 0) && (
              <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูลขั้นตอน</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ========== VIEW: Editor Form ==========
  if (showEditor) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setShowEditor(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> กลับไปรายการสูตรสี
        </button>

        <div className="grid md:grid-cols-2 gap-6">
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

              <div>
                <label className="block text-xs font-medium mb-1">แบรนด์ที่ใช้</label>
                <input
                  type="text" value={brand} onChange={e => setBrand(e.target.value)}
                  placeholder="เช่น Wella, Schwarzkopf, L'Oréal"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>

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
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2 rounded-xl font-semibold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "กำลังบันทึก..." : "บันทึกสูตรสี"}
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
                  <div className="flex gap-3 text-sm flex-wrap">
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
                  <Palette className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-medium">ตัวอย่างสูตรสีจะแสดงที่นี่</p>
                <p className="text-sm mt-2 opacity-70">กรอกข้อมูลด้านซ้ายเพื่อดูตัวอย่าง</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ========== VIEW: Formula List (Default) ==========
  return (
    <div className="animate-fade-in">
      {role === "admin" && (
        <div className="mb-6">
          <button
            onClick={() => setShowEditor(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-all"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="w-4 h-4" /> เพิ่มสูตรสีใหม่
          </button>
        </div>
      )}

      {loadingFormulas ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
          <p className="font-medium">กำลังโหลดสูตรสี...</p>
        </div>
      ) : savedFormulas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
          <Palette className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">ยังไม่มีสูตรสีในพื้นที่นี้</p>
          <p className="text-sm opacity-60 mt-1">กดปุ่ม &quot;เพิ่มสูตรสีใหม่&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedFormulas.map(formula => (
            <div key={formula.id} className="glass-card rounded-xl p-5 hover:border-primary/50 transition-colors group h-full flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="cursor-pointer flex-1" onClick={() => setViewingFormula(formula)}>
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                    Base {formula.base_level} → {formula.target_color}
                  </h3>
                  {formula.brand && <p className="text-xs text-muted-foreground mt-1">{formula.brand}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {formula.is_vip && (
                    <span className="px-2 py-1 text-xs font-bold rounded-md bg-amber-500/10 text-amber-500">VIP</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-3">
                {formula.steps_data?.length || 0} ขั้นตอน
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <button
                  onClick={() => setViewingFormula(formula)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
                >
                  <Eye className="w-3.5 h-3.5" /> ดูสูตร
                </button>
                {role === "admin" && (
                  <button
                    onClick={() => handleDeleteFormula(formula.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-xs font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ลบ
                  </button>
                )}
              </div>

              <div className="text-[10px] text-muted-foreground/60 mt-2">
                {new Date(formula.created_at).toLocaleDateString('th-TH')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
