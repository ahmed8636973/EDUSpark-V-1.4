"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabaseAdmin } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

interface CreateVideoDialogProps {
  children: React.ReactNode
  subPackageId: string
}

export function CreateVideoDialog({ children, subPackageId }: CreateVideoDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
  })

  const router = useRouter()

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const videoId = extractYouTubeVideoId(formData.youtubeUrl)
      if (!videoId) throw new Error("Invalid YouTube URL. Please provide a valid YouTube video link.")

      // Get current max order_index
      const { data: existingVideos } = await supabaseAdmin
        .from("videos")
        .select("order_index")
        .eq("sub_package_id", subPackageId)
        .order("order_index", { ascending: false })
        .limit(1)

      const nextOrderIndex =
