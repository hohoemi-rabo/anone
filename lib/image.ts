import { randomUUID } from 'expo-crypto'
import * as FileSystem from 'expo-file-system/legacy'
import * as ImageManipulator from 'expo-image-manipulator'

import { supabase } from '@/lib/supabase'

const DIARY_BUCKET = 'diary-photos'
const MAX_EDGE = 1280
const JPEG_QUALITY = 0.8
const SIGNED_URL_TTL_SEC = 3600
const UPLOAD_TIMEOUT_MS = 30_000

export type PickedImage = {
  uri: string
  width: number
  height: number
}

export async function compressImage(image: PickedImage): Promise<string> {
  const { uri, width, height } = image
  const action: ImageManipulator.Action =
    width >= height
      ? { resize: { width: Math.min(width, MAX_EDGE) } }
      : { resize: { height: Math.min(height, MAX_EDGE) } }

  const result = await ImageManipulator.manipulateAsync(uri, [action], {
    compress: JPEG_QUALITY,
    format: ImageManipulator.SaveFormat.JPEG,
  })
  return result.uri
}

export function withTimeout<T>(
  label: string,
  promise: Promise<T> | PromiseLike<T>,
  ms = UPLOAD_TIMEOUT_MS,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} がタイムアウトしました`)), ms)
    Promise.resolve(promise).then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = globalThis.atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function uploadJpeg(path: string, image: PickedImage): Promise<void> {
  const compressedUri = await compressImage(image)

  const base64 = await FileSystem.readAsStringAsync(compressedUri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  const buffer = base64ToArrayBuffer(base64)

  const { error } = await withTimeout(
    'アップロード',
    supabase.storage
      .from(DIARY_BUCKET)
      .upload(path, buffer, { contentType: 'image/jpeg', upsert: false }),
  )

  if (error) throw error
}

export async function uploadDiaryPhoto(
  childId: string,
  entryDate: string,
  image: PickedImage,
): Promise<string> {
  const path = `${childId}/${entryDate}/${randomUUID()}.jpg`
  await uploadJpeg(path, image)
  return path
}

export async function uploadChildIcon(childId: string, image: PickedImage): Promise<string> {
  const path = `children/${childId}/${randomUUID()}.jpg`
  await uploadJpeg(path, image)
  return path
}

export async function getSignedPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(DIARY_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SEC)

  if (error) {
    console.warn('[image] failed to sign URL', path, error.message)
    return null
  }
  return data?.signedUrl ?? null
}

export async function deletePhoto(path: string): Promise<void> {
  const { error } = await supabase.storage.from(DIARY_BUCKET).remove([path])
  if (error) {
    console.warn('[image] failed to delete', path, error.message)
  }
}
