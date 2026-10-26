import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Star, Users, Store, Award, CheckCircle, ArrowRight } from 'lucide-react'
import StoreCard from '../components/StoreCard'
import { storeService } from '../api/services'

const STATS = [
  { number: '4', label: 'Physical Stores', icon: Store, color: 'text-green-500', bg: 'bg-green-50' },
  { number: '3,600+', label: 'Happy Customers', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { number: '860+', label: 'Products Available', icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
  { number: '6 Months', label: 'Warranty on All Products', icon: Shield, color: 'text-orange-500', bg: 'bg-orange-50' },
]

const TEAM_VALUES = [
  { icon: CheckCircle, title: 'Quality First', desc: 'Every product undergoes a 40-point quality inspection before being listed for sale.', color: 'text-green-500' },
  { icon: Shield, title: 'Transparent Pricing', desc: 'No hidden costs. The price you see is the price you pay.', color: 'text-blue-500' },
  { icon: Star, title: 'Customer Satisfaction', desc: 'Our 4.5+ rating across all stores is a testament to our commitment.', color: 'text-yellow-500' },
  { icon: Users, title: 'Community Trust', desc: 'Over 3,600 customers have trusted us for their technology needs.', color: 'text-purple-500' },
]

export default function AboutPage() {
  const [stores, setStores] = useState<any[]>([])
  useEffect(() => { storeService.getAll().then(d => setStores(d ?? [])) }, [])

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-[#07111F] py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-green-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-56 h-56 bg-cyan-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-green-500 rounded px-2 py-1 font-black text-black text-2xl leading-none">VR</div>
            <span className="font-black text-white text-lg">TECHNOLOGIES</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Refurbished. Reliable.<br />
            <span className="text-green-400">Ready for You.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Hyderabad's most trusted destination for quality refurbished technology — bringing premium devices to everyone, at prices that make sense.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <p className={`text-3xl font-black ${stat.color} mb-1`}>{stat.number}</p>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                VR Technologies was founded with a simple but powerful vision: to make quality technology accessible to everyone. We noticed that thousands of corporate laptops and desktops were being discarded or sold cheaply, even though they had years of productive life left in them.
              </p>
              <p>
                We started with a single store in Ameerpet, Hyderabad, focused on sourcing, refurbishing, and selling premium quality used devices. Our commitment to quality and transparent pricing quickly earned us the trust of students, freelancers, small businesses, and enterprises alike.
              </p>
              <p>
                Today, with 4 stores across Hyderabad and Guntur, we've served over 3,600 happy customers and continue to grow. Every device we sell has been through our rigorous 40-point quality check, comes with a 6-month warranty, and is priced to deliver real value.
              </p>
              <p>
                We believe that sustainable technology consumption isn't just good for your wallet — it's good for the planet. Each refurbished device we sell is one less device in a landfill.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400"
              alt="VR Technologies Store"
              className="rounded-2xl shadow-md object-cover h-52 w-full"
            />
            <img
              src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400"
              alt="Refurbished Laptop"
              className="rounded-2xl shadow-md object-cover h-52 w-full mt-8"
            />
            <img
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
              alt="Laptop Collection"
              className="rounded-2xl shadow-md object-cover h-52 w-full -mt-8"
            />
            <img
              src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400"
              alt="Our Store"
              className="rounded-2xl shadow-md object-cover h-52 w-full"
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">What We Stand For</h2>
            <p className="text-gray-500">Our core values drive everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_VALUES.map((value) => (
              <div key={value.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
                <value.icon size={32} className={`${value.color} mx-auto mb-3`} />
                <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What makes us different */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-10">The VR Technologies Difference</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '40-Point Quality Check',
              desc: 'Every device goes through a comprehensive inspection covering hardware, performance, cosmetics, battery, and ports before reaching you.',
              color: 'bg-green-50 border-green-100',
              badge: 'Quality Assured',
              badgeColor: 'bg-green-500 text-white',
            },
            {
              title: '6-Month Warranty',
              desc: 'We stand behind every product we sell with a robust 6-month warranty covering hardware defects and failures.',
              color: 'bg-blue-50 border-blue-100',
              badge: 'Warranty Included',
              badgeColor: 'bg-blue-500 text-white',
            },
            {
              title: 'Honest Grading',
              desc: 'We grade our devices honestly — Like New, Excellent, and Good — so you know exactly what to expect when your product arrives.',
              color: 'bg-purple-50 border-purple-100',
              badge: 'Transparent',
              badgeColor: 'bg-purple-500 text-white',
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-2xl border p-6 ${item.color}`}>
              <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-4 ${item.badgeColor}`}>
                {item.badge}
              </span>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Stores */}
      <div className="bg-[#07111F] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Our Stores</h2>
              <p className="text-gray-400 text-sm mt-1">Visit us in person for the best experience</p>
            </div>
            <Link to="/stores" className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1">
              All Stores <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stores.length === 0
              ? [1,2,3,4].map(i => <div key={i} className="bg-gray-700/30 rounded-2xl h-48 animate-pulse" />)
              : stores.map((store) => <StoreCard key={store.id} store={store} />)
            }
          </div>
        </div>
      </div>
    </div>
  )
}
