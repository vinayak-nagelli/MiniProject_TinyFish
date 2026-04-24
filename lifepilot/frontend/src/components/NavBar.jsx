import React from 'react';
import { motion } from 'framer-motion';
import { Bot, LogIn, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';

const NavBar = () => {
  const { user, openAuthModal, logout } = useStore();
  return (
    <nav className="w-full flex items-center justify-between p-6 bg-transparent z-50 absolute top-0 left-0">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-brand-primary p-2 rounded-lg">
          <Bot className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">FoodAgent<span className="text-sky-400">AI</span></span>
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-300 hidden sm:block">
              {user.email}
            </span>
            <button 
              onClick={logout}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center gap-2"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={openAuthModal}
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)] flex items-center gap-2"
          >
            <LogIn size={16} />
            Sign In
          </button>
        )}
        <Link to="/profile">
          <div className="bg-slate-800/50 p-2 rounded-full border border-slate-700/50 backdrop-blur-sm cursor-pointer hover:bg-slate-700/50 transition-colors">
            <User className="text-slate-400 w-5 h-5" />
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
