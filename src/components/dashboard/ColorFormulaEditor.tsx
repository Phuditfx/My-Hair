"use client"

import { useState } from "react"

export default function ColorFormulaEditor({ role }: { role: string }) {
  const [level, setLevel] = useState("")
  const [target, setTarget] = useState("")
  const [formula, setFormula] = useState("")

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Add Formula</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Current Level (Base)</label>
              <input type="text" value={level} onChange={e => setLevel(e.target.value)} placeholder="e.g. 5" className="w-full p-2 border border-border rounded bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Target Color</label>
              <input type="text" value={target} onChange={e => setTarget(e.target.value)} placeholder="e.g. Ash Blonde" className="w-full p-2 border border-border rounded bg-background" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Formula & Details (Paste from Gem)</label>
            <textarea value={formula} onChange={e => setFormula(e.target.value)} className="w-full h-32 p-2 border border-border rounded bg-background font-mono text-sm" placeholder="Bleach: ...\nColor: ...\nDev: ..."></textarea>
          </div>
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:opacity-90 transition-opacity">
            Save Formula
          </button>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center text-muted-foreground">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
        </div>
        <p>Your formula archive will appear here.</p>
        <p className="text-sm mt-2 opacity-70">Use your Gem to generate precise color formulas based on underlying pigments.</p>
      </div>
    </div>
  )
}
