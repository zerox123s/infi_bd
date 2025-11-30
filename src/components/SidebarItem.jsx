import React from 'react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export default SidebarItem;