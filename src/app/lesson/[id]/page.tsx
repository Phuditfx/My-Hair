import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Sparkles, Calendar } from "lucide-react"

export default async function LessonPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error) {
    return <div className="p-8 text-center text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูล: {error.message}</div>
  }

  if (!lesson) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-lg line-clamp-1 flex-1">{lesson.title}</h1>
          </div>
          {lesson.is_vip && (
            <span className="badge-vip text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3" /> VIP
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Cover & Meta */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{lesson.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(lesson.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground uppercase text-xs font-medium">
                {lesson.workspace}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap mb-8">
              {lesson.tags?.split(',').map((tag: string, i: number) => {
                if (!tag.trim()) return null
                return (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">
                    {tag.trim()}
                  </span>
                )
              })}
            </div>

            {lesson.cover_image_url && (
              <div className="rounded-2xl overflow-hidden border border-border/50 mb-8 max-h-[400px] w-full flex justify-center bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lesson.cover_image_url} alt={lesson.title} className="max-h-[400px] object-contain w-full" />
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {lesson.content_data?.map((step: any, index: number) => (
              <div key={index} className="glass-card rounded-2xl p-6 border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: "var(--gradient-primary)" }}></div>

                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "var(--gradient-primary)" }}>
                    {index + 1}
                  </span>
                  {step.title}
                </h3>

                <div className="prose prose-invert max-w-none mb-4 text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {step.content}
                </div>

                {step.imagePreview && (
                  <div className="rounded-xl overflow-hidden mt-4 border border-border/50 max-h-[300px] bg-muted/10 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={step.imagePreview} alt={step.title} className="max-h-[300px] object-contain w-full" />
                  </div>
                )}
              </div>
            ))}

            {(!lesson.content_data || lesson.content_data.length === 0) && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                <p>ไม่มีข้อมูลขั้นตอน</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
