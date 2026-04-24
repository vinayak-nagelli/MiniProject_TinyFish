import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Loader2, Bot } from 'lucide-react';
import useStore from '../store/useStore';
import { parseIntent, runAgent } from '../services/api';

export default function CommandInput() {
  const [input, setInput] = useState('');
  const { 
    agentStatus, 
    setAgentStatus, 
    setActiveIntent, 
    setCurrentResults, 
    setErrorMessage,
    resetState
  } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || agentStatus === 'running' || agentStatus === 'parsing') return;
    
    resetState();
    setAgentStatus('parsing');
    
    try {
      // 1. Parse Intent
      const intent = await parseIntent(input);
      setActiveIntent(intent);
      
      // 2. Run Agent
      setAgentStatus('running');
      const results = await runAgent(intent);
      
      setCurrentResults(results);
      setAgentStatus('complete');
    } catch (error) {
      setErrorMessage("Failed to process command. Please ensure backend is running.");
      setAgentStatus('error');
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-3xl mx-auto z-10"
    >
      <div className="relative flex items-center bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl transition-all focus-within:border-sky-500/50 focus-within:ring-4 focus-within:ring-sky-500/10">
        <div className="pl-4 pr-2">
          {agentStatus === 'parsing' || agentStatus === 'running' ? (
            <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
          ) : (
            <Search className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Find the best veg biryani under ₹200 near me..."
          className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-500 py-4 px-2"
          disabled={agentStatus === 'parsing' || agentStatus === 'running'}
        />
        <button 
          type="submit"
          disabled={!input.trim() || agentStatus === 'parsing' || agentStatus === 'running'}
          className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-sky-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Pilot</span>
        </button>
      </div>
      
      {agentStatus === 'parsing' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-8 left-6 text-sm text-sky-400 flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> Analyzing intent with LLaMA 70B...
        </motion.p>
      )}
      {agentStatus === 'running' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-8 left-6 text-sm text-indigo-400 flex items-center gap-2">
          <Bot className="w-3 h-3" /> Autonomous agents hunting on Swiggy & Zomato...
        </motion.p>
      )}
    </motion.form>
  );
}
