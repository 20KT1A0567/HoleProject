import { Link } from 'react-router-dom'
import { Share2, Camera, Video, MessageCircle, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#07111F] text-gray-400">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-green-500 rounded px-2 py-1 font-black text-black text-xl leading-none">VR</div>
              <div>
                <p className="font-bold text-white text-sm leading-tight">TECHNOLOGIES</p>
                <p className="text-xs text-green-400 leading-tight">REFURBISHED. RELIABLE. READY FOR YOU.</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Hyderabad's most trusted destination for quality refurbished laptops, desktops, and accessories.
              4 stores, 6-month warranty, and unbeatable prices.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                <Share2 size={16} className="text-white" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                <Camera size={16} className="text-white" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors" aria-label="YouTube">
                <Video size={16} className="text-white" />
              </a>
              <a href="https://wa.me/919100012345" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors" aria-label="WhatsApp">
                <MessageCircle size={16} className="text-white" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2.5">
              {[
                ['Laptops', '/products?category=Laptops'],
                ['Desktops', '/products?category=Desktops'],
                ['Accessories', '/products?category=Accessories'],
                ['Monitors', '/products?category=Monitors'],
                ['Offers', '/products?tag=offers'],
                ['New Arrivals', '/products?tag=new'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm hover:text-green-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-2.5">
              {[
                ['Contact Us', '/contact'],
                ['Track Order', '/orders'],
                ['Returns & Refunds', '/returns'],
                ['Warranty Policy', '/warranty-policy'],
                ['Shipping Policy', '/warranty-policy'],
                ['FAQs', '/contact'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm hover:text-green-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About + Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">About Us</h3>
            <ul className="space-y-2.5 mb-6">
              {[
                ['About VR Technologies', '/about'],
                ['Our Stores', '/stores'],
                ['Careers', '/about'],
                ['Privacy Policy', '/privacy'],
                ['Terms & Conditions', '/terms'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm hover:text-green-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="text-green-400 mt-0.5 shrink-0" />
                <span>Ameerpet, Hyderabad, Telangana</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-green-400 shrink-0" />
                <a href="tel:+919100012345" className="hover:text-green-400 transition-colors">91000 12345</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle size={14} className="text-green-400 shrink-0" />
                <a href="https://wa.me/919100012345" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">WhatsApp Us</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-green-400 shrink-0" />
                <a href="mailto:support@vrtechnologies.in" className="hover:text-green-400 transition-colors">support@vrtechnologies.in</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment + Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; 2024 VR Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-1">We accept:</span>
            {['VISA', 'Mastercard', 'UPI', 'NET BANKING', 'COD'].map((method) => (
              <span
                key={method}
                className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700 font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
