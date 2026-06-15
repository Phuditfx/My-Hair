"use client";

import { useState, useCallback } from "react";
import { Upload, X, Scissors, Save, ChevronRight, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'prompt' | 'lesson'>('prompt');
  
  // Tab 1 State
  const [promptFile, setPromptFile] = useState<File | null>(null);
  const [isLeftHanded, setIsLeftHanded] = useState(false);
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  // Tab 2 State
  const [lessonImageFile, setLessonImageFile] = useState<File | null>(null);
  const [lessonMarkdown, setLessonMarkdown] = useState<string>("");

  const handlePromptFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setPromptFile(droppedFile);
    } else {
      toast.error("Please drop a valid image file.");
    }
  }, []);

  const handleLessonImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setLessonImageFile(droppedFile);
    } else {
      toast.error("Please drop a valid image file.");
    }
  }, []);

  const generatePrompt = async () => {
    if (!promptFile) {
      toast.error("Please upload an image first.");
      return;
    }

    setIsLoadingPrompt(true);
    
    try {
      // Compress image to avoid Vercel limits
      const img = new window.Image();
      img.src = URL.createObjectURL(promptFile);
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      const base64data = canvas.toDataURL("image/jpeg", 0.8);
      
      const response = await fetch('/api/analyze-hair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64data, isLeftHanded }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate prompt');
      }

      const data = await response.json();
      setGeneratedPrompt(data.generatedPrompt);
      toast.success("Prompt generated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate prompt. Please try again.");
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      toast.success("Prompt copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 rounded-lg">
              <Scissors className="w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Hair Master</h1>
          </div>
          <div className="flex bg-neutral-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('prompt')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'prompt' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-black'}`}
            >
              1. Generate Prompt
            </button>
            <button 
              onClick={() => setActiveTab('lesson')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'lesson' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-black'}`}
            >
              2. Save Lesson
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* TAB 1: GENERATE PROMPT */}
        {activeTab === 'prompt' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Step 1: Get the Perfect Prompt</h2>
              <p className="text-neutral-500 mb-6 text-sm">Upload a reference hairstyle image to generate a highly detailed prompt. You will copy this prompt and paste it into Gemini Pro.</p>

              {/* Upload Zone */}
              {!promptFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handlePromptFileDrop}
                  className="border-2 border-dashed border-neutral-300 rounded-xl p-12 flex flex-col items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer group"
                  onClick={() => document.getElementById("prompt-file-upload")?.click()}
                >
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-neutral-600" />
                  </div>
                  <p className="font-medium text-neutral-900 mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-neutral-500">SVG, PNG, JPG or WEBP (max. 5MB)</p>
                  <input
                    id="prompt-file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPromptFile(file);
                    }}
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-neutral-100 aspect-video flex items-center justify-center max-w-lg mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(promptFile)} alt="Preview" className="object-cover w-full h-full" />
                  <button
                    onClick={() => { setPromptFile(null); setGeneratedPrompt(null); }}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Options & Action */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={isLeftHanded} onChange={(e) => setIsLeftHanded(e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${isLeftHanded ? 'bg-black' : 'bg-neutral-200'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isLeftHanded ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm font-medium text-neutral-700">Left-Handed Mode</span>
                </label>

                <button
                  onClick={generatePrompt}
                  disabled={!promptFile || isLoadingPrompt}
                  className="bg-black hover:bg-neutral-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoadingPrompt ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Generate Prompt <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Prompt Result */}
            {generatedPrompt && (
              <div className="bg-black text-white p-8 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Prompt Ready
                  </h3>
                  <button 
                    onClick={copyToClipboard}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Copy Prompt
                  </button>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-neutral-300 text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                  {generatedPrompt}
                </div>
                <div className="mt-6 text-sm text-neutral-400 bg-white/5 p-4 rounded-lg flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <p>Next step: Paste this prompt and your original photo into <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Gemini Pro</a>. Once it generates the lesson and image, bring them back to Step 2!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVE LESSON */}
        {activeTab === 'lesson' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Form Input Side */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Step 2: Save Your Lesson</h2>
                  <p className="text-neutral-500 text-sm">Paste the final results from Gemini Pro here to create a beautifully formatted cheat sheet.</p>
                </div>

                {/* Lesson Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Generated Hairstyle Image</label>
                  {!lessonImageFile ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleLessonImageDrop}
                      className="border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
                      onClick={() => document.getElementById("lesson-file-upload")?.click()}
                    >
                      <ImageIcon className="w-8 h-8 text-neutral-400 mb-2" />
                      <p className="text-sm font-medium text-neutral-700">Upload AI Image</p>
                      <input
                        id="lesson-file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setLessonImageFile(file);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-neutral-100 aspect-[4/3] flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(lessonImageFile)} alt="Lesson Preview" className="object-cover w-full h-full" />
                      <button
                        onClick={() => setLessonImageFile(null)}
                        className="absolute top-3 right-3 bg-black/50 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Markdown Input */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2 flex justify-between items-center">
                    <span>Lesson Content (Markdown)</span>
                  </label>
                  <textarea
                    value={lessonMarkdown}
                    onChange={(e) => setLessonMarkdown(e.target.value)}
                    placeholder="Paste the step-by-step markdown response from Gemini Pro here..."
                    className="w-full h-[300px] p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-y font-mono"
                  ></textarea>
                </div>
              </div>

              {/* Live Preview Side */}
              <div className="bg-neutral-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-[88px]">
                <div className="p-4 bg-black/50 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Lesson Preview
                  </h3>
                  <button className="text-white/60 hover:text-white transition-colors" onClick={() => window.print()}>
                    <Save className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white" id="lesson-preview">
                  {lessonImageFile && (
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-neutral-100 max-w-sm mx-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(lessonImageFile)} alt="Final Hairstyle" className="w-full h-auto" />
                    </div>
                  )}
                  
                  {lessonMarkdown ? (
                    <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-600 prose-img:rounded-xl">
                      <ReactMarkdown>{lessonMarkdown}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-200 flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                      <p>Your beautiful lesson will appear here.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
