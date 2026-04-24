import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CommandInput from '../components/CommandInput';
import ResultCard from '../components/ResultCard';
import ApprovalModal from '../components/ApprovalModal';
import useStore from '../store/useStore';
import Background3D from '../components/Background3D';
import { Trophy, Flame, Zap } from 'lucide-react';

export default function Home() {
  const { user, openAuthModal, currentResults, activeIntent, agentStatus, errorMessage } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleApprove = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const swiggyResults = currentResults.filter(r => r.platform === 'Swiggy');
  const zomatoResults = currentResults.filter(r => r.platform === 'Zomato');
  const bestDeal = currentResults[0];

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden flex flex-col">
      <Background3D />
      
      <main className="flex-1 flex flex-col justify-center items-center px-4 pt-32 pb-12 z-10 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 rounded-full text-sky-400 text-sm font-medium tracking-wide mb-6">
            Intent-Driven Autonomous Agent
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Tell Food Agent AI what <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              you want.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Natural language commands turned into autonomous web actions. 
            We navigate Swiggy and Zomato for you, rank the deals, and stage the cart.
          </p>
        </motion.div>

        {user ? (
          <CommandInput />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-col items-center"
          >
            <button 
              onClick={openAuthModal}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:scale-105 active:scale-95"
            >
              Sign In to Activate AI
            </button>
            <p className="mt-4 text-sm text-slate-500 max-w-sm text-center">
              Create an account to securely save your dietary constraints, delivery locations, and favorite foods.
            </p>
          </motion.div>
        )}

        {errorMessage && (
          <div className="mt-8 text-red-400 bg-red-400/10 border border-red-400/20 px-6 py-4 rounded-xl text-center w-full max-w-2xl">
            {errorMessage}
          </div>
        )}

        {agentStatus === 'complete' && currentResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 w-full"
          >
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">AI Deal Comparison</h2>
                <p className="text-slate-400 text-sm mt-1">Ranked by True Price = Base + Delivery − Discount</p>
              </div>
              <div className="flex items-center gap-3">
                {swiggyResults.length > 0 && (
                  <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400">
                    <Flame className="w-3.5 h-3.5" /> Swiggy: {swiggyResults.length} deals
                  </span>
                )}
                {zomatoResults.length > 0 && (
                  <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    <Zap className="w-3.5 h-3.5" /> Zomato: {zomatoResults.length} deals
                  </span>
                )}
              </div>
            </div>

            {/* Winner Banner */}
            {bestDeal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl px-6 py-4 flex items-center gap-4"
              >
                <Trophy className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 font-bold text-sm uppercase tracking-wide">🤖 AI Recommended Best Deal</p>
                  <p className="text-white font-semibold text-lg">
                    {bestDeal.item_name} 
                    <span className="text-slate-400 font-normal text-sm ml-2">at {bestDeal.restaurant_name} on {bestDeal.platform}</span>
                  </p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    You pay: <span className="text-sky-400 font-bold">₹{bestDeal.true_price > 0 ? bestDeal.true_price : bestDeal.price}</span>
                    {bestDeal.discount > 0 && <span className="text-green-400 ml-3">• Saves ₹{bestDeal.discount}</span>}
                    {bestDeal.delivery_fee === 0 && <span className="text-green-400 ml-3">• Free Delivery</span>}
                    {bestDeal.rating > 0 && <span className="text-yellow-400 ml-3">• ⭐ {bestDeal.rating} rated</span>}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Swiggy vs Zomato side-by-side, or single column if only one platform */}
            {swiggyResults.length > 0 && zomatoResults.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-orange-500/20">
                    <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                    <h3 className="text-lg font-bold text-orange-400">Swiggy</h3>
                  </div>
                  <div className="space-y-4">
                    {swiggyResults.map((item, i) => (
                      <ResultCard key={`s-${i}`} item={item} index={currentResults.indexOf(item)} onApprove={handleApprove} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-500/20">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <h3 className="text-lg font-bold text-red-400">Zomato</h3>
                  </div>
                  <div className="space-y-4">
                    {zomatoResults.map((item, i) => (
                      <ResultCard key={`z-${i}`} item={item} index={currentResults.indexOf(item)} onApprove={handleApprove} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentResults.map((item, index) => (
                  <ResultCard key={index} item={item} index={index} onApprove={handleApprove} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      <ApprovalModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        selectedItem={selectedItem} 
      />
    </div>
  );
}
