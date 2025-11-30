import React from 'react';

const NavIcon = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center p-2 rounded-xl transition-all ${active ? 'text-red-500 bg-red-500/10' : 'text-slate-500'}`}>
    <Icon size={24} strokeWidth={active ? 3 : 2} />
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

export default NavIcon;