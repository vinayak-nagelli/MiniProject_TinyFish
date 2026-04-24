import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CommandInput from '../components/CommandInput';
import ResultCard from '../components/ResultCard';
import ApprovalModal from '../components/ApprovalModal';
import useStore from '../store/useStore';
import Background3D from '../components/Background3D';

export default function Home() {
  const { user, openAuthModal, currentResults, activeIntent, agentStatus, errorMessage } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleApprove = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden flex flex-col">
      <Background3D />
      
      <main className="flex-1 flex flex-col justify-center items-center px-4 pt-32 pb-12 z-10 w-full max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 rounded-full text-sky-400 text-sm font-medium tracking-wide mb-6">
            Intent-Driven Autonomous Agent
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Tell LifePilot what <br className="hidden md:block"/>
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
            <div className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold">Top Deals Found</h2>
                <p className="text-slate-400 text-sm mt-1">Based on True Price (Price + Delivery - Discount)</p>
              </div>
              <div className="text-sm px-3 py-1 bg-slate-800 rounded-lg text-slate-300">
                Found {currentResults.length} options for "{activeIntent?.category}"
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentResults.map((item, index) => (
                <ResultCard key={index} item={item} index={index} onApprove={handleApprove} />
              ))}
            </div>
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
