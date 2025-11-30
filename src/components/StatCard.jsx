import React from 'react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg ${color === 'red' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
        <Icon size={16} />
      </div>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-black text-white truncate">{value}</div>
  </div>
);

export default StatCard;