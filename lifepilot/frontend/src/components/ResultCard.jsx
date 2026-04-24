import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, MapPin, Tag, Percent, Truck, Trophy, ExternalLink } from 'lucide-react';

const PLATFORM_STYLES = {
  Swiggy: {
    bg: 'from-orange-900/30 to-slate-900/80',
    border: 'border-orange-500/40',
    badge: 'bg-orange-500',
    accent: 'text-orange-400',
    shadow: 'shadow-orange-900/20',
    dot: 'bg-orange-400',
  },
  Zomato: {
    bg: 'from-red-900/30 to-slate-900/80',
    border: 'border-red-500/40',
    badge: 'bg-red-500',
    accent: 'text-red-400',
    shadow: 'shadow-red-900/20',
    dot: 'bg-red-400',
  },
};

export default function ResultCard({ item, index, onApprove }) {
  const isWinner = index === 0;
  const style = PLATFORM_STYLES[item.platform] || PLATFORM_STYLES.Swiggy;
  const displayPrice = item.true_price > 0 ? item.true_price : item.price;
  const savings = item.discount > 0 ? item.discount : 0;
  const deliveryFree = item.delivery_fee === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, type: 'spring', stiffness: 100 }}
      className={`relative rounded-2xl flex flex-col backdrop-blur-xl border overflow-hidden
        ${isWinner
          ? `bg-gradient-to-br ${style.bg} ${style.border} shadow-2xl ${style.shadow}`
          : 'bg-slate-800/40 border-slate-700/50'
        }`}
    >
      {/* Winner Badge */}
      {isWinner && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${style.dot}`} />
      )}

      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${style.accent}`}>
              {item.platform}
            </span>
            {isWinner && (
              <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full">
                <Trophy className="w-3 h-3" /> Best Deal
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-lg text-sm">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold">{item.rating > 0 ? item.rating : 'N/A'}</span>
          </div>
        </div>

        {/* Item Name */}
        <h3 className="text-lg font-bold text-white leading-tight mb-1">
          {item.item_name}
        </h3>

        {/* Restaurant */}
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="truncate">{item.restaurant_name}</span>
        </div>
      </div>

      {/* Price Block */}
      <div className="mx-5 mb-4 bg-slate-900/60 rounded-xl p-4 border border-slate-700/30">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
              <Tag className="w-3 h-3" /> True Price (You Pay)
            </p>
            <p className={`text-3xl font-black ${style.accent}`}>₹{displayPrice}</p>
          </div>
          <div className="text-right space-y-1">
            {item.price > 0 && (
              <p className="text-sm text-slate-400">
                Base: <span className="text-white font-semibold">₹{item.price}</span>
              </p>
            )}
            <p className={`text-sm flex items-center justify-end gap-1 ${deliveryFree ? 'text-green-400' : 'text-slate-400'}`}>
              <Truck className="w-3.5 h-3.5" />
              {deliveryFree ? 'Free Delivery' : `₹${item.delivery_fee} delivery`}
            </p>
          </div>
        </div>

        {/* Savings Bar */}
        {savings > 0 ? (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
            <Percent className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 text-sm font-semibold">You save ₹{savings}!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1.5">
            <span className="text-slate-500 text-sm">No active discount</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={() => onApprove(item)}
          className={`flex-1 py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all text-sm
            ${isWinner
              ? `bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-lg`
              : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Approve & Add to Cart
        </button>
        {item.item_url && (
          <a
            href={item.item_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-3 rounded-xl transition-all"
            title="View on platform"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
