import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export default function ApprovalModal({ isOpen, onClose, selectedItem }) {
  if (!selectedItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 to-emerald-500" />
            
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Human Approval Required</h2>
            <p className="text-slate-400 text-sm mb-6">
              Food Agent AI has successfully navigated {selectedItem.platform} and staged your order. Please confirm to finalize payment.
            </p>

            <div className="bg-slate-800 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 font-medium">{selectedItem.item_name}</span>
                <span className="text-white font-bold">₹{selectedItem.true_price}</span>
              </div>
              <div className="text-sm text-slate-500">From {selectedItem.restaurant_name}</div>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium">
                Cancel
              </button>
              <button onClick={() => { alert('Payment confirmed! Order placed successfully.'); onClose(); }} className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all">
                Confirm Pay
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
