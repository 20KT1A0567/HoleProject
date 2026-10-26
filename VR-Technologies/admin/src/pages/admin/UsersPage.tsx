import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import { adminUserService } from '../../api/adminServices'
import toast from 'react-hot-toast'

const ROLES = ['SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF', 'SUPPORT']
const STORES = ['All Stores', 'Ameerpet', 'KPHB', 'Dilsukhnagar', 'Guntur']

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin', STORE_MANAGER: 'Store Manager',
  SALES_STAFF: 'Sales Staff', SUPPORT: 'Support'
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'SALES_STAFF', store: 'All Stores', password: '' })

  useEffect(() => {
    adminUserService.getAll()
      .then(d => setUsers(d ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return }
    const newUser = {
      id: Date.now(), name: form.name, email: form.email,
      role: form.role, store: form.store, status: 'Active', lastLogin: '—'
    }
    setUsers(prev => [...prev, newUser])
    adminUserService.create(newUser).catch(() => {})
    toast.success('User created!')
    setShowModal(false)
    setForm({ name: '', email: '', role: 'SALES_STAFF', store: 'All Stores', password: '' })
  }

  const deleteUser = (id: number) => {
    adminUserService.delete(id).catch(() => {})
    setUsers(prev => prev.filter(u => u.id !== id))
    toast.success('User removed')
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Users & Roles" subtitle="Loading..." />
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0A1628] border-b border-[#1E3A5F]">
                <tr>
                  {['User', 'Role', 'Store', 'Status', 'Last Login', 'Actions'].map(h => (
                    <th key={h} className="p-4 text-left text-[#64748B] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#1E3A5F] animate-pulse">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1E3A5F]" />
                        <div className="space-y-1">
                          <div className="h-4 bg-[#1E3A5F] rounded w-28" />
                          <div className="h-3 bg-[#1E3A5F] rounded w-36" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-4 bg-[#1E3A5F] rounded w-24" /></td>
                    <td className="p-4"><div className="h-4 bg-[#1E3A5F] rounded w-20" /></td>
                    <td className="p-4"><div className="h-4 bg-[#1E3A5F] rounded w-16" /></td>
                    <td className="p-4"><div className="h-4 bg-[#1E3A5F] rounded w-24" /></td>
                    <td className="p-4"><div className="h-4 bg-[#1E3A5F] rounded w-16" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Users & Roles" subtitle={`${users.length} admin users`}
        action={{ label: 'Add User', onClick: () => setShowModal(true), icon: <Plus size={16} /> }} />

      <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0A1628] border-b border-[#1E3A5F]">
              <tr>
                {['User', 'Role', 'Store', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-left text-[#64748B] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#64748B]">No users found</td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-[#1E3A5F] last:border-0 hover:bg-[#0A1628] ${i % 2 !== 0 ? 'bg-[#0A1628]/30' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#22C55E] font-bold text-sm">{u.name?.[0] ?? '?'}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{u.name}</p>
                          <p className="text-[#64748B] text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={u.role} /></td>
                    <td className="p-4 text-[#94A3B8] text-xs">{u.store}</td>
                    <td className="p-4"><StatusBadge status={u.status} /></td>
                    <td className="p-4 text-[#64748B] text-xs">{u.lastLogin}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button className="p-2 rounded-lg text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#22C55E]/10"><Edit size={14} /></button>
                        <button onClick={() => deleteUser(u.id)} className="p-2 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Add Admin User" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Suresh Kumar' },
              { label: 'Email Address', key: 'email', type: 'email', placeholder: 'suresh@vr.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">{label}</label>
                <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#22C55E]" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Role</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]">
                  {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Assigned Store</label>
                <select value={form.store} onChange={e => setForm(p => ({ ...p, store: e.target.value }))}
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]">
                  {STORES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#1E3A5F] text-[#94A3B8] rounded-lg text-sm hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold py-2.5 rounded-lg text-sm">Create User</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
