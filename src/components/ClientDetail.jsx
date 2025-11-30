import React from 'react';
import { Image as ImageIcon, ArrowLeft, MapPin, User, Calendar, FileText, AlertTriangle } from 'lucide-react';
import Badge from './Badge'; // Assuming Badge is in the same components directory


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

export default ClientDetail;