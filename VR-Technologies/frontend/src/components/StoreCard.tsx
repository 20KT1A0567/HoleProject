import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock, MessageCircle, Star, Navigation } from 'lucide-react'

interface Store {
  id: number
  name: string
  address: string
  city: string
  phone: string
  whatsapp: string
  timings: string
  distance: string
  rating: number
  image: string
  active: boolean
}

interface Props {
  store: Store
}

export default function StoreCard({ store }: Props) {
  const isOpen = store.active

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-gray-800">{store.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-1">{store.name}</h3>

        <div className="flex items-start gap-1.5 mb-2">
          <MapPin size={13} className="text-green-500 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">{store.address}</p>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-blue-500" />
            <span className="text-xs text-gray-600">{store.timings}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Navigation size={13} className="text-orange-500" />
            <span className="text-xs text-gray-500">{store.distance}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:+91${store.phone.replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 flex-1 justify-center border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs font-medium py-2 rounded-lg transition-all"
          >
            <Phone size={13} />
            <span>{store.phone}</span>
          </a>
          <a
            href={`https://wa.me/91${store.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 flex-1 justify-center border border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-600 hover:text-green-600 text-xs font-medium py-2 rounded-lg transition-all"
          >
            <MessageCircle size={13} />
            <span>WhatsApp</span>
          </a>
        </div>

        <Link
          to={`/stores/${store.id}`}
          className="mt-2 w-full block text-center bg-[#07111F] hover:bg-green-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          View Store
        </Link>
      </div>
    </div>
  )
}
