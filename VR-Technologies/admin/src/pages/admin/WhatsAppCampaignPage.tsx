import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, FileSpreadsheet, MessageCircle, RefreshCw, Send, Video } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import MediaUpload from '@/components/ui/MediaUpload'
import { whatsAppCampaignService, type WhatsAppCampaignStatus } from '../../api/adminServices'

const templateBody = `Hi {{1}},

Discover Anusha Bazaar

Order groceries easily with fast delivery and great offers.

Tap below to install the app and start ordering today.`

export default function WhatsAppCampaignPage() {
  const [videoUrl, setVideoUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [activeOnly, setActiveOnly] = useState(true)
  const [campaignId, setCampaignId] = useState('')
  const [status, setStatus] = useState<WhatsAppCampaignStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [polling, setPolling] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refreshStatus = async (id = campaignId) => {
    if (!id) return
    setPolling(true)
    try {
      const next = await whatsAppCampaignService.getStatus(id)
      setStatus(next)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Unable to load campaign status')
    } finally {
      setPolling(false)
    }
  }

  useEffect(() => {
    if (!campaignId) return
    const timer = window.setInterval(() => {
      whatsAppCampaignService.getStatus(campaignId)
        .then(setStatus)
        .catch(() => {})
    }, 3000)
    return () => window.clearInterval(timer)
  }, [campaignId])

  const startCampaign = async () => {
    if (!videoUrl) {
      toast.error('Upload the template video first')
      return
    }
    if (!file) {
      toast.error('Upload customer CSV or XLSX')
      return
    }

    setBusy(true)
    try {
      const response = await whatsAppCampaignService.startAppVideoCampaign({
        file,
        headerMediaUrl: videoUrl,
        activeOnly,
      })
      setCampaignId(response.campaignId)
      toast.success(response.message || 'Campaign queued')
      await refreshStatus(response.campaignId)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start campaign')
    } finally {
      setBusy(false)
    }
  }

  const sentPercent = status?.totalRows ? Math.round((status.processed / status.totalRows) * 100) : 0
  const previewName = 'pgname'

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp App Video"
        subtitle="Template pg_app_video_v1"
        action={{ label: busy ? 'Sending...' : 'Send Campaign', onClick: startCampaign, icon: <Send size={16} /> }}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <Video size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Video Header</h2>
                <p className="text-xs text-slate-400">Upload the approved template video, for example p2.mp4.</p>
              </div>
            </div>
            <MediaUpload
              label="Template Video"
              type="video"
              folder="whatsapp/promos"
              value={videoUrl}
              onChange={setVideoUrl}
            />
            {videoUrl && (
              <input
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                className="mt-4 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/60"
              />
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Recipients</h2>
                <p className="text-xs text-slate-400">CSV/XLSX columns: Phone Number, Name, Var1, Active.</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-24 w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/15 bg-black/20 text-sm font-bold text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
            >
              <FileSpreadsheet size={20} />
              {file ? file.name : 'Choose CSV or XLSX'}
            </button>

            <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={e => setActiveOnly(e.target.checked)}
                className="h-4 w-4 accent-emerald-500"
              />
              Send only rows marked active
            </label>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <MessageCircle size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Template Preview</h2>
                <p className="text-xs text-slate-400">Buttons are configured inside Meta template manager.</p>
              </div>
            </div>

            <div className="mx-auto max-w-sm rounded-3xl bg-[#0b141a] p-4">
              <div className="overflow-hidden rounded-2xl bg-[#202c33] shadow-xl">
                {videoUrl ? (
                  <video src={videoUrl} controls muted className="aspect-video w-full bg-black object-cover" />
                ) : (
                  <div className="grid aspect-video place-items-center bg-black/50 text-xs font-bold text-slate-500">
                    Video header
                  </div>
                )}
                <div className="space-y-3 p-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-100">
                    {templateBody.replace('{{1}}', previewName)}
                  </p>
                  <div className="grid gap-2 border-t border-white/10 pt-3">
                    <button className="rounded-lg bg-[#182229] px-3 py-2 text-sm font-bold text-sky-300">Visit App</button>
                    <button className="rounded-lg bg-[#182229] px-3 py-2 text-sm font-bold text-sky-300">Instagram</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {status && (
            <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">Campaign Status</h2>
                  <p className="text-xs text-slate-400">{status.campaignId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => refreshStatus()}
                  className="rounded-xl border border-white/10 p-2 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
                >
                  <RefreshCw size={16} className={polling ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${sentPercent}%` }} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
                {[
                  ['Processed', status.processed],
                  ['Sent', status.sent],
                  ['Failed', status.failed],
                  ['Skipped', status.skipped],
                  ['Total', status.totalRows],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/5 bg-black/20 p-3">
                    <p className="text-xs font-bold text-slate-500">{label}</p>
                    <p className="mt-1 text-lg font-black text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 max-h-60 overflow-auto rounded-xl border border-white/5">
                {status.results.map(result => (
                  <div key={`${result.rowNumber}-${result.phoneNumber}`} className="flex items-start gap-3 border-b border-white/5 p-3 last:border-b-0">
                    <CheckCircle2 size={16} className={result.status === 'SENT' ? 'text-emerald-400' : 'text-slate-500'} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{result.name || result.phoneNumber}</p>
                      <p className="text-xs text-slate-500">{result.status}: {result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
