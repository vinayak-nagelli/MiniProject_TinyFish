import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, MapPin, Tag } from 'lucide-react';

export default function ResultCard({ item, index, onApprove }) {
  const isWinner = index === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-xl border ${isWinner ? 'bg-gradient-to-br from-sky-900/40 to-slate-900/80 border-sky-500/40 shadow-2xl shadow-sky-900/20' : 'bg-slate-800/40 border-slate-700/50'}`}
    >
      {isWinner && (
        <div className="absolute -top-3 left-6 bg-gradient-to-r from-sky-400 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Best Value Pick
        </div>
      )}
      
      <div className="flex justify-between items-start pt-2">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{item.item_name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="w-3 h-3" /> {item.restaurant_name}
            <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300 ml-2">{item.platform}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-bold">{item.rating}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> True Price</p>
          <p className="text-2xl font-bold text-sky-400">₹{item.true_price}</p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
          <p className="text-xs text-slate-500 mb-1">Price Breakdown</p>
          <p className="text-sm text-slate-300">Base: ₹{item.price}</p>
          <p className="text-sm text-slate-300">Delivery: ₹{item.delivery_fee}</p>
        </div>
      </div>

      <button 
        onClick={() => onApprove(item)}
        className={`w-full mt-2 py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all ${isWinner ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
      >
        <ShoppingBag className="w-4 h-4" />
        Approve & Add to Cart
      </button>
    </motion.div>
  );
}
