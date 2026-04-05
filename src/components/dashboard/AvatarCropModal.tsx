import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { getCroppedImageFile } from '../../lib/cropImage'

type Props = {
  imageSrc: string
  onCancel: () => void
  onComplete: (file: File) => void | Promise<void>
}

export default function AvatarCropModal({ imageSrc, onCancel, onComplete }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => {
    setCroppedAreaPixels(areaPx)
  }, [])

  const handleApply = async () => {
    if (!croppedAreaPixels) return
    setBusy(true)
    setErr(null)
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels)
      await onComplete(file)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not crop image')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="avatar-crop-overlay" role="dialog" aria-modal="true" aria-labelledby="avatar-crop-title">
      <div className="avatar-crop-backdrop" onClick={onCancel} aria-hidden />
      <div className="avatar-crop-panel">
        <h2 id="avatar-crop-title" className="avatar-crop-title">
          Crop to square
        </h2>
        <p className="avatar-crop-hint">
          Drag to reposition, use the slider to zoom. The result is a square image for your circular profile photo.
        </p>
        <div className="avatar-crop-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <label className="avatar-crop-zoom-label">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="avatar-crop-zoom"
          />
        </label>
        {err && <p className="avatar-crop-error">{err}</p>}
        <div className="avatar-crop-actions">
          <button type="button" className="avatar-crop-btn avatar-crop-btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="avatar-crop-btn avatar-crop-btn--primary" onClick={handleApply} disabled={busy || !croppedAreaPixels}>
            {busy ? 'Saving…' : 'Use photo'}
          </button>
        </div>
      </div>
    </div>
  )
}
