import React, { useState } from 'react';
import { CheckCircle, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast'; // Import toast

const API_URL = import.meta.env.VITE_API_URL;

const DEPARTAMENTOS = [
  'Lima','Arequipa','Cusco','Callao','La Libertad','Piura','Lambayeque',
  'Junín','Ancash','Ica','Loreto','San Martín','Cajamarca','Puno',
  'Ayacucho','Huánuco','Amazonas','Ucayali','Tacna','Pasco','Moquegua',
  'Madre de Dios','Huancavelica','Apurímac','Tumbes'
];


const ReportForm = ({ onSuccess }) => {
  const [sending, setSending] = useState(false);
  const [fileList, setFileList] = useState([]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const edad = parseInt(form.edad.value, 10);

    if (edad && edad < 18) {
      toast.error("La edad debe ser de 18 años o mayor.");
      return;
    }

    setSending(true);

    // Manually construct FormData
    const formData = new FormData();
    formData.append('nombre', form.nombre.value);
    formData.append('edad', form.edad.value);
    formData.append('departamento', form.departamento.value);
    formData.append('ocupacion', form.ocupacion.value);
    formData.append('motivo', form.motivo.value);
    fileList.forEach(file => {
      formData.append('fotos', file);
    });

    try {
      const res = await fetch(API_URL, { method: 'POST', body: formData });
      if(res.ok) { 
        toast.success("¡Reporte enviado exitosamente!"); 
        onSuccess(); 
      } else {
        if (res.status === 429) {
          toast.error("Demasiados intentos. Solo puedes enviar un reporte cada 20 minutos.");
        } else {
          toast.error("Hubo un error al guardar. Intenta de nuevo.");
        }
      }
    } catch(e) { 
      console.error(e);
      toast.error("Error de conexión con el servidor."); 
    }
    setSending(false);
  };

  const handleFileChange = (e) => {
    let files = Array.from(e.target.files || []);
    if (files.length > 2) {
      toast.error("Puedes subir un máximo de 2 fotos.");
      files = files.slice(0, 2);
    }
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
            <input name="edad" type="number" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-red-500 transition-colors placeholder:text-slate-700" placeholder="18+" />
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
          <input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
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
                 <p className="text-xs text-slate-600 mt-1">Fotos, Capturas (Opcional, Máx. 2)</p>
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

export default ReportForm;