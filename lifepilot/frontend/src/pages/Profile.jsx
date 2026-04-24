import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Coffee, Flame, Store, Check, Plus, Trash2, ShieldAlert, X } from 'lucide-react';
import useStore from '../store/useStore';
import { fetchUserProfile, updateUserProfile } from '../services/api';

const Profile = () => {
  const { user, setUser } = useStore();
  const [activeTab, setActiveTab] = useState('diet');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [formData, setFormData] = useState({
    diet: 'veg',
    allergies: [],
    spice_tolerance: 'Medium',
    saved_locations: [],
    default_budget_inr: 300,
    favorite_dishes: [],
    preferred_platforms: [],
  });

  // Temporary inputs for arrays
  const [newAllergy, setNewAllergy] = useState('');
  const [newDish, setNewDish] = useState('');
  const [newLocation, setNewLocation] = useState({ name: '', address: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        diet: user.diet || 'veg',
        allergies: user.allergies || [],
        spice_tolerance: user.spice_tolerance || 'Medium',
        saved_locations: user.saved_locations || [],
        default_budget_inr: user.default_budget_inr || 300,
        favorite_dishes: user.favorite_dishes || [],
        preferred_platforms: user.preferred_platforms || [],
      });
    } else {
      const loadProfile = async () => {
        try {
          const profile = await fetchUserProfile();
          setUser(profile);
        } catch (e) {
          console.error("Could not load profile", e);
        }
      };
      loadProfile();
    }
  }, [user, setUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser.profile);
      setSaveMessage('Profile saved successfully! TinyFish will now use these constraints.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItem = (field, value, setter) => {
    if (!value.trim()) return;
    setFormData({ ...formData, [field]: [...formData[field], value.trim()] });
    setter('');
  };

  const removeArrayItem = (field, index) => {
    const newArr = [...formData[field]];
    newArr.splice(index, 1);
    setFormData({ ...formData, [field]: newArr });
  };

  const addLocation = () => {
    if (!newLocation.name || !newLocation.address) return;
    setFormData({
      ...formData,
      saved_locations: [...formData.saved_locations, { ...newLocation, is_default: formData.saved_locations.length === 0 }]
    });
    setNewLocation({ name: '', address: '' });
  };

  const togglePlatform = (platform) => {
    const current = formData.preferred_platforms;
    if (current.includes(platform)) {
      setFormData({ ...formData, preferred_platforms: current.filter(p => p !== platform) });
    } else {
      setFormData({ ...formData, preferred_platforms: [...current, platform] });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center pt-24">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-brand-primary rounded-full" />
          <p className="text-slate-400">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-24 px-4 pb-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                <User className="text-brand-primary" size={36} />
                AI Training Constraints
              </h1>
              <p className="text-slate-400 max-w-2xl text-lg">
                Your personalized context layer. The LifePilot agent will strictly adhere to these rules 
                when autonomously parsing your goals and navigating the web.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm text-slate-500 mb-1">Logged in as</div>
              <div className="font-mono text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-lg">{user.email}</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-3">
            {[
              { id: 'diet', label: 'Diet & Spice', icon: Flame },
              { id: 'favorites', label: 'Foods & Allergies', icon: Coffee },
              { id: 'locations', label: 'Delivery Locations', icon: MapPin },
              { id: 'platforms', label: 'Platform Preferences', icon: Store }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium text-left ${
                  activeTab === tab.id 
                    ? 'bg-brand-primary text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] border border-brand-primary/50' 
                    : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/80 hover:text-white border border-slate-800/50'
                }`}
              >
                <tab.icon size={20} className={activeTab === tab.id ? "text-white" : "text-brand-primary"} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSave} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
              
              {/* --- DIET & SPICE TAB --- */}
              {activeTab === 'diet' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                      <Flame className="text-orange-500" size={20}/> Dietary Priority
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['veg', 'non-veg', 'vegan'].map((dietStr) => (
                        <label 
                          key={dietStr} 
                          className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all ${
                            formData.diet === dietStr 
                              ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-[0_0_15px_rgba(14,165,233,0.2)]' 
                              : 'border-slate-800 hover:border-slate-600 text-slate-400 bg-slate-900/50'
                          }`}
                        >
                          <input type="radio" name="diet" className="hidden" checked={formData.diet === dietStr} onChange={() => setFormData({...formData, diet: dietStr})} />
                          <span className="capitalize font-bold text-lg">{dietStr}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Spice Tolerance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['Mild', 'Medium', 'Spicy'].map((spice) => (
                        <label 
                          key={spice} 
                          className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all ${
                            formData.spice_tolerance === spice 
                              ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                              : 'border-slate-800 hover:border-slate-600 text-slate-400 bg-slate-900/50'
                          }`}
                        >
                          <input type="radio" name="spice" className="hidden" checked={formData.spice_tolerance === spice} onChange={() => setFormData({...formData, spice_tolerance: spice})} />
                          <span className="font-bold text-lg">{spice}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Default Maximum Budget (₹)</h3>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input 
                        type="number" 
                        value={formData.default_budget_inr}
                        onChange={(e) => setFormData({...formData, default_budget_inr: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl pl-10 pr-4 py-4 text-xl font-bold text-white focus:outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-3">The AI agent will strictly discard deals above this price unless you explicitly bypass it in your prompt.</p>
                  </div>
                </div>
              )}

              {/* --- FOODS & ALLERGIES TAB --- */}
              {activeTab === 'favorites' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                      <ShieldAlert className="text-red-400" size={20}/> Strict Allergies / Avoid
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">The agent will read item descriptions and automatically skip items containing these keywords.</p>
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="text" value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="e.g. Peanuts, Gluten..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('allergies', newAllergy, setNewAllergy))}
                        className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                      />
                      <button type="button" onClick={() => addArrayItem('allergies', newAllergy, setNewAllergy)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-xl transition-colors">
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergies.map((item, idx) => (
                        <div key={idx} className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                          {item}
                          <button type="button" onClick={() => removeArrayItem('allergies', idx)} className="hover:text-red-300"><X size={14}/></button>
                        </div>
                      ))}
                      {formData.allergies.length === 0 && <span className="text-slate-600 text-sm italic">No allergies saved.</span>}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-8">
                    <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                      <Coffee className="text-amber-400" size={20}/> Favorite Dishes
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">If you ask for "something good", the agent will prioritize searching for these items first.</p>
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="text" value={newDish} onChange={(e) => setNewDish(e.target.value)} placeholder="e.g. Chicken Biryani, Margerita Pizza..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('favorite_dishes', newDish, setNewDish))}
                        className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <button type="button" onClick={() => addArrayItem('favorite_dishes', newDish, setNewDish)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-xl transition-colors">
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.favorite_dishes.map((item, idx) => (
                        <div key={idx} className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                          {item}
                          <button type="button" onClick={() => removeArrayItem('favorite_dishes', idx)} className="hover:text-amber-300"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- LOCATIONS TAB --- */}
              {activeTab === 'locations' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-2 text-white">Saved Delivery Addresses</h3>
                  <p className="text-sm text-slate-400 mb-6">TinyFish needs precise addresses to bypass location-selection popups and calculate exact delivery fees.</p>
                  
                  <div className="grid gap-4 mb-8">
                    {formData.saved_locations.map((loc, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex justify-between items-center group hover:border-brand-primary/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <MapPin className="text-brand-primary mt-1" size={20} />
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {loc.name} 
                              {loc.is_default && <span className="bg-brand-primary/20 text-brand-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>}
                            </div>
                            <div className="text-slate-400 text-sm mt-1">{loc.address}</div>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeArrayItem('saved_locations', idx)} className="text-slate-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {formData.saved_locations.length === 0 && (
                      <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                        No locations saved yet.
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                    <h4 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Add New Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input 
                        type="text" placeholder="Label (e.g. Home, Office)" value={newLocation.name} onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary text-sm"
                      />
                      <input 
                        type="text" placeholder="Full exact address with Pincode" value={newLocation.address} onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                        className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                      />
                    </div>
                    <button type="button" onClick={addLocation} className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      + Add Location
                    </button>
                  </div>
                </div>
              )}

              {/* --- PLATFORMS TAB --- */}
              {activeTab === 'platforms' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-2 text-white">Platform Preferences</h3>
                  <p className="text-sm text-slate-400 mb-8">If you have premium memberships (like Swiggy One or Zomato Gold), select them here so the AI agent prioritizes them to save you money.</p>
                  
                  <div className="grid grid-cols-2 gap-6 max-w-lg">
                    {['Swiggy', 'Zomato'].map(platform => {
                      const isSelected = formData.preferred_platforms.includes(platform);
                      return (
                        <div 
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`cursor-pointer p-6 rounded-3xl border-2 text-center transition-all ${
                            isSelected 
                              ? 'border-brand-primary bg-brand-primary/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]' 
                              : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                          }`}
                        >
                          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isSelected ? 'bg-brand-primary/20' : 'bg-slate-800'}`}>
                            <Store className={isSelected ? 'text-brand-primary' : 'text-slate-500'} size={28} />
                          </div>
                          <h4 className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>{platform}</h4>
                          {isSelected && <span className="text-xs text-brand-primary mt-2 block font-medium">Prioritized</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* --- FOOTER SAVE BUTTON --- */}
              <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <AnimatePresence>
                  {saveMessage && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                      <Check size={16} /> {saveMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="ml-auto bg-brand-primary hover:bg-brand-primary/90 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</span>
                  ) : (
                    <><Check size={22} /> Save AI Constraints</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
