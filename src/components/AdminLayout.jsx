import React, { useState } from 'react';
import { Lock, LogOut, Trash2, Edit2, Shield } from 'lucide-react';
import toast from 'react-hot-toast'; // Import toast
import Badge from './Badge';

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const AdminLayout = ({ goBack }) => {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const login = (e) => { e.preventDefault(); if(pass === ADMIN_PASSWORD) { setAuth(true); load(); } else toast.error("Contraseña incorrecta"); };
  const load = () => { setLoading(true); fetch(API_URL).then(r=>r.json()).then(d => { setList(d); setLoading(false); }); };
  const del = async (id) => { if(!confirm("¿Borrar?")) return; const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: {'x-admin-token': ADMIN_PASSWORD}}); if(res.ok) { toast.success("Reporte eliminado exitosamente."); load(); } else { toast.error("Error al eliminar el reporte."); } };
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    if(!confirm("¿Guardar cambios?")) return;
    try {
      const res = await fetch(`${API_URL}/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_PASSWORD }, body: JSON.stringify(editingItem) });
      if(res.ok) { setEditingItem(null); load(); toast.success("Reporte actualizado exitosamente."); } else { toast.error("Error al actualizar el reporte."); }
    } catch(err) { toast.error("Error de conexión con el servidor."); }
  };

  const filteredList = list.filter(item => !adminSearch || item.nombre_completo.toLowerCase().includes(adminSearch.toLowerCase()));

  if(!auth) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-sm text-center">
        <Lock className="mx-auto text-red-500 mb-4" size={32}/>
        <h2 className="text-xl font-bold text-white mb-6">Acceso Admin</h2>
        <form onSubmit={login} className="space-y-4">
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-center text-xl focus:border-red-500 outline-none" placeholder="••••" autoFocus />
          <button className="w-full bg-red-600 text-white py-4 rounded-xl font-bold">Entrar</button>
        </form>
        <button onClick={goBack} className="mt-6 text-slate-500 hover:text-white text-sm">Volver a la Web</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-200 font-sans">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Shield size={20} /></div><h1 className="font-bold text-lg text-white">Admin Panel</h1></div>
        <button onClick={() => setAuth(false)} className="p-2 hover:bg-white/10 rounded-lg text-red-400"><LogOut size={20}/></button>
      </nav>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
           <h2 className="font-bold text-xl text-white">Registros ({list.length})</h2>
           <input value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Buscar..." className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white focus:border-blue-500 outline-none"/>
        </div>
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase text-xs"><tr><th className="p-4">Usuario</th><th className="p-4">Zona</th><th className="p-4 text-right">Acción</th></tr></thead>
            <tbody className="divide-y divide-slate-800">
              {filteredList.map(i => (
                <tr key={i.id} className="hover:bg-slate-800">
                  <td className="p-4"><div className="font-bold text-white">{i.nombre_completo}</div><div className="text-xs text-slate-500">#{i.id}</div></td>
                  <td className="p-4"><Badge>{i.departamento}</Badge></td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => setEditingItem(i)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit2 size={18}/></button>
                    <button onClick={() => del(i.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal de Edición (Simplificado) */}
      {editingItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Editar #{editingItem.id}</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input value={editingItem.nombre_completo} onChange={e=>setEditingItem({...editingItem, nombre_completo: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"/>
              <textarea rows="4" value={editingItem.motivo} onChange={e=>setEditingItem({...editingItem, motivo: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"></textarea>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-2 text-slate-400">Cancelar</button><button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;