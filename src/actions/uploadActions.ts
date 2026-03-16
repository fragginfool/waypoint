"use server"

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImage(formData: FormData): Promise<string | null> {
  const file = formData.get('file') as File
  if (!file) return null

  const buffer = Buffer.from(await file.arrayBuffer())
  
  // Create a unique filename while preserving the extension
  const extension = path.extname(file.name) || '.jpg'
  const filename = `${uuidv4()}${extension}`
  
  // Ensure the upload directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  
  // Save the file to the public/uploads directory securely
  const uploadPath = path.join(uploadDir, filename)
  await writeFile(uploadPath, buffer)
  
  // Return the public URL path
  return `/uploads/${filename}`
}
