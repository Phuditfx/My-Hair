"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ImageIcon, X, Package, ChevronDown, ChevronUp, Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useWorkspace } from "../workspace-provider"
import { toast } from "sonner"

interface Brand {
  id: string
  name: string
  logoFile: File | null
  logoPreview: string | null
  description: string
}

interface Category {
  id: string
  name: string
  brands: Brand[]
  isOpen: boolean
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-hair-color",
    name: "🎨 สีผม",
    isOpen: true,
    brands: [
      { id: "b1", name: "Wella", logoFile: null, logoPreview: null, description: "ผู้นำด้านสีผมมืออาชีพจากเยอรมนี" },
      { id: "b2", name: "Schwarzkopf", logoFile: null, logoPreview: null, description: "แบรนด์สีผมชั้นนำ สีชัดติดทนนาน" },
      { id: "b3", name: "L'Oréal Professionnel", logoFile: null, logoPreview: null, description: "สีผมจากฝรั่งเศส คุณภาพระดับโลก" },
      { id: "b4", name: "Goldwell", logoFile: null, logoPreview: null, description: "เทคโนโลยี Colorance สีผมคงทน" },
      { id: "b5", name: "Davines", logoFile: null, logoPreview: null, description: "สีผมออร์แกนิกจากอิตาลี" },
      { id: "b6", name: "Lakme", logoFile: null, logoPreview: null, description: "สีผมมืออาชีพจากสเปน" },
    ]
  },
  {
    id: "cat-perm",
    name: "🌀 น้ำยาดัด",
    isOpen: false,
    brands: [
      { id: "b7", name: "Goldwell", logoFile: null, logoPreview: null, description: "น้ำยาดัด Evolution Neutral Wave" },
      { id: "b8", name: "Schwarzkopf", logoFile: null, logoPreview: null, description: "Natural Styling Glamour Wave" },
      { id: "b9", name: "L'Oréal", logoFile: null, logoPreview: null, description: "Dulcia Advanced Ionène G" },
      { id: "b10", name: "Matrix", logoFile: null, logoPreview: null, description: "Opti Wave Self-Neutralizing" },
    ]
  },
  {
    id: "cat-straighten",
    name: "✨ น้ำยายืด",
    isOpen: false,
    brands: [
      { id: "b11", name: "Shiseido", logoFile: null, logoPreview: null, description: "Crystallizing Straight จากญี่ปุ่น" },
      { id: "b12", name: "L'Oréal X-Tenso", logoFile: null, logoPreview: null, description: "X-Tenso Moisturist สำหรับผมเอเชีย" },
      { id: "b13", name: "Goldwell", logoFile: null, logoPreview: null, description: "Structure + Shine Agent สูตร Keratin" },
    ]
  }
]

export default function BrandManager({ role }: { role: string }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newBrandName, setNewBrandName] = useState("")
  const [newBrandDesc, setNewBrandDesc] = useState("")
  const [addingToCategoryId, setAddingToCategoryId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { workspace } = useWorkspace()

  useEffect(() => {
    fetchBrands()
  }, [workspace])

  const fetchBrands = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("brand_settings")
        .select("data")
        .eq("workspace", workspace)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // Ignore not found
      
      if (data?.data) {
        setCategories(data.data)
      } else {
        setCategories(DEFAULT_CATEGORIES)
      }
    } catch (err: any) {
      console.error(err)
      setCategories(DEFAULT_CATEGORIES)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      // Upsert to brand_settings (need a unique constraint on workspace)
      const { error } = await supabase
        .from("brand_settings")
        .upsert({ 
          workspace: workspace, 
          data: categories,
          updated_at: new Date().toISOString()
        }, { onConflict: "workspace" })

      if (error) throw error
      toast.success("บันทึกข้อมูลผลิตภัณฑ์สำเร็จ")
    } catch (err: any) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Logo upload logic
  const handleBrandLogo = async (catId: string, brandId: string, file: File) => {
    try {
      toast.loading("กำลังอัปโหลดโลโก้...", { id: "upload-logo" })
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${workspace}/brands/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("lessons")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from("lessons")
        .getPublicUrl(filePath)

      setCategories(prev => prev.map(c => {
        if (c.id !== catId) return c
        return {
          ...c,
          brands: c.brands.map(b => b.id === brandId ? { ...b, logoPreview: data.publicUrl } : b)
        }
      }))
      toast.success("อัปโหลดสำเร็จ", { id: "upload-logo" })
    } catch (err: any) {
      toast.error("อัปโหลดล้มเหลว: " + err.message, { id: "upload-logo" })
    }
  }

  const toggleCategory = (catId: string) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, isOpen: !c.isOpen } : c))
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) return
    setCategories(prev => [...prev, {
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
      brands: [],
      isOpen: true,
    }])
    setNewCategoryName("")
  }

  const removeCategory = (catId: string) => {
    if (!confirm("คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่? แบรนด์ทั้งหมดในหมวดหมู่จะถูกลบด้วย")) return
    setCategories(prev => prev.filter(c => c.id !== catId))
  }

  const addBrand = (catId: string) => {
    if (!newBrandName.trim()) return
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c
      return {
        ...c,
        brands: [...c.brands, {
          id: crypto.randomUUID(),
          name: newBrandName.trim(),
          logoFile: null,
          logoPreview: null,
          description: newBrandDesc.trim(),
        }]
      }
    }))
    setNewBrandName("")
    setNewBrandDesc("")
    setAddingToCategoryId(null)
  }

  const removeBrand = (catId: string, brandId: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id !== catId) return c
      return { ...c, brands: c.brands.filter(b => b.id !== brandId) }
    }))
  }



  return (
    <div className="space-y-4 animate-fade-in">
      {/* Add Category (Admin only) */}
      {role === "admin" && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="ชื่อหมวดหมู่ใหม่ เช่น ทรีทเม้นท์"
              className="flex-1 px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              onKeyDown={e => e.key === "Enter" && addCategory()}
            />
            <button 
              onClick={addCategory}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shrink-0 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Categories */}
          {categories.map(cat => (
        <div key={cat.id} className="glass-card rounded-xl overflow-hidden">
          {/* Category Header */}
          <button
            onClick={() => toggleCategory(cat.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{cat.name}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {cat.brands.length} แบรนด์
              </span>
            </div>
            <div className="flex items-center gap-2">
              {role === "admin" && (
                <span
                  onClick={e => { e.stopPropagation(); removeCategory(cat.id) }}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </span>
              )}
              {cat.isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>

          {/* Brands Grid */}
          {cat.isOpen && (
            <div className="p-4 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
                {cat.brands.map(brand => (
                  <div key={brand.id} className="group bg-muted/30 border border-border/30 rounded-xl p-4 hover:border-primary/30 transition-all duration-300 relative">
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3 overflow-hidden">
                      {brand.logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={brand.logoPreview} alt={brand.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground/50" />
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-sm">{brand.name}</h4>
                    {brand.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{brand.description}</p>
                    )}

                    {/* Admin Actions */}
                    {role === "admin" && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="p-1 bg-muted/80 rounded cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <ImageIcon className="w-3 h-3" />
                          <input
                            type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleBrandLogo(cat.id, brand.id, f) }}
                          />
                        </label>
                        <button
                          onClick={() => removeBrand(cat.id, brand.id)}
                          className="p-1 bg-muted/80 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Brand Button */}
              {role === "admin" && (
                <div className="mt-3">
                  {addingToCategoryId === cat.id ? (
                    <div className="flex gap-2 items-end animate-scale-in">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={newBrandName}
                          onChange={e => setNewBrandName(e.target.value)}
                          placeholder="ชื่อแบรนด์"
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={newBrandDesc}
                          onChange={e => setNewBrandDesc(e.target.value)}
                          placeholder="คำอธิบาย (ไม่บังคับ)"
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => addBrand(cat.id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white shrink-0"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        เพิ่ม
                      </button>
                      <button
                        onClick={() => { setAddingToCategoryId(null); setNewBrandName(""); setNewBrandDesc("") }}
                        className="px-3 py-1.5 rounded-lg text-sm bg-muted text-muted-foreground"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingToCategoryId(cat.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> เพิ่มแบรนด์
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
          ))}
        </>
      )}
    </div>
  )
}
