import { useState } from "react"

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";


import "./style.css"
const queryClient = new QueryClient({})
function IndexPopup() {
  // 获取当前路径
  const currentPath = window.location.pathname
  console.log("currentPath", currentPath)
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/popup.html" element={<div className="w-[400px]"><Index /></div> } />
            {/* <Route path="*" element={<div className="w-[400px]"><NotFound /></div>} /> */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default IndexPopup
