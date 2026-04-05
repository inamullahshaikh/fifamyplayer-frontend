import type { Area } from 'react-easy-crop'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject(new Error('Could not load image')))
    img.src = src
  })
}

/** Renders the cropped region to a square JPEG `File` for avatar upload. */
export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName = 'avatar.jpg',
  quality = 0.92,
): Promise<File> {
  const image = await loadImage(imageSrc)
  const w = Math.max(1, Math.round(pixelCrop.width))
  const h = Math.max(1, Math.round(pixelCrop.height))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    w,
    h,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not create image'))),
      'image/jpeg',
      quality,
    )
  })
  return new File([blob], fileName, { type: 'image/jpeg' })
}
