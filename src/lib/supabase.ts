import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Upload ảnh lên Supabase Storage
export async function uploadImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from("receipts")
    .upload(fileName, file, { upsert: false })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from("receipts")
    .getPublicUrl(data.path)

  return urlData.publicUrl
}