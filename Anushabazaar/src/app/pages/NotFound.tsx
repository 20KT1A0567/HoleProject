import { Link } from 'react-router';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        {/* Animated 404 */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mb-8"
        >
          <h1 className="text-[140px] md:text-[180px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-green-200 to-green-400 leading-none select-none">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-500 mb-10 max-w-md mx-auto text-base leading-relaxed">
            Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-7 py-3.5 rounded-2xl font-bold shadow-lg shadow-green-200 transition-colors"
              >
                <Home className="w-5 h-5" /> Back to Home
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-600 px-7 py-3.5 rounded-2xl font-bold transition-all"
              >
                <Search className="w-5 h-5" /> Browse Products
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
