import { useState } from 'react'
import { Save } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import toast from 'react-hot-toast'

const TABS = ['General', 'Notifications', 'Security', 'Integrations']

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">{label}</label>
    <input {...props} className={`w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#22C55E] ${props.className ?? ''}`} />
  </div>
)

const Toggle = ({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#1E3A5F] last:border-0">
    <div>
      <p className="text-white text-sm font-medium">{label}</p>
      <p className="text-[#64748B] text-xs mt-0.5">{desc}</p>
    </div>
    <button onClick={onChange} className="relative flex-shrink-0">
      <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#22C55E]' : 'bg-[#1E3A5F]'}`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
    </button>
  </div>
)

export default function SettingsPage() {
  const [tab, setTab] = useState('General')
  const [notifs, setNotifs] = useState({ newOrder: true, lowStock: true, newCustomer: false, orderDelivered: true, reviewSubmit: false })
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' })

  const toggleNotif = (k: keyof typeof notifs) => setNotifs(prev => ({ ...prev, [k]: !prev[k] }))

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your admin panel" />

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-1 mb-5 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-[#22C55E] text-black' : 'text-[#94A3B8] hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'General' && (
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5 max-w-2xl">
          <h3 className="text-white font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <Input label="Business Name" defaultValue="VR Technologies" />
            <Input label="Tagline" defaultValue="Refurbished. Reliable. Ready for You." />
            <Input label="Support Email" type="email" defaultValue="support@vrtechnologies.in" />
            <Input label="Support Phone" defaultValue="91000 12345" />
            <Input label="WhatsApp" defaultValue="91000 12345" />
            <div>
              <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Address</label>
              <textarea defaultValue="Hyderabad, Telangana, India" rows={2}
                className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Currency</label>
                <select className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]">
                  <option>INR (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Timezone</label>
                <select className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]">
                  <option>Asia/Kolkata (IST)</option>
                </select>
              </div>
            </div>
            <button onClick={() => toast.success('Settings saved!')} className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold px-5 py-2.5 rounded-lg text-sm">
              <Save size={14} /> Save Settings
            </button>
          </div>
        </div>
      )}

      {tab === 'Notifications' && (
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5 max-w-2xl">
          <h3 className="text-white font-semibold mb-4">Notification Preferences</h3>
          <Toggle label="New Order" desc="Get notified when a new order is placed" checked={notifs.newOrder} onChange={() => toggleNotif('newOrder')} />
          <Toggle label="Low Stock Alert" desc="Alert when product stock falls below threshold" checked={notifs.lowStock} onChange={() => toggleNotif('lowStock')} />
          <Toggle label="New Customer" desc="Notify when a new customer registers" checked={notifs.newCustomer} onChange={() => toggleNotif('newCustomer')} />
          <Toggle label="Order Delivered" desc="Notify when an order is delivered" checked={notifs.orderDelivered} onChange={() => toggleNotif('orderDelivered')} />
          <Toggle label="Review Submitted" desc="Notify when a customer submits a review" checked={notifs.reviewSubmit} onChange={() => toggleNotif('reviewSubmit')} />
          <button onClick={() => toast.success('Notification settings saved!')} className="mt-4 flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold px-5 py-2.5 rounded-lg text-sm">
            <Save size={14} /> Save Preferences
          </button>
        </div>
      )}

      {tab === 'Security' && (
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5 max-w-md">
          <h3 className="text-white font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <Input label="Current Password" type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
            <Input label="New Password" type="password" value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))} placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
            <button onClick={() => {
              if (pw.new !== pw.confirm) { toast.error('Passwords do not match'); return }
              toast.success('Password changed successfully!')
              setPw({ current: '', new: '', confirm: '' })
            }} className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold px-5 py-2.5 rounded-lg text-sm">
              <Save size={14} /> Change Password
            </button>
          </div>
        </div>
      )}

      {tab === 'Integrations' && (
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5 max-w-2xl">
          <h3 className="text-white font-semibold mb-4">Integrations</h3>
          <div className="space-y-6">
            {[
              { title: 'Razorpay', desc: 'Payment gateway for UPI, cards, net banking', fields: ['Key ID', 'Key Secret', 'Webhook Secret'] },
              { title: 'Firebase', desc: 'Push notifications and OTP authentication', fields: ['API Key', 'Project ID', 'Messaging Sender ID'] },
            ].map(integration => (
              <div key={integration.title} className="bg-[#0A1628] rounded-xl border border-[#1E3A5F] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
                    <span className="text-[#22C55E] text-xs font-bold">{integration.title[0]}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{integration.title}</p>
                    <p className="text-[#64748B] text-xs">{integration.desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {integration.fields.map(f => (
                    <input key={f} placeholder={f} type="password"
                      className="w-full bg-[#07111F] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#22C55E]" />
                  ))}
                </div>
                <button onClick={() => toast.success(`${integration.title} settings saved!`)}
                  className="mt-3 flex items-center gap-1.5 bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 px-3 py-1.5 rounded-lg text-xs font-medium">
                  <Save size={11} /> Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
