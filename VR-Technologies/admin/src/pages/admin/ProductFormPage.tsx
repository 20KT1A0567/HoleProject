import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Settings2,
  Layers3,
  IndianRupee,
  PackageCheck,
  ImagePlus,
  Eye,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminProductService, adminBrandService, uploadService } from '../../api/adminServices'
import MediaUpload from '@/components/ui/MediaUpload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { cn } from '../../lib/utils'

const stores = ['Ameerpet', 'KPHB', 'Dilsukhnagar', 'Guntur']
const FALLBACK_BRANDS = ['Lenovo', 'HP', 'Dell', 'Apple', 'Asus', 'Acer']

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    model: '',
    brand: '',
    category: '',
    processor: '',
    processorGen: '',
    ram: '',
    storage: '',
    storageType: '',
    graphics: '',
    displaySize: '',
    displayType: '',
    os: '',
    condition: '',
    grade: 'A',
    battery: '4-5 hours expected backup',
    weight: '',
    price: '',
    mrp: '',
    warrantyMonths: '6',
    returnDays: '7',
    sku: '',
    serial: '',
    warrantySummary: '6 months seller warranty included',
    description: '',
    visible: true,
    featured: false,
  })

  const [images, setImages] = useState<string[]>([])
  const [video, setVideo] = useState('')
  const [brandOptions, setBrandOptions] = useState<string[]>(FALLBACK_BRANDS)
  const [stock, setStock] = useState<Record<string, number>>({ Ameerpet: 0, KPHB: 0, Dilsukhnagar: 0, Guntur: 0 })

  useEffect(() => {
    adminBrandService.getAll()
      .then((d: any[]) => {
        const names = (d ?? []).map(b => b.name).filter(Boolean)
        if (names.length) setBrandOptions(names)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) return
    adminProductService.getById(Number(id)).then(prod => {
      if (!prod) return
      setForm({
        title: prod.name ?? '',
        model: prod.model ?? '',
        brand: prod.brand ?? '',
        category: prod.category ?? '',
        processor: prod.processor ?? '',
        processorGen: prod.processorGen ?? '',
        ram: prod.ram ?? '',
        storage: prod.storage ?? '',
        storageType: prod.storageType ?? '',
        graphics: prod.graphics ?? '',
        displaySize: prod.displaySize ?? '',
        displayType: prod.displayType ?? '',
        os: prod.os ?? '',
        condition: prod.condition ?? 'Excellent',
        grade: prod.grade ?? 'A',
        battery: prod.battery ?? '4-5 hours expected backup',
        weight: prod.weight ?? '',
        price: String(prod.price ?? ''),
        mrp: String(prod.mrp ?? ''),
        warrantyMonths: String(prod.warranty ?? 6),
        returnDays: String(prod.returnDays ?? 7),
        sku: prod.sku ?? '',
        serial: prod.serial ?? '',
        warrantySummary: prod.warrantySummary ?? '6 months seller warranty included',
        description: prod.description ?? '',
        visible: prod.visible ?? true,
        featured: prod.featured ?? false,
      })
      if (prod.images?.length) setImages(prod.images.map((i: any) => typeof i === 'string' ? i : i.imageUrl).filter(Boolean))
      if (prod.video) setVideo(prod.video)
      if (prod.stock) setStock(prod.stock)
    })
  }, [id])

  const discount = form.price && form.mrp ? Math.max(0, Math.round((1 - Number(form.price) / Number(form.mrp)) * 100)) : 0
  const totalStock = Object.values(stock).reduce((a, b) => a + b, 0)
  const setField = (k: string, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = () => {
    if (!form.title || !form.price) {
      toast.error('Title and price are required')
      return
    }
    const payload = { ...form, images: images.filter(Boolean), video, stock }
    const action = isEdit ? adminProductService.update(Number(id), payload) : adminProductService.create(payload)
    action
      .then(() => {
        toast.success(isEdit ? 'Product updated successfully!' : 'Product created successfully!')
        navigate('/products')
      })
      .catch(() => toast.error('Failed to save product'))
  }

  const addImageUrl = (url: string) => setImages(prev => [...prev, url])
  const removeImage = (idx: number) => {
    const url = images[idx]
    if (url) uploadService.deleteByUrl(url).catch(() => {})
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const previewSpecs = [form.processor, form.ram && `${form.ram}GB`, form.storage && `${form.storage}GB ${form.storageType}`]
    .filter(Boolean)
    .join(' / ')

  const FormSection = ({ title, subtitle, index, children }: { title: string, subtitle: string, index: number, children: React.ReactNode }) => (
    <Card className="overflow-visible">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            {index === 1 && <Layers3 size={20} />}
            {index === 2 && <Settings2 size={20} />}
            {index === 3 && <IndianRupee size={20} />}
            {index === 4 && <PackageCheck size={20} />}
            {index === 5 && <ImagePlus size={20} />}
            {index === 6 && <Eye size={20} />}
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-white/10 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/75 px-4 py-4 lg:-mx-6 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/products')} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEdit ? `Editing: ${form.title}` : 'Create a polished catalog item with pricing, media, visibility, and store stock.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/products')}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save size={14} /> {isEdit ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Section 1: Basic Information */}
          <FormSection index={1} title="Basic Information" subtitle="Customer-facing catalog identity and taxonomy.">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. Lenovo ThinkPad T480"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="model">Model Number</Label>
              <Input id="model" value={form.model} onChange={e => setField('model', e.target.value)} placeholder="e.g. T480" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Select value={form.brand} onChange={e => setField('brand', e.target.value)} className="mt-1.5">
                <option value="">Select Brand</option>
                {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={form.category} onChange={e => setField('category', e.target.value)} className="mt-1.5">
                <option value="">Select Category</option>
                {['Laptops', 'Desktops', 'Accessories', 'Monitors', 'Workstations'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </FormSection>

          {/* Section 2: Specifications */}
          <FormSection index={2} title="Specifications" subtitle="Technical attributes used for filtering and comparison.">
            <div>
              <Label htmlFor="processor">Processor</Label>
              <Select value={form.processor} onChange={e => setField('processor', e.target.value)} className="mt-1.5">
                <option value="">Select Processor</option>
                {['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="processorGen">Processor Generation</Label>
              <Input id="processorGen" value={form.processorGen} onChange={e => setField('processorGen', e.target.value)} placeholder="e.g. 8th Gen" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="ram">RAM (GB)</Label>
              <Select value={form.ram} onChange={e => setField('ram', e.target.value)} className="mt-1.5">
                <option value="">Select RAM</option>
                {['4', '8', '16', '32', '64'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="storage">Storage (GB)</Label>
              <Select value={form.storage} onChange={e => setField('storage', e.target.value)} className="mt-1.5">
                <option value="">Select Storage</option>
                {['128', '256', '512', '1000', '2000'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="storageType">Storage Type</Label>
              <Select value={form.storageType} onChange={e => setField('storageType', e.target.value)} className="mt-1.5">
                <option value="">Select Type</option>
                {['SSD', 'HDD', 'NVMe', 'eMMC'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="graphics">Graphics Card</Label>
              <Input id="graphics" value={form.graphics} onChange={e => setField('graphics', e.target.value)} placeholder="e.g. Intel UHD 620" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="displaySize">Display Size</Label>
              <Input id="displaySize" value={form.displaySize} onChange={e => setField('displaySize', e.target.value)} placeholder="e.g. 14&quot;" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="displayType">Display Type</Label>
              <Input id="displayType" value={form.displayType} onChange={e => setField('displayType', e.target.value)} placeholder="e.g. FHD IPS" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="os">Operating System</Label>
              <Select value={form.os} onChange={e => setField('os', e.target.value)} className="mt-1.5">
                <option value="">Select OS</option>
                {['Windows 10 Pro', 'Windows 11 Pro', 'Windows 10 Home', 'Ubuntu', 'No OS'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input id="weight" value={form.weight} onChange={e => setField('weight', e.target.value)} placeholder="e.g. 1.58 kg" className="mt-1.5" />
            </div>
          </FormSection>

          {/* Section 3: Condition & Pricing */}
          <FormSection index={3} title="Condition & Pricing" subtitle="Commercial details, warranty terms, and discount display.">
            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select value={form.condition} onChange={e => setField('condition', e.target.value)} className="mt-1.5">
                <option value="">Select Condition</option>
                {['Like New', 'Excellent', 'Good', 'Fair'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" value={form.grade} onChange={e => setField('grade', e.target.value)} placeholder="e.g. A, B" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="battery">Battery Note</Label>
              <Input id="battery" value={form.battery} onChange={e => setField('battery', e.target.value)} placeholder="e.g. 4-5 hours expected" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="price">Selling Price (₹) *</Label>
              <Input id="price" type="number" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="32999" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="mrp">Original Price / MRP (₹)</Label>
              <Input id="mrp" type="number" value={form.mrp} onChange={e => setField('mrp', e.target.value)} placeholder="52999" className="mt-1.5" />
            </div>
            <div>
              <Label>Discount %</Label>
              <div className="mt-1.5 flex h-11 items-center rounded-xl border border-white/15 bg-slate-900/50 px-3">
                <span className="text-lg font-black text-emerald-400">{discount}% OFF</span>
              </div>
            </div>
            <div>
              <Label htmlFor="warrantyMonths">Warranty (Months)</Label>
              <Input id="warrantyMonths" type="number" value={form.warrantyMonths} onChange={e => setField('warrantyMonths', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="returnDays">Return Days</Label>
              <Input id="returnDays" type="number" value={form.returnDays} onChange={e => setField('returnDays', e.target.value)} className="mt-1.5" />
            </div>
          </FormSection>

          {/* Section 4: Product Identity */}
          <FormSection index={4} title="Product Identity" subtitle="Internal tracking, warranty copy, and rich description.">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" value={form.sku} onChange={e => setField('sku', e.target.value)} placeholder="e.g. LEN-T480-001" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="serial">Serial Number</Label>
              <Input id="serial" value={form.serial} onChange={e => setField('serial', e.target.value)} placeholder="e.g. PF1A2B3C" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="warrantySummary">Warranty Summary</Label>
              <Input id="warrantySummary" value={form.warrantySummary} onChange={e => setField('warrantySummary', e.target.value)} placeholder="e.g. 6 months seller warranty" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Product description..." rows={5} className="mt-1.5" />
            </div>
          </FormSection>

          {/* Section 5: Media Library */}
          <FormSection index={5} title="Media Library" subtitle="Upload product images and optional demonstration video.">
            <div className="sm:col-span-2">
              <div className="space-y-4">
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="group relative">
                        <img src={img} alt="" className="h-32 w-full rounded-xl border border-white/10 object-cover shadow-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-red-400 opacity-0 transition hover:bg-red-500/20 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <MediaUpload type="image" folder="products" value="" onChange={addImageUrl} label={images.length === 0 ? 'Add product image' : 'Add another image'} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <MediaUpload type="video" folder="products" value={video} onChange={setVideo} label="Product video (optional)" />
            </div>
          </FormSection>

          {/* Section 6: Publishing */}
          <FormSection index={6} title="Publishing" subtitle="Control visibility and store-level inventory.">
            <div className="flex flex-col gap-4 sm:flex-row">
              {[
                { key: 'visible', label: 'Visible on Website', desc: 'Show this product to customers' },
                { key: 'featured', label: 'Featured on Homepage', desc: 'Highlight this product on home page' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 p-4 hover:bg-slate-900/80 transition-colors">
                  <Checkbox
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => setField(key, e.target.checked)}
                  />
                  <div>
                    <Label className="text-sm font-semibold text-white">{label}</Label>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <Label>Store Stock Allocation</Label>
              <div className="grid grid-cols-2 gap-4 mt-1.5 sm:grid-cols-4">
                {stores.map(s => (
                  <div key={s}>
                    <Label className="text-xs">{s}</Label>
                    <Input
                      type="number"
                      value={stock[s]}
                      onChange={e => setStock(prev => ({ ...prev, [s]: Number(e.target.value) }))}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Total stock: <span className="font-bold text-emerald-400">{totalStock}</span> units across all stores
              </p>
            </div>
          </FormSection>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Live Preview Card */}
          <Card className="sticky top-28">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="text-emerald-400" size={18} />
                <CardTitle className="text-base">Live Preview</CardTitle>
              </div>
              <p className="text-xs text-slate-400">Catalog card snapshot</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-slate-50 to-slate-100">
                <div className="relative h-44 bg-gradient-to-b from-slate-100 to-slate-200">
                  {images[0] ? (
                    <img src={images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <ImagePlus size={42} />
                    </div>
                  )}
                  {discount > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-black text-white">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <div className="p-4 text-slate-900">
                  <p className="text-[11px] font-black uppercase text-emerald-600">{form.brand || 'Brand'}</p>
                  <h4 className="mt-1 min-h-10 text-sm font-black leading-tight">{form.title || 'Product title preview'}</h4>
                  <p className="mt-1 text-xs text-slate-500">{previewSpecs || 'Specs preview'}</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-xl font-black text-emerald-700">₹{Number(form.price || 0).toLocaleString('en-IN')}</span>
                    {form.mrp && <span className="text-sm text-slate-400 line-through">₹{Number(form.mrp).toLocaleString('en-IN')}</span>}
                  </div>
                </div>
              </div>

              {/* Additional info */}
              <div className="mt-4 space-y-2 text-sm border-t border-white/5 pt-4">
                {[
                  ['Category', form.category || 'Not selected'],
                  ['Condition', form.condition || 'Not selected'],
                  ['Warranty', `${form.warrantyMonths || 0} months`],
                  ['Stock', `${totalStock} units`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-400">{k}</span>
                    <span className="font-bold text-white">{v}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Publishing Checklist */}
          <Card>
            <CardContent>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-emerald-400 shrink-0" size={20} />
                <div>
                  <h3 className="font-bold text-white text-sm">Publishing checklist</h3>
                  <p className="text-xs text-slate-400 mt-1">Add title, price, image, brand, category, and stock before publishing.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
