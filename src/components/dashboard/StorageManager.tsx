"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Download, HardDrive, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function StorageManager() {
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [exportingId, setExportingId] = useState<string | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const [exportData, setExportData] = useState<any | null>(null)

  const fetchLessons = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      setLessons(data || [])
    } catch (err: any) {
      toast.error("ดึงข้อมูลไม่สำเร็จ: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLessons()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบทเรียนนี้? ข้อมูลจะหายไปถาวร")) return
    
    setDeletingId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("lessons").delete().eq("id", id)
      if (error) throw error
      
      toast.success("ลบบทเรียนสำเร็จ")
      setLessons(lessons.filter(l => l.id !== id))
    } catch (err: any) {
      toast.error("เกิดข้อผิดพลาดในการลบ: " + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportPDF = async (lesson: any) => {
    setExportingId(lesson.id)
    setExportData(lesson)
    
    // Give React time to render the export view
    setTimeout(async () => {
      try {
        if (!exportRef.current) throw new Error("ไม่พบข้อมูลที่จะ Export")
        
        toast.loading("กำลังสร้างไฟล์ PDF...", { id: "export-pdf" })
        
        const canvas = await html2canvas(exportRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        })
        
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save(`${lesson.title}.pdf`)
        
        toast.success("ดาวน์โหลด PDF สำเร็จ", { id: "export-pdf" })
      } catch (err: any) {
        console.error(err)
        toast.error("เกิดข้อผิดพลาดในการสร้าง PDF", { id: "export-pdf" })
      } finally {
        setExportingId(null)
        setExportData(null)
      }
    }, 500)
  }

  // Calculate approximate storage (mock visualization based on count)
  const maxItems = 100 // Example limit for visualization
  const currentCount = lessons.length
  const percentage = Math.min((currentCount / maxItems) * 100, 100)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Storage Overview */}
      <div className="glass-card rounded-2xl p-6 shadow-sm border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">พื้นที่จัดเก็บข้อมูล</h3>
            <p className="text-sm text-muted-foreground">สรุปจำนวนเนื้อหาทั้งหมดในระบบ (ฟรีเทียร์)</p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span>ใช้ไปแล้ว {currentCount} รายการ</span>
            <span className="text-muted-foreground">ลิมิต (แนะนำ) {maxItems} รายการ</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${percentage > 80 ? 'bg-red-500' : 'bg-primary'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            * ระบบอาจเต็มหากมีการอัปโหลดรูปภาพความละเอียดสูงจำนวนมาก แนะนำให้ส่งออก (Export) ข้อมูลเก่าและลบทิ้ง
          </p>
        </div>
      </div>

      {/* Content List */}
      <div className="glass-card rounded-2xl p-6 shadow-sm border border-border/50">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          จัดการข้อมูลบทเรียนทั้งหมด
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border/50 rounded-xl">
            <p>ยังไม่มีข้อมูลในระบบ</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-border/50 bg-background/50 gap-4">
                <div>
                  <h4 className="font-medium text-foreground">{lesson.title}</h4>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground uppercase">
                      {lesson.workspace}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lesson.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleExportPDF(lesson)}
                    disabled={exportingId === lesson.id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {exportingId === lesson.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    PDF
                  </button>
                  <button 
                    onClick={() => handleDelete(lesson.id)}
                    disabled={deletingId === lesson.id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === lesson.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Render for PDF Export */}
      {exportData && (
        <div className="absolute top-0 left-0 w-[800px] -z-50 bg-white p-8 text-black opacity-0 pointer-events-none" ref={exportRef}>
          <h1 className="text-3xl font-bold mb-2 text-black">{exportData.title}</h1>
          <p className="text-gray-600 mb-6">พื้นที่: {exportData.workspace === 'salon' ? 'ซาลอน' : 'บาร์เบอร์'} | วันที่: {new Date(exportData.created_at).toLocaleDateString('th-TH')}</p>
          
          <div className="flex flex-col gap-6">
            {exportData.content_data?.map((step: any, index: number) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold mb-3 text-black">ขั้นตอนที่ {index + 1}: {step.title}</h3>
                <p className="mb-4 whitespace-pre-wrap text-gray-800">{step.content}</p>
                {/* Note: Cannot render base64 images easily without large payload, but if it's external URL, it can render. For now, text only export is safest for PDF without blowing up size, or we can try rendering imagePreview if stored as URL */}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Exported from My-Hair Application</p>
          </div>
        </div>
      )}
    </div>
  )
}
