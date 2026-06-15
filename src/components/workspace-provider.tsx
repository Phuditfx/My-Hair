"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type WorkspaceType = "salon" | "barber"

interface WorkspaceContextType {
  workspace: WorkspaceType
  setWorkspace: (ws: WorkspaceType) => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceType>("salon")

  useEffect(() => {
    // Check local storage for saved preference
    const saved = localStorage.getItem("hairmaster-workspace") as WorkspaceType
    if (saved && (saved === "salon" || saved === "barber")) {
      setWorkspace(saved)
    }
  }, [])

  useEffect(() => {
    // Save to local storage
    localStorage.setItem("hairmaster-workspace", workspace)
    
    // Apply class to body for global CSS variables
    if (workspace === "barber") {
      document.body.classList.add("theme-barber")
      document.body.classList.remove("theme-salon")
    } else {
      document.body.classList.add("theme-salon")
      document.body.classList.remove("theme-barber")
    }
  }, [workspace])

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
