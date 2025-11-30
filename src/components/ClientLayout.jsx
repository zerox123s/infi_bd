import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Shield, Lock, AlertTriangle, Image as ImageIcon,
  MapPin, ChevronRight, PlusCircle, Home, Users, Briefcase, TrendingUp, Calendar, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

import Badge from './Badge';
import StatCard from './StatCard';
import SidebarItem from './SidebarItem';
import NavIcon from './NavIcon';
import ReportForm from './ReportForm';
import ClientDetail from './ClientDetail';

const API_URL = import.meta.env.VITE_API_URL;
const DEPARTAMENTOS = [
  'Lima','Arequipa','Cusco','Callao','La Libertad','Piura','Lambayeque',
  'Junín','Ancash','Ica','Loreto','San Martín','Cajamarca','Puno',
  'Ayacucho','Huánuco','Amazonas','Ucayali','Tacna','Pasco','Moquegua',
  'Madre de Dios','Huancavelica','Apurímac','Tumbes'
];

const LatestReportItem = ({ item, onClick }) => (
    <div onClick={onClick} className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex items-center gap-4 hover:bg-slate-800 transition-colors cursor-pointer">
        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
        {item.fotos && item.fotos.length > 0 ? (
            <img src={item.fotos[0]} alt={item.nombre_completo} className="w-full h-full object-cover rounded-lg" />
        ) : (
            <ImageIcon className="text-slate-600" size={24} />
        )}
        </div>
        <div className="flex-1 overflow-hidden">
            <h4 className="font-bold text-white truncate">{item.nombre_completo}</h4>
            <p className="text-xs text-slate-400">{item.departamento} • {new Date(item.fecha).toLocaleDateString()}</p>
        </div>
        <ChevronRight className="text-slate-600" size={20} />
    </div>
);

const ClientLayout = ({ navigateToAdmin }) => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [view, setView] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDep, setSelectedDep] = useState("Todos");
  const [selectedItem, setSelectedItem] = useState(null);

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    fetch(`${API_URL}?page=${pageNum}&limit=20`)
      .then(res => res.json())
      .then(d => {
        setData(prevData => pageNum === 1 ? d.data : [...prevData, ...d.data]);
        setPage(d.pagina_actual);
        setTotalPages(d.total_paginas);
        setTotalRecords(d.total_registros);
      })
      .catch(err => {
        console.error(err);
        toast.error("Error al cargar los datos.");
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchData(page + 1);
    }
  };
  
  const refreshAndGoToExplore = () => {
    setData([]);
    setPage(1);
    fetchData(1);
    setView('explore');
    setSelectedDep('Todos');
  }

  useEffect(() => {
    fetchData(1);
  }, []);

  const openDetail = (item) => {
    setSelectedItem(item);
    setView('detail');
    window.scrollTo(0,0);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm && selectedDep === 'Todos') {
      return data;
    }
    return data.filter(item => {
      const matchesSearch = !searchTerm || item.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase());
      const hasDep = item.departamento && item.departamento.trim() !== '';
      const matchesDep = selectedDep === "Todos" || (hasDep && item.departamento === selectedDep);
      return matchesSearch && matchesDep;
    });
  }, [data, searchTerm, selectedDep]);

  const stats = useMemo(() => {
    const latestReports = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
    
    if (data.length === 0 && totalRecords === 0) {
      return { total: 0, topName: 'N/A', avgAge: 'N/A', topOcupacion: 'N/A', recentCount: 0, topPerson: 'N/A', latestReports: [] };
    }
    
    const deps = data.reduce((acc, curr) => {
      if (curr.departamento) acc[curr.departamento] = (acc[curr.departamento] || 0) + 1;
      return acc;
    }, {});
    const topDep = Object.entries(deps).sort((a,b) => b[1] - a[1])[0];

    const ages = data.map(d => d.edad).filter(d => d && d > 0);
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a,b) => a + b, 0) / ages.length) : 'N/A';

    const ocupaciones = data.reduce((acc, curr) => {
      if (curr.ocupacion) acc[curr.ocupacion] = (acc[curr.ocupacion] || 0) + 1;
      return acc;
    }, {});
    const topOcupacion = Object.entries(ocupaciones).sort((a,b) => b[1] - a[1])[0];
    
    const people = data.reduce((acc, curr) => {
      if (curr.nombre_completo) acc[curr.nombre_completo] = (acc[curr.nombre_completo] || 0) + 1;
      return acc;
    }, {});
    const topPerson = Object.entries(people).sort((a,b) => b[1] - a[1])[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = data.filter(d => new Date(d.fecha) > sevenDaysAgo).length;
    
    return { 
      total: totalRecords, 
      topName: topDep?.[0] || 'N/A', 
      avgAge,
      topOcupacion: topOcupacion?.[0] || 'N/A',
      recentCount,
      topPerson: topPerson?.[0] || 'N/A',
      latestReports
    };
  }, [data, totalRecords]);

  if (view === 'detail') {
    return <ClientDetail item={selectedItem} onBack={() => setView('explore')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 md:pb-0">
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

      <header className="md:hidden fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-40 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2"><Shield className="text-red-500" size={20} /><span className="font-bold text-lg text-white">Infieles<span className="text-red-500">App</span></span></div>
        <button onClick={navigateToAdmin} className="text-slate-400"><Lock size={18}/></button>
      </header>

      <main className="md:ml-64 pt-20 md:pt-10 px-4 md:px-8 max-w-7xl mx-auto">
        
        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in pb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900 to-slate-900 border border-red-900/30 p-8 md:p-12">
               <div className="relative z-10">
                 <Badge color="red">Base de datos actualizada</Badge>
                 <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-2">La verdad duele, <br/>pero libera.</h2>
                 <p className="text-red-200/80 max-w-lg text-lg mb-6">Consulta la base de datos con {totalRecords > 0 ? `${totalRecords} registros` : 'cientos de registros'}.</p>
                 <button onClick={() => setView('explore')} className="bg-white text-red-900 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center gap-2">Buscar ahora <ChevronRight size={18}/></button>
               </div>
               <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Total Registros" value={loading ? "..." : stats.total} icon={Users} color="blue" />
              <StatCard label="Promedio de Edad" value={loading ? "..." : stats.avgAge} icon={TrendingUp} color="red" />
              <StatCard label="Zona Más Activa" value={loading ? "..." : stats.topName} icon={MapPin} color="blue" />
              <StatCard label="Ocupación Común" value={loading ? "..." : stats.topOcupacion} icon={Briefcase} color="red" />
              <StatCard label="Más Reportado" value={loading ? "..." : stats.topPerson} icon={Award} color="blue" />
              <StatCard label="Reportes (7d)" value={loading ? "..." : stats.recentCount} icon={Calendar} color="red" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Últimos Reportes</h3>
                <div className="space-y-3">
                    {loading ? (
                        <p className="text-slate-500">Cargando reportes...</p>
                    ) : (
                        stats.latestReports.map(item => (
                            <LatestReportItem key={item.id} item={item} onClick={() => openDetail(item)} />
                        ))
                    )}
                </div>
            </div>
          </div>
        )}

        {view === 'explore' && (
          <div className="space-y-6 animate-in fade-in pb-10">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 md:top-0 z-20 bg-slate-950/90 py-4 backdrop-blur-sm">
              <div><h2 className="text-2xl font-bold text-white">Explorar Casos</h2><p className="text-slate-400 text-sm">Mostrando {data.length} de {totalRecords} registros.</p></div>
              <div className="flex gap-2 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                   <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                   <input type="text" placeholder="Buscar en los registros cargados..." className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-red-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
              <>
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
                        <p className="text-sm text-slate-400 mb-4">{item.ocupacion || 'Ocupación desconocida'} • {item.edad || 'N/A'} años</p>
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-sm text-slate-400 italic line-clamp-3 mb-4 flex-1">"{item.motivo}"</div>
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium uppercase tracking-wider pt-4 border-t border-slate-800">
                          <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-red-500"/> Reportado</span>
                          <span className="text-blue-400 group-hover:underline">Leer Completo &rarr;</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {page < totalPages && (
                  <div className="text-center pt-8">
                    <button onClick={handleLoadMore} disabled={loadingMore} className="bg-red-600 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                      {loadingMore ? 'Cargando...' : 'Cargar Más'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === 'reportar' && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 pb-10">
             <button onClick={() => setView('home')} className="mb-4 text-slate-400 hover:text-white flex items-center gap-2 text-sm">&larr; Cancelar</button>
             <ReportForm onSuccess={refreshAndGoToExplore} />
          </div>
        )}
      </main>

      <div className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50 safe-area-pb">
        <NavIcon icon={Home} label="Inicio" active={view === 'home'} onClick={() => setView('home')} />
        <NavIcon icon={Search} label="Explorar" active={view === 'explore'} onClick={() => setView('explore')} />
        <NavIcon icon={PlusCircle} label="Reportar" active={view === 'reportar'} onClick={() => setView('reportar')} />
      </div>
    </div>
  );
};

export default ClientLayout;