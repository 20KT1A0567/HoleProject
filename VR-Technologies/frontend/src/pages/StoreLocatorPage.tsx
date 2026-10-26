import { useState, useEffect } from 'react'
import { MapPin, Search, Phone, Clock, Star, MessageCircle, Navigation, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import StoreCard from '../components/StoreCard'
import { storeService } from '../api/services'

export default function StoreLocatorPage() {
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('All')
  const [allStores, setAllStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storeService.getAll()
      .then(data => setAllStores(data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const cities = ['All', 'Hyderabad', 'Guntur']

  const filteredStores = allStores.filter((store) => {
    const matchCity = selectedCity === 'All' || store.city === selectedCity
    const matchSearch = !search || store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.address.toLowerCase().includes(search.toLowerCase())
    return matchCity && matchSearch
  })

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-[#07111F] py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Find a VR Technologies Store
          </h1>
          <p className="text-gray-400 mb-8">4 stores across Hyderabad and Guntur. Visit us today!</p>
          <div className="flex gap-3 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by area or store name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-gray-800 text-white border border-gray-700 focus:border-green-400 outline-none"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-xl px-4 text-sm focus:border-green-400 outline-none cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="relative h-72 md:h-96 bg-gray-200 overflow-hidden">
        <iframe
          title="VR Technologies Stores Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30451.77897963085!2d78.42876!3d17.43756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb97e9fced98ef%3A0xea8ef4c2f41da98c!2sAmeerpet%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#F8FAFC]/20" />
      </div>

      {/* Store count */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredStores.length} Store{filteredStores.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              Open Now ({filteredStores.filter(s => s.active).length})
            </span>
          </div>
        </div>

        {/* Store cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {loading ? (
            [1,2,3,4].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-56 animate-pulse" />)
          ) : filteredStores.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No stores found</h3>
              <p className="text-gray-500 text-sm">
                {allStores.length === 0 ? 'Store data unavailable' : 'Try a different search term or city'}
              </p>
            </div>
          ) : filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>

        {/* All stores detail list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">All Store Locations</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-green-500" />
              </div>
            ) : allStores.length === 0 ? (
              <div className="text-center py-12">
                <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No store data available</p>
              </div>
            ) : null}
            {allStores.map((store) => (
              <div key={store.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full md:w-32 h-24 object-cover rounded-xl border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">{store.name}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${store.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {store.active ? 'Open' : 'Closed'}
                      </span>
                      <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-yellow-700">{store.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 mb-2">
                    <MapPin size={13} className="text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-600">{store.address}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={12} className="text-blue-500" /> {store.timings}</span>
                    <span className="flex items-center gap-1"><Navigation size={12} className="text-orange-500" /> {store.distance}</span>
                    <span className="flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {store.phone}</span>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 shrink-0">
                  <a
                    href={`https://wa.me/91${store.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                  <Link
                    to={`/stores/${store.id}`}
                    className="flex items-center gap-1.5 border border-gray-200 hover:border-green-400 text-gray-700 text-xs font-medium px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <MapPin size={14} /> View Store
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
