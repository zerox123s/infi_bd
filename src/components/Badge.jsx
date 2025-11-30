import React from 'react';

const Badge = ({ children, color = "slate" }) => {
  const styles = {
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    slate: "bg-slate-700/50 text-slate-300 border-slate-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[color] || styles.slate} backdrop-blur-md`}>
      {children}
    </span>
  );
};

export default Badge;
