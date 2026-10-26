import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react'
import { storeService } from '../api/services'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState<any[]>([])
  useEffect(() => { storeService.getAll().then(d => setStores(d ?? [])) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
    toast.success('Message sent successfully!', { icon: '✅' })
  }

  const CONTACT_INFO = [
    {
      icon: MapPin,
      title: 'Main Office',
      lines: ['S.No. 4-5-577, Ameerpet Main Road', 'Hyderabad, Telangana 500016'],
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      icon: Phone,
      title: 'Phone',
      lines: ['+91 91000 12345', '+91 93981 23456'],
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      action: 'tel:+919100012345',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      lines: ['+91 91000 12345', 'Chat with us instantly'],
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      action: 'https://wa.me/919100012345',
    },
    {
      icon: Mail,
      title: 'Email',
      lines: ['support@vrtechnologies.in', 'business@vrtechnologies.in'],
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      action: 'mailto:support@vrtechnologies.in',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      lines: ['Monday – Sunday', '10:00 AM – 9:00 PM'],
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-[#07111F] py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Get in Touch</h1>
          <p className="text-gray-400 text-lg">
            Have a question? We're here to help. Reach out via any of the channels below.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_INFO.map((info) => (
              <div key={info.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
                <div className={`w-11 h-11 ${info.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <info.icon size={20} className={info.color} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm mb-1">{info.title}</p>
                  {info.lines.map((line, i) =>
                    info.action && i === 0 ? (
                      <a
                        key={i}
                        href={info.action}
                        target={info.action.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className={`block text-sm ${info.color} font-medium hover:underline`}
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={i} className="text-sm text-gray-500">{line}</p>
                    )
                  )}
                </div>
              </div>
            ))}

            {/* Quick links to stores */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Store Direct Lines</h3>
              <div className="space-y-2">
                {stores.length === 0
                  ? <p className="text-xs text-gray-400">Loading store info...</p>
                  : stores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{store.name.split('–')[1]?.trim() ?? store.name}</span>
                    <a href={`tel:+91${store.phone?.replace(/\s/g, '')}`} className="text-xs text-green-600 font-semibold hover:underline">
                      +91 {store.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                    className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                        <input
                          type="tel"
                          placeholder="Mobile number"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                        <select
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white cursor-pointer transition-colors"
                        >
                          <option value="">Select a topic...</option>
                          <option value="product">Product Inquiry</option>
                          <option value="order">Order Support</option>
                          <option value="warranty">Warranty Claim</option>
                          <option value="return">Return / Exchange</option>
                          <option value="bulk">Bulk Purchase</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
                      <textarea
                        rows={5}
                        placeholder="Tell us how we can help you..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-black font-bold py-4 rounded-xl text-sm transition-colors"
                    >
                      {loading ? (
                        <>Sending... <span className="animate-spin">⏳</span></>
                      ) : (
                        <><Send size={16} /> Send Message</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="h-72 md:h-96 relative overflow-hidden">
        <iframe
          title="VR Technologies Hyderabad"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30451!2d78.4487!3d17.4374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb97e9fced98ef%3A0xea8ef4c2f41da98c!2sAmeerpet%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1700000000000"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  )
}
