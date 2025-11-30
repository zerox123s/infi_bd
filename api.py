from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix 
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import uuid

app = Flask(__name__)

# --- CORRECCIÓN IP PARA PYTHONANYWHERE ---
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

CORS(app)

# --- CONFIGURACIÓN LIMITADOR ---
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["2000 per day", "500 per hour"], 
    storage_uri="memory://"
)

# --- CONFIGURACIÓN LOCAL ---
UPLOAD_FOLDER = '/home/infieless/mysite/static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- BASE DE DATOS ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://infieless:170104%40Jose@infieless.mysql.pythonanywhere-services.com/infieless$infieles_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_recycle': 280, 'pool_pre_ping': True}

ADMIN_SECRET = "admin170104"

db = SQLAlchemy(app)

# --- MODELOS ---
class Reporte(db.Model):
    __tablename__ = 'reportes'
    id = db.Column(db.Integer, primary_key=True)
    nombre_completo = db.Column(db.String(100))
    edad = db.Column(db.Integer)
    departamento = db.Column(db.String(50))
    ocupacion = db.Column(db.String(100))
    motivo = db.Column(db.Text)
    fecha_registro = db.Column(db.DateTime, server_default=db.func.now())
    evidencias = db.relationship('Evidencia', backref='reporte', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre_completo': self.nombre_completo,
            'edad': self.edad,
            'departamento': self.departamento,
            'ocupacion': self.ocupacion,
            'motivo': self.motivo,
            'fecha': self.fecha_registro,
            'fotos': [e.filename for e in self.evidencias] 
        }

class Evidencia(db.Model):
    __tablename__ = 'evidencias'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes.id'), nullable=False)
    filename = db.Column(db.String(255)) 

# --- HELPER ---
def es_admin():
    return request.headers.get('x-admin-token') == ADMIN_SECRET

# --- ENDPOINTS ---

@app.route('/')
def home():
    return jsonify({'mensaje': 'API Local funcionando', 'status': 'ok'}), 200

# === ENDPOINT MODIFICADO PARA PAGINACIÓN ===
@app.route('/api/reportes', methods=['GET'])
def get_reportes():
    try:
        # Recibir parámetros de página y límite (por defecto página 1, 20 items)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('limit', 20, type=int)

        # Consulta paginada
        pagination = Reporte.query.order_by(Reporte.id.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )

        # Devolver estructura con metadatos y datos
        return jsonify({
            'total_registros': pagination.total,
            'total_paginas': pagination.pages,
            'pagina_actual': page,
            'registros_por_pagina': per_page,
            'data': [item.to_dict() for item in pagination.items]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
# ===========================================

@app.route('/api/reportes/<int:id>', methods=['GET'])
def get_detalle(id):
    try:
        reporte = Reporte.query.get_or_404(id)
        return jsonify(reporte.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reportes', methods=['POST'])
@limiter.limit("1 per 20 minutes") 
def crear_reporte():
    try:
        nombre = request.form.get('nombre')
        if not nombre: return jsonify({'error': 'Faltan datos'}), 400

        files = request.files.getlist('fotos')
        files_validos = [f for f in files if f.filename != '']
        
        if len(files_validos) > 2:
            return jsonify({'error': 'Solo se permiten máximo 2 fotos'}), 400

        nuevo = Reporte(
            nombre_completo=nombre,
            edad=request.form.get('edad'),
            departamento=request.form.get('departamento'),
            ocupacion=request.form.get('ocupacion'),
            motivo=request.form.get('motivo')
        )
        db.session.add(nuevo)
        db.session.flush()

        for file in files_validos:
            if allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                unique_name = f"{uuid.uuid4().hex}.{ext}"
                path = os.path.join(UPLOAD_FOLDER, unique_name)
                
                file.save(path)
                
                # URL pública
                url = f"https://infieless.pythonanywhere.com/static/uploads/{unique_name}"
                db.session.add(Evidencia(reporte_id=nuevo.id, filename=url))

        db.session.commit()
        return jsonify({'mensaje': 'Guardado', 'id': nuevo.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'error': 'Has excedido el límite. Espera 20 minutos.'}), 429

@app.route('/api/reportes/<int:id>', methods=['DELETE'])
def borrar_reporte(id):
    if not es_admin(): return jsonify({'error': 'No autorizado'}), 403
    try:
        reporte = Reporte.query.get_or_404(id)
        for evi in reporte.evidencias:
            try:
                fname = evi.filename.split('/')[-1]
                os.remove(os.path.join(UPLOAD_FOLDER, fname))
            except: pass
        db.session.delete(reporte)
        db.session.commit()
        return jsonify({'mensaje': 'Eliminado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reportes/<int:id>', methods=['PUT'])
def actualizar_reporte(id):
    if not es_admin(): return jsonify({'error': 'No autorizado'}), 403
    try:
        reporte = Reporte.query.get_or_404(id)
        data = request.json
        reporte.nombre_completo = data.get('nombre_completo', reporte.nombre_completo)
        reporte.edad = data.get('edad', reporte.edad)
        reporte.departamento = data.get('departamento', reporte.departamento)
        reporte.ocupacion = data.get('ocupacion', reporte.ocupacion)
        reporte.motivo = data.get('motivo', reporte.motivo)
        db.session.commit()
        return jsonify({'mensaje': 'Actualizado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run()