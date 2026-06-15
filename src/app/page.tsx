"use client";

import { useState, useRef } from "react";
import { Upload, Scissors, Download, FileText, Loader2, Image as ImageIcon, Sparkles, CheckCircle2, User, SprayCan, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type HairData = {
  hairstyleOverview: { styleName: string; keyCharacteristics: string; suitableHairType: string };
  faceShapeAnalysis: { idealFaceShapes: string[]; reasoning: string; adjustments: string };
  cuttingDetails: {
    lengths: { top: string; sides: string; back: string; fringe: string };
    sectioning: string;
    elevation: string;
    techniques: string[];
  };
  executionMap: { step1: string; step2: string; step3: string };
  chemicalProcessing: { permType: string; rodSizes: string; wrappingTechnique: string; processingTime: string };
  stylingAndMaintenance: { styledAppearance: string; dailySteps: string[]; recommendedProducts: string[] };
};

export default function HairCheatSheetPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLeftHanded, setIsLeftHanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<HairData | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultData(null); // Reset on new image
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResultData(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Compress image to avoid Vercel 4.5MB limit
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
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
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      setResultData(data);
      toast.success("Cheat Sheet generated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate cheat sheet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportAsImage = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Hair_Cheat_Sheet_${Date.now()}.png`;
      link.click();
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to export image");
    }
  };

  const exportAsPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Hair_Cheat_Sheet_${Date.now()}.pdf`);
      toast.success("PDF downloaded!");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-6 px-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-900 p-2 rounded-md">
              <Scissors className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Hair Master</h1>
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Cheat Sheet Generator</p>
            </div>
          </div>
          {resultData && (
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={exportAsImage}>
                <ImageIcon className="w-4 h-4 mr-2" /> PNG
              </Button>
              <Button variant="default" size="sm" onClick={exportAsPDF} className="bg-neutral-900 hover:bg-neutral-800">
                <FileText className="w-4 h-4 mr-2" /> PDF
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-10">
        
        {/* Upload Section */}
        <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            {/* Dropzone */}
            <div 
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors ${previewUrl ? 'border-neutral-300' : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50 cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative w-full aspect-square md:aspect-[4/3] rounded-lg overflow-hidden group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); setResultData(null); }}>
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm border border-neutral-100">
                    <Upload className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-neutral-600 font-medium">Click or drag image to upload</p>
                    <p className="text-sm text-neutral-400 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Controls */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Analyze & Decode</h2>
                <p className="text-neutral-500">Upload a reference hairstyle and let AI build a comprehensive, step-by-step masterclass cheat sheet.</p>
              </div>

              <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100 flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="left-handed-mode" className="text-base font-semibold flex items-center gap-2">
                    <Scissors className="w-4 h-4" /> Left-Handed Stylist Mode
                  </Label>
                  <p className="text-sm text-neutral-500">Adapts angles and cutting techniques for left-handed execution.</p>
                </div>
                <Switch 
                  id="left-handed-mode" 
                  checked={isLeftHanded}
                  onCheckedChange={setIsLeftHanded}
                />
              </div>

              <Button 
                className="w-full h-14 text-lg bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl shadow-md transition-all"
                onClick={handleGenerate}
                disabled={isLoading || !file}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing anatomy & structure...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Lesson
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Dashboard / Cheat Sheet */}
        {(isLoading || resultData) && (
          <section 
            ref={dashboardRef} 
            className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200"
          >
            <div className="mb-8 border-b border-neutral-100 pb-6">
              <h2 className="text-4xl font-bold text-neutral-900">Master Cheat Sheet</h2>
              <p className="text-neutral-500 mt-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {isLeftHanded ? 'Optimized for Left-Handed Stylists' : 'Standard Right-Handed Execution'}
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : resultData ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Card 1: Overview */}
                <Card className="border-neutral-200 shadow-none bg-neutral-50/50">
                  <CardHeader className="pb-3 border-b border-neutral-100">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-neutral-700" /> 
                      Style Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Style Name</p>
                      <p className="text-lg font-medium text-neutral-900">{resultData.hairstyleOverview.styleName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Vibe / Characteristics</p>
                      <p className="text-neutral-700">{resultData.hairstyleOverview.keyCharacteristics}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Suitable Hair Type</p>
                      <p className="text-neutral-700">{resultData.hairstyleOverview.suitableHairType}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: Face Shape */}
                <Card className="border-neutral-200 shadow-none bg-neutral-50/50">
                  <CardHeader className="pb-3 border-b border-neutral-100">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-neutral-700" /> 
                      Face Shape Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {resultData.faceShapeAnalysis.idealFaceShapes.map((shape, i) => (
                        <span key={i} className="px-3 py-1 bg-neutral-200 text-neutral-800 rounded-full text-sm font-medium">
                          {shape}
                        </span>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Why it works</p>
                      <p className="text-neutral-700">{resultData.faceShapeAnalysis.reasoning}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Adjustments</p>
                      <p className="text-neutral-700">{resultData.faceShapeAnalysis.adjustments}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 3: Cutting Details */}
                <Card className="border-neutral-200 shadow-none bg-neutral-50/50">
                  <CardHeader className="pb-3 border-b border-neutral-100">
                    <CardTitle className="flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-neutral-700" /> 
                      Technical Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase">Top</p>
                        <p className="text-sm font-medium">{resultData.cuttingDetails.lengths.top}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase">Sides</p>
                        <p className="text-sm font-medium">{resultData.cuttingDetails.lengths.sides}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase">Back</p>
                        <p className="text-sm font-medium">{resultData.cuttingDetails.lengths.back}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase">Fringe</p>
                        <p className="text-sm font-medium">{resultData.cuttingDetails.lengths.fringe}</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-neutral-200">
                      <div>
                        <span className="text-xs text-neutral-500 font-semibold uppercase mr-2">Sectioning:</span>
                        <span className="text-sm">{resultData.cuttingDetails.sectioning}</span>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-500 font-semibold uppercase mr-2">Elevation:</span>
                        <span className="text-sm">{resultData.cuttingDetails.elevation}</span>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-500 font-semibold uppercase block mb-1">Techniques:</span>
                        <div className="flex flex-wrap gap-1">
                          {resultData.cuttingDetails.techniques.map((tech, i) => (
                            <span key={i} className="text-xs bg-neutral-200 px-2 py-1 rounded-md">{tech}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 4: Execution Map */}
                <Card className="md:col-span-2 lg:col-span-3 border-neutral-200 shadow-none bg-neutral-900 text-neutral-100">
                  <CardHeader className="pb-4 border-b border-neutral-800">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <CheckCircle2 className="w-5 h-5 text-neutral-400" /> 
                      Execution Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
                    <div className="relative pl-6 border-l-2 border-neutral-700">
                      <div className="absolute w-3 h-3 bg-white rounded-full -left-[7px] top-1"></div>
                      <p className="text-sm text-neutral-400 font-semibold uppercase tracking-wider mb-2">Step 1: Baseline</p>
                      <p className="text-neutral-300 text-sm leading-relaxed">{resultData.executionMap.step1}</p>
                    </div>
                    <div className="relative pl-6 border-l-2 border-neutral-700">
                      <div className="absolute w-3 h-3 bg-white rounded-full -left-[7px] top-1"></div>
                      <p className="text-sm text-neutral-400 font-semibold uppercase tracking-wider mb-2">Step 2: Structure</p>
                      <p className="text-neutral-300 text-sm leading-relaxed">{resultData.executionMap.step2}</p>
                    </div>
                    <div className="relative pl-6 border-l-2 border-neutral-700">
                      <div className="absolute w-3 h-3 bg-white rounded-full -left-[7px] top-1"></div>
                      <p className="text-sm text-neutral-400 font-semibold uppercase tracking-wider mb-2">Step 3: Refining</p>
                      <p className="text-neutral-300 text-sm leading-relaxed">{resultData.executionMap.step3}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 5: Chemical/Perming */}
                <Card className="border-neutral-200 shadow-none bg-neutral-50/50">
                  <CardHeader className="pb-3 border-b border-neutral-100">
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="w-5 h-5 text-neutral-700" /> 
                      Chemical / Perming
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Type</p>
                      <p className="text-neutral-700">{resultData.chemicalProcessing.permType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider">Rod Sizes</p>
                      <p className="text-neutral-700">{resultData.chemicalProcessing.rodSizes || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase">Wrap</p>
                        <p className="text-sm font-medium">{resultData.chemicalProcessing.wrappingTechnique || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase">Time</p>
                        <p className="text-sm font-medium">{resultData.chemicalProcessing.processingTime || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 6: Styling & Maintenance */}
                <Card className="md:col-span-1 lg:col-span-2 border-neutral-200 shadow-none bg-neutral-50/50">
                  <CardHeader className="pb-3 border-b border-neutral-100">
                    <CardTitle className="flex items-center gap-2">
                      <SprayCan className="w-5 h-5 text-neutral-700" /> 
                      Styling & Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider mb-2">Daily Steps</p>
                      <ul className="space-y-2">
                        {resultData.stylingAndMaintenance.dailySteps.map((step, i) => (
                          <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                            <span className="text-neutral-400 mt-0.5">•</span> {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider mb-1">Appearance</p>
                        <p className="text-neutral-700 text-sm">{resultData.stylingAndMaintenance.styledAppearance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 font-semibold uppercase tracking-wider mb-2">Recommended Products</p>
                        <div className="flex flex-wrap gap-2">
                          {resultData.stylingAndMaintenance.recommendedProducts.map((prod, i) => (
                            <span key={i} className="px-3 py-1 bg-neutral-900 text-white rounded-md text-xs font-medium">
                              {prod}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}
