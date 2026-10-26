import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadService } from '../../api/adminServices'

type Props = {
  value: string
  onChange: (url: string) => void
  type?: 'image' | 'video'
  folder?: string
  label?: string
  className?: string
}

export default function MediaUpload({ value, onChange, type = 'image', folder, label, className }: Props) {
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const accept = type === 'video' ? 'video/*' : 'image/*'

  const handlePick = () => inputRef.current?.click()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const url = type === 'video'
        ? await uploadService.uploadVideo(file, folder)
        : await uploadService.uploadImage(file, folder)
      onChange(url)
      toast.success(`${type === 'video' ? 'Video' : 'Image'} uploaded`)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const handleClear = () => {
    if (!value) return
    uploadService.deleteByUrl(value).catch(() => {})
    onChange('')
  }

  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-xs font-extrabold text-[#b8c7b9]">{label}</label>}
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />

      {value ? (
        <div className="relative inline-block w-full max-w-sm">
          {type === 'video' ? (
            <video src={value} controls className="h-40 w-full rounded-xl border border-white/10 bg-black shadow-xl" />
          ) : (
            <img src={value} alt="" className="h-40 w-full rounded-xl border border-white/10 object-cover shadow-xl" />
          )}
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={handlePick} disabled={busy} className="admin-action-secondary min-h-0 px-3 py-1.5 text-xs">
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Replace
            </button>
            <button type="button" onClick={handleClear} disabled={busy} className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/10">
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={handlePick} disabled={busy}
          className="flex h-36 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-black/20 text-sm font-semibold text-[#91a092] transition hover:border-[#8be12d] hover:bg-[#8be12d]/10 hover:text-white">
          {busy ? <Loader2 size={20} className="animate-spin" /> : <Upload size={22} />}
          <span>{busy ? 'Uploading...' : `Click to upload ${type}`}</span>
          <span className="text-[10px] text-[#657365]">
            {type === 'video' ? 'MP4 / WebM up to 100 MB' : 'JPG / PNG / WebP up to 10 MB'}
          </span>
        </button>
      )}
    </div>
  )
}
