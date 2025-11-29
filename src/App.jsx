import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Shield, Lock, LogOut, Trash2, Edit2, 
  BarChart3, Users, AlertTriangle, Image as ImageIcon,
  MapPin, ChevronRight, X, PlusCircle, Home, FileText, 
  Save, CheckCircle, ArrowLeft, Calendar, User, TrendingUp
} from 'lucide-react';



const API_URL = import.meta.env.VITE_API_URL || "https://infieless.pythonanywhere.com/api/reportes";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "contraseña_super_secreta_123"; 

const DEPARTAMENTOS = [
  'Lima','Arequipa','Cusco','Callao','La Libertad','Piura','Lambayeque',
  'Junín','Ancash','Ica','Loreto','San Martín','Cajamarca','Puno',
  'Ayacucho','Huánuco','Amazonas','Ucayali','Tacna','Pasco','Moquegua',
  'Madre de Dios','Huancavelica','Apurímac','Tumbes'
];


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

const NavIcon = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center p-2 rounded-xl transition-all ${active ? 'text-red-500 bg-red-500/10' : 'text-slate-500'}`}>
    <Icon size={24} strokeWidth={active ? 3 : 2} />
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

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


const ClientDetail = ({ item, onBack }) => {
  if (!item) return null;

  return (
    <div className="animate-in slide-in-from-right duration-300 min-h-screen bg-slate-950 pb-20">
      {/* Navbar Detalle Flotante */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-white truncate">Reporte #{item.id}</h2>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Izquierda: FOTOS */}
        <div className="space-y-4">
          {item.fotos && item.fotos.length > 0 ? (
            <div className="space-y-6">
              {item.fotos.map((foto, index) => (
                <div key={index} className="group relative bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-white z-10 border border-white/10">
                    Evidencia {index + 1}
                  </div>
                  <img 
                    src={foto} 
                    alt={`Evidencia ${index + 1}`} 
                    className="w-full h-auto object-contain max-h-[80vh] mx-auto"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-video bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-600 p-10">
              <ImageIcon size={64} className="mb-4 opacity-50"/>
              <p className="text-lg font-medium">No se adjuntaron evidencias visuales.</p>
            </div>
          )}
        </div>

        {/* Columna Derecha: DATOS */}
        <div className="lg:sticky lg:top-24 h-fit space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Badge color="red">Reporte Confidencial</Badge>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mt-2 mb-2">{item.nombre_completo}</h1>
                <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={14}/> {item.departamento}</span>
                  <span>•</span>
                  <span>{item.ocupacion || "Ocupación desconocida"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-800 border-b mb-6">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Edad Reportada</span>
                <span className="text-xl text-white font-bold flex items-center gap-2">
                  <User size={20} className="text-slate-600"/> 
                  {item.edad ? `${item.edad} años` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Fecha Registro</span>
                <span className="text-xl text-white font-bold flex items-center gap-2">
                  <Calendar size={20} className="text-slate-600"/> 
                  {new Date(item.fecha).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-slate-500 font-bold uppercase flex items-center gap-2">
                <FileText size={16}/> Testimonio / Motivo
              </span>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
                {item.motivo}
              </div>
            </div>
          </div>

          <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-2xl flex gap-4 items-start">
            <AlertTriangle className="text-red-500 shrink-0" size={24}/>
            <div>
              <h4 className="font-bold text-red-400">Descargo de Responsabilidad</h4>
              <p className="text-xs text-red-200/60 mt-1 leading-relaxed">
                Esta información es subida por usuarios de la comunidad de forma anónima. La plataforma no verifica la veracidad de los hechos descritos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const ReportForm = ({ onSuccess }) => {
  const [sending, setSending] = useState(false);
  const [fileList, setFileList] = useState([]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const formData = new FormData(e.target);
    try {
      const res = await fetch(API_URL, { method: 'POST', body: formData });
      if(res.ok) { 
        alert("¡Reporte enviado exitosamente!"); 
        onSuccess(); 
      } else { 
        alert("Hubo un error al guardar. Intenta de nuevo.");
      }
    } catch(e) { 
      console.error(e);
      alert("Error de conexión con el servidor."); 
    }
    setSending(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFileList(files);
  };

  return (
    <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">Nuevo Reporte</h2>
        <p className="text-slate-500 text-sm mt-1">Tu identidad está 100% protegida.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Nombre Completo</label>
          <input required name="nombre" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 transition-colors placeholder:text-slate-700" placeholder="Ej: Juan Pérez" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Edad Aprox.</label>
            <input name="edad" type="number" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 transition-colors placeholder:text-slate-700" placeholder="25" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Zona</label>
            <select required name="departamento" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer">
              <option value="">Selecciona...</option>
              {DEPARTAMENTOS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Ocupación</label>
          <input name="ocupacion" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 transition-colors placeholder:text-slate-700" placeholder="Ej: Ingeniero, Doctor..." />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Historia</label>
          <textarea required name="motivo" rows="5" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 resize-none transition-colors placeholder:text-slate-700" placeholder="Cuéntanos los detalles..."></textarea>
        </div>
        
        <div className={`border-2 border-dashed rounded-xl p-6 text-center relative group transition-all cursor-pointer ${fileList.length > 0 ? 'border-green-500/50 bg-green-900/10' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}`}>
          <input type="file" name="fotos" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
          <div className="pointer-events-none relative z-0">
             {fileList.length > 0 ? (
               <div className="flex flex-col items-center animate-in fade-in zoom-in">
                 <div className="bg-green-500/20 p-3 rounded-full mb-2"><CheckCircle className="text-green-500" size={24}/></div>
                 <p className="text-green-400 font-bold">{fileList.length} Foto(s) Seleccionada(s)</p>
                 <p className="text-[10px] text-slate-500 mt-2 font-medium">Toca para cambiar</p>
               </div>
             ) : (
               <div className="flex flex-col items-center">
                 <div className="bg-slate-800 p-3 rounded-full mb-3 text-slate-400 group-hover:text-white transition-colors"><ImageIcon size={24}/></div>
                 <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Subir Evidencias</p>
                 <p className="text-xs text-slate-600 mt-1">Fotos, Capturas (Opcional)</p>
               </div>
             )}
          </div>
        </div>

        <button disabled={sending} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
          {sending ? "Enviando..." : "Publicar Reporte"}
        </button>
      </form>
    </div>
  );
};


const ClientLayout = ({ navigateToAdmin }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home"); // home, explore, reportar, detail
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDep, setSelectedDep] = useState("Todos");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = () => {
    setLoading(true);
    fetch(API_URL).then(res => res.json()).then(d => { setData(d); setLoading(false); }).catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const openDetail = (item) => {
    setSelectedItem(item);
    setView('detail');
    window.scrollTo(0,0);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = !searchTerm || item.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDep = selectedDep === "Todos" || item.departamento === selectedDep;
      return matchesSearch && matchesDep;
    });
  }, [data, searchTerm, selectedDep]);

  const stats = useMemo(() => {
    const total = data.length;
    const deps = data.reduce((acc, curr) => { acc[curr.departamento] = (acc[curr.departamento] || 0) + 1; return acc; }, {});
    const top = Object.entries(deps).sort((a,b) => b[1] - a[1])[0];
    return { total, topName: top?.[0] || 'N/A', topCount: top?.[1] || 0 };
  }, [data]);

  // Si estamos en detalle, mostramos la vista de detalle completa
  if (view === 'detail') {
    return <ClientDetail item={selectedItem} onBack={() => setView('explore')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 md:pb-0">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-900/50"><Shield className="text-white" size={24} /></div>
          <div><h1 className="font-bold text-xl text-white">Infieles<span className="text-red-500">App</span></h1><span className="text-[10px] text-slate-500 uppercase font-bold">Confidencial</span></div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem icon={Home} label="Inicio" active={view === 'home'} onClick={() => setView('home')} />
          <SidebarItem icon={Search} label="Explorar Lista" active={view === 'explore'} onClick={() => setView('explore')} />
          <SidebarItem icon={PlusCircle} label="Reportar Caso" active={view === 'reportar'} onClick={() => setView('reportar')} />
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={navigateToAdmin} className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors w-full p-2 rounded-lg hover:bg-slate-800">
             <Lock size={18} /><span className="text-sm font-medium">Acceso Admin</span>
           </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-40 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2"><Shield className="text-red-500" size={20} /><span className="font-bold text-lg text-white">Infieles<span className="text-red-500">App</span></span></div>
        <button onClick={navigateToAdmin} className="text-slate-400"><Lock size={18}/></button>
      </header>

      {/* CONTENIDO MAIN */}
      <main className="md:ml-64 pt-20 md:pt-10 px-4 md:px-8 max-w-7xl mx-auto">
        
        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900 to-slate-900 border border-red-900/30 p-8 md:p-12">
               <div className="relative z-10">
                 <Badge color="red">Base de datos actualizada</Badge>
                 <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-2">La verdad duele, <br/>pero libera.</h2>
                 <p className="text-red-200/80 max-w-lg text-lg mb-6">Consulta reportes anónimos o colabora.</p>
                 <button onClick={() => setView('explore')} className="bg-white text-red-900 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center gap-2">Buscar ahora <ChevronRight size={18}/></button>
               </div>
               <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Registros" value={loading ? "..." : stats.total} icon={Users} color="blue" />
              <StatCard label="Zona Más Activa" value={loading ? "..." : stats.topName} icon={MapPin} color="red" />
            </div>
          </div>
        )}

        {view === 'explore' && (
          <div className="space-y-6 animate-in fade-in pb-10">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 md:top-0 z-20 bg-slate-950/90 py-4 backdrop-blur-sm">
              <div><h2 className="text-2xl font-bold text-white">Explorar Casos</h2><p className="text-slate-400 text-sm">Busca por nombre o filtra por ubicación.</p></div>
              <div className="flex gap-2 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                   <input type="text" placeholder="Buscar nombre..." className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-red-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                 </div>
                 <select className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 outline-none cursor-pointer" value={selectedDep} onChange={e => setSelectedDep(e.target.value)}>
                   <option value="Todos">Todo el Perú</option>
                   {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-20 text-slate-500">Cargando...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map(item => (
                  <div key={item.id} onClick={() => openDetail(item)} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-2xl transition-all cursor-pointer relative flex flex-col h-full">
                    <div className="h-56 bg-slate-800 relative overflow-hidden">
                      {item.fotos?.length > 0 ? (
                        <img src={item.fotos[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600"><ImageIcon size={32} /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-4 right-4"><Badge color="red">{item.departamento}</Badge></div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400">{item.nombre_completo}</h3>
                      <p className="text-sm text-slate-400 mb-4">{item.ocupacion || 'Ocupación desconocida'} • {item.edad} años</p>
                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-sm text-slate-400 italic line-clamp-3 mb-4 flex-1">"{item.motivo}"</div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium uppercase tracking-wider pt-4 border-t border-slate-800">
                        <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-red-500"/> Reportado</span>
                        <span className="text-blue-400 group-hover:underline">Leer Completo &rarr;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'reportar' && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 pb-10">
             <button onClick={() => setView('home')} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2 text-sm">&larr; Cancelar</button>
             <ReportForm onSuccess={() => { setView('explore'); setSelectedDep('Todos'); fetchData(); }} />
          </div>
        )}
      </main>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50 safe-area-pb">
        <NavIcon icon={Home} label="Inicio" active={view === 'home'} onClick={() => setView('home')} />
        <NavIcon icon={Search} label="Explorar" active={view === 'explore'} onClick={() => setView('explore')} />
        <NavIcon icon={PlusCircle} label="Reportar" active={view === 'reportar'} onClick={() => setView('reportar')} />
      </div>
    </div>
  );
};

const AdminLayout = ({ goBack }) => {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const login = (e) => { e.preventDefault(); if(pass === ADMIN_PASSWORD) { setAuth(true); load(); } else alert("Contraseña incorrecta"); };
  const load = () => { setLoading(true); fetch(API_URL).then(r=>r.json()).then(d => { setList(d); setLoading(false); }); };
  const del = async (id) => { if(!confirm("¿Borrar?")) return; const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: {'x-admin-token': ADMIN_PASSWORD}}); if(res.ok) load(); };
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    if(!confirm("¿Guardar cambios?")) return;
    try {
      const res = await fetch(`${API_URL}/${editingItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_PASSWORD }, body: JSON.stringify(editingItem) });
      if(res.ok) { setEditingItem(null); load(); } else { alert("Error"); }
    } catch(err) { alert("Error de red"); }
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

// --- APP ROOT ---
export default function App() {
  const [app, setApp] = useState('client');
  return app === 'client' ? <ClientLayout navigateToAdmin={() => setApp('admin')} /> : <AdminLayout goBack={() => setApp('client')} />;
}