from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import sqlite3, os, uuid, tempfile

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'rentease-secret-key-change-in-production')

# CORS configuration - allows local development and production URLs
ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    os.environ.get('FRONTEND_URL', '').strip() or None,
    os.environ.get('BACKEND_URL', '').strip() or None,
]
ALLOWED_ORIGINS = [origin for origin in ALLOWED_ORIGINS if origin]

CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

UPLOAD_FOLDER = os.environ.get(
    'UPLOAD_FOLDER',
    os.path.join(tempfile.gettempdir(), 'rentease_uploads')
)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

DB_PATH = os.environ.get(
    'DB_PATH',
    os.path.join(tempfile.gettempdir(), 'rentease.db')
)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def row_to_dict(row):
    d = dict(row)
    for key in ['amenities', 'features', 'images']:
        d[key] = d[key].split(',') if d.get(key) else []
    return d

def current_user_id():
    return session.get('user_id')

def is_admin():
    uid = current_user_id()
    if not uid:
        return False
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT is_admin, email_verified FROM users WHERE id=?', (uid,))
    row = c.fetchone()
    conn.close()
    return row and row['is_admin'] == 1 and row['email_verified'] == 1

def require_admin(f):
    """Decorator to ensure only admins can access a route"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_admin():
            return jsonify({'error': 'Unauthorized. Admin access required.', 'code': 'ADMIN_REQUIRED'}), 403
        return f(*args, **kwargs)
    return decorated_function

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0,
            email_verified INTEGER DEFAULT 0,
            verification_code TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS properties (
            id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
            price REAL NOT NULL, price_period TEXT DEFAULT 'month',
            type TEXT, category TEXT DEFAULT 'for-rent',
            bedrooms INTEGER DEFAULT 0, bathrooms INTEGER DEFAULT 0,
            area_sqft INTEGER, county TEXT, location TEXT, address TEXT,
            featured INTEGER DEFAULT 0, amenities TEXT, features TEXT,
            images TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY, user_id TEXT NOT NULL, property_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS comparisons (
            id TEXT PRIMARY KEY, user_id TEXT NOT NULL, property_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    ''')
    c.execute("PRAGMA table_info(users)")
    existing_columns = {row['name'] for row in c.fetchall()}
    if 'email_verified' not in existing_columns:
        c.execute('ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0')
    if 'verification_code' not in existing_columns:
        c.execute('ALTER TABLE users ADD COLUMN verification_code TEXT')
    admin_email = os.environ.get('ADMIN_EMAIL')
    admin_username = os.environ.get('ADMIN_USERNAME')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    if admin_email and admin_username and admin_password:
        c.execute('SELECT id FROM users WHERE is_admin=1 LIMIT 1')
        if not c.fetchone():
            c.execute(
                'INSERT INTO users(id,username,email,password_hash,is_admin,email_verified,verification_code) VALUES(?,?,?,?,?,?,?)',
                (
                    str(uuid.uuid4()),
                    admin_username,
                    admin_email,
                    generate_password_hash(admin_password),
                    1,
                    1,
                    None
                )
            )
    conn.commit()
    conn.close()

# ── AUTH ──────────────────────────────────────────────────────────────────
@app.route('/api/auth/register', methods=['POST'])
def register():
    d = request.get_json()
    email = (d.get('email') or '').strip().lower()
    username = (d.get('username') or '').strip()
    password = d.get('password', '')
    if not email or not username or not password:
        return jsonify({'error': 'All fields are required.'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters.'}), 400
    verification_code = '{:06d}'.format(uuid.uuid4().int % 1000000)
    conn = get_db()
    c = conn.cursor()
    try:
        uid = str(uuid.uuid4())
        c.execute('INSERT INTO users(id,username,email,password_hash,email_verified,verification_code) VALUES(?,?,?,?,?,?)',
                  (uid, username, email, generate_password_hash(password), 0, verification_code))
        conn.commit()
        return jsonify({
            'message': 'Account created successfully. Please verify your email before signing in.',
            'email': email,
            'verification_code': verification_code
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'An account with those details already exists.'}), 409
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    d = request.get_json()
    identifier = (d.get('email') or d.get('username') or '').strip()
    password = d.get('password', '')
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE email=? OR username=?', (identifier, identifier))
    user = c.fetchone()
    conn.close()
    # SECURITY FIX: Generic error prevents username enumeration attacks
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid username or password.'}), 401
    if user['email_verified'] != 1:
        return jsonify({'error': 'Please verify your email before signing in.'}), 403
    session['user_id'] = user['id']
    session['username'] = user['username']
    return jsonify({'message': 'Welcome back!', 'username': user['username']}), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out.'}), 200

@app.route('/api/auth/me')
def me():
    uid = current_user_id()
    if not uid:
        return jsonify({'user': None}), 200
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id,username,email,is_admin,email_verified FROM users WHERE id=?', (uid,))
    user = c.fetchone()
    conn.close()
    if not user:
        session.clear()
        return jsonify({'user': None}), 200
    return jsonify({'user': dict(user)}), 200

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    # SECURITY FIX: Always generic - never reveal if email/username exists
    return jsonify({'message': 'If an account exists for this email, password reset instructions have been sent.'}), 200

@app.route('/api/auth/verify-email', methods=['POST'])
def verify_email():
    d = request.get_json()
    email = (d.get('email') or '').strip().lower()
    code = (d.get('code') or '').strip()
    if not email or not code:
        return jsonify({'error': 'Email and verification code are required.'}), 400
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id, username, verification_code, email_verified FROM users WHERE email=?', (email,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'Invalid verification details.'}), 400
    if user['email_verified'] == 1:
        conn.close()
        return jsonify({'message': 'Email already verified.'}), 200
    if user['verification_code'] != code:
        conn.close()
        return jsonify({'error': 'Invalid verification code.'}), 400
    c.execute('UPDATE users SET email_verified=1, verification_code=NULL WHERE id=?', (user['id'],))
    conn.commit()
    conn.close()
    session['user_id'] = user['id']
    session['username'] = user['username']
    return jsonify({'message': 'Email verified successfully!', 'username': user['username']}), 200

@app.route('/api/auth/resend-verification', methods=['POST'])
def resend_verification():
    d = request.get_json()
    email = (d.get('email') or '').strip().lower()
    if not email:
        return jsonify({'error': 'Email is required.'}), 400
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id, email_verified FROM users WHERE email=?', (email,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({'message': 'Verification instructions have been sent if the email exists.'}), 200
    if user['email_verified'] == 1:
        conn.close()
        return jsonify({'message': 'Email is already verified.'}), 200
    verification_code = '{:06d}'.format(uuid.uuid4().int % 1000000)
    c.execute('UPDATE users SET verification_code=? WHERE id=?', (verification_code, user['id']))
    conn.commit()
    conn.close()
    return jsonify({
        'message': 'Verification instructions have been sent. Check your email.',
        'verification_code': verification_code
    }), 200

# ── PROPERTIES ────────────────────────────────────────────────────────────
@app.route('/api/properties')
def get_properties():
    conn = get_db()
    c = conn.cursor()
    q = 'SELECT * FROM properties WHERE 1=1'
    params = []
    price_min = request.args.get('price_min')
    price_max = request.args.get('price_max')
    if price_min:
        q += ' AND price >= ?'; params.append(float(price_min))
    if price_max:
        q += ' AND price <= ?'; params.append(float(price_max))
    if request.args.get('type'):
        q += ' AND type=?'; params.append(request.args['type'])
    if request.args.get('county'):
        q += ' AND county=?'; params.append(request.args['county'])
    beds = request.args.get('bedrooms')
    if beds and beds != 'any':
        q += ' AND bedrooms>=?'; params.append(int(beds))
    baths = request.args.get('bathrooms')
    if baths and baths != 'any':
        q += ' AND bathrooms>=?'; params.append(int(baths))
    if request.args.get('featured') == '1':
        q += ' AND featured=1'
    search = request.args.get('search', '').strip()
    if search:
        q += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR county LIKE ?)'
        like = f'%{search}%'
        params.extend([like, like, like, like])
    sort_map = {'newest': 'created_at DESC', 'price_asc': 'price ASC', 'price_desc': 'price DESC', 'bedrooms': 'bedrooms DESC'}
    q += f' ORDER BY {sort_map.get(request.args.get("sort","newest"), "created_at DESC")}'
    c.execute(q, params)
    props = [row_to_dict(r) for r in c.fetchall()]
    uid = current_user_id()
    if uid:
        c.execute('SELECT property_id FROM favorites WHERE user_id=?', (uid,))
        favs = {r['property_id'] for r in c.fetchall()}
        for p in props:
            p['is_favorited'] = p['id'] in favs
    else:
        for p in props:
            p['is_favorited'] = False
    conn.close()
    return jsonify({'properties': props, 'total': len(props)}), 200

@app.route('/api/properties/<pid>')
def get_property(pid):
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM properties WHERE id=?', (pid,))
    row = c.fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Property not found.'}), 404
    prop = row_to_dict(row)
    uid = current_user_id()
    if uid:
        conn2 = get_db()
        c2 = conn2.cursor()
        c2.execute('SELECT id FROM favorites WHERE user_id=? AND property_id=?', (uid, pid))
        prop['is_favorited'] = c2.fetchone() is not None
        conn2.close()
    else:
        prop['is_favorited'] = False
    return jsonify({'property': prop}), 200

# ── FAVORITES ─────────────────────────────────────────────────────────────
@app.route('/api/favorites')
def get_favs():
    uid = current_user_id()
    if not uid:
        return jsonify({'error': 'Sign in to view your saved homes.', 'auth_required': True}), 401
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT p.* FROM properties p JOIN favorites f ON f.property_id=p.id WHERE f.user_id=? ORDER BY f.created_at DESC', (uid,))
    props = [row_to_dict(r) for r in c.fetchall()]
    for p in props:
        p['is_favorited'] = True
    conn.close()
    return jsonify({'favorites': props}), 200

@app.route('/api/favorites/<pid>', methods=['POST', 'DELETE'])
def toggle_fav(pid):
    uid = current_user_id()
    if not uid:
        return jsonify({'error': 'Sign in to save your favourite homes.', 'auth_required': True}), 401
    conn = get_db()
    c = conn.cursor()
    if request.method == 'POST':
        c.execute('SELECT id FROM favorites WHERE user_id=? AND property_id=?', (uid, pid))
        if c.fetchone():
            conn.close()
            return jsonify({'message': 'Already saved.', 'favorited': True}), 200
        c.execute('INSERT INTO favorites(id,user_id,property_id) VALUES(?,?,?)', (str(uuid.uuid4()), uid, pid))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Saved to favourites!', 'favorited': True}), 201
    else:
        c.execute('DELETE FROM favorites WHERE user_id=? AND property_id=?', (uid, pid))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Removed from favourites.', 'favorited': False}), 200

# ── COMPARE ───────────────────────────────────────────────────────────────
@app.route('/api/compare')
def get_compare():
    uid = current_user_id()
    if not uid:
        return jsonify({'error': 'Sign in to compare properties.', 'auth_required': True}), 401
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT p.* FROM properties p JOIN comparisons cp ON cp.property_id=p.id WHERE cp.user_id=? ORDER BY cp.created_at DESC LIMIT 4', (uid,))
    props = [row_to_dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify({'compare': props}), 200

@app.route('/api/compare/<pid>', methods=['POST', 'DELETE'])
def toggle_compare(pid):
    uid = current_user_id()
    if not uid:
        return jsonify({'error': 'Sign in to compare properties. Compare is a power feature for registered users.', 'auth_required': True}), 401
    conn = get_db()
    c = conn.cursor()
    if request.method == 'POST':
        c.execute('SELECT COUNT(*) FROM comparisons WHERE user_id=?', (uid,))
        if c.fetchone()[0] >= 4:
            conn.close()
            return jsonify({'error': 'You can compare up to 4 properties at a time.'}), 400
        c.execute('SELECT id FROM comparisons WHERE user_id=? AND property_id=?', (uid, pid))
        if c.fetchone():
            conn.close()
            return jsonify({'message': 'Already in compare list.'}), 200
        c.execute('INSERT INTO comparisons(id,user_id,property_id) VALUES(?,?,?)', (str(uuid.uuid4()), uid, pid))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Added to compare list!'}), 201
    else:
        c.execute('DELETE FROM comparisons WHERE user_id=? AND property_id=?', (uid, pid))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Removed from compare.'}), 200

@app.route('/api/counties')
def counties():
    return jsonify({'counties': ['Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Machakos', 'Kajiado', 'Kisumu', 'Uasin Gishu', "Murang'a", 'Nyeri', 'Kwale', 'Kilifi']}), 200

@app.route('/api/contact', methods=['POST'])
def contact():
    d = request.get_json()
    if not all([d.get('name'), d.get('email'), d.get('message')]):
        return jsonify({'error': 'All fields are required.'}), 400
    return jsonify({'message': "Thank you! We'll be in touch shortly."}), 200

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    d = request.get_json()
    message = (d.get('message') or '').strip()
    if not message:
        return jsonify({'error': 'Please enter a message for the chatbot.'}), 400
    lower = message.lower()
    if 'rent' in lower or 'property' in lower or 'home' in lower:
        response = "Looking for a rental? Tell me your budget, preferred county, or type of home and I can recommend options."
    elif 'payment' in lower or 'pay' in lower or 'deposit' in lower:
        response = "I can help with payment guidance. Enter the property ID and amount you'd like to pay, then choose your preferred payment method."
    elif 'admin' in lower or 'dashboard' in lower:
        response = "Admin access is only available for verified admin accounts. Please log in with your verified RentEase admin credentials."
    else:
        response = "Hi, I'm RentEase bot. Ask me about properties, payments, or how to verify your account."
    return jsonify({'reply': response}), 200

@app.route('/api/pay', methods=['POST'])
def pay():
    d = request.get_json()
    phone = (d.get('phone') or '').strip()
    paybill = (d.get('paybill') or '').strip()
    account = (d.get('account') or '').strip()
    payment_method = (d.get('payment_method') or '').strip()
    property_id = (d.get('property_id') or '').strip()
    
    if not phone or not paybill or not account or not payment_method or not property_id:
        return jsonify({'error': 'Phone, paybill, account number, payment method, and property ID are required.'}), 400
    
    SECURITY_DEPOSIT = 500
    reference = str(uuid.uuid4())[:8].upper()
    
    return jsonify({
        'message': f'Security deposit of {SECURITY_DEPOSIT} submitted successfully.',
        'status': 'success',
        'details': {
            'amount': SECURITY_DEPOSIT,
            'payment_method': payment_method,
            'phone': phone,
            'paybill': paybill,
            'account': account,
            'property_id': property_id,
            'reference': reference
        }
    }), 200

# ── ADMIN ──────────────────────────────────────────────────────────────────
@app.route('/api/admin/properties', methods=['GET'])
@require_admin
def admin_get_properties():
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM properties ORDER BY created_at DESC')
    props = [row_to_dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify({'properties': props}), 200

@app.route('/api/admin/properties', methods=['POST'])
@require_admin
def admin_create_property():
    d = request.get_json()
    required = ['title', 'description', 'price', 'type']
    if not all(d.get(f) for f in required):
        return jsonify({'error': 'Title, description, price, and type are required.'}), 400
    conn = get_db()
    c = conn.cursor()
    pid = str(uuid.uuid4())
    c.execute('''INSERT INTO properties(id,title,description,price,price_period,type,category,bedrooms,bathrooms,area_sqft,county,location,address,featured,amenities,features,images)
                  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', (
        pid, d.get('title'), d.get('description'), d.get('price'),
        d.get('price_period', 'month'), d.get('type'), d.get('category', 'for-rent'),
        d.get('bedrooms', 0), d.get('bathrooms', 0), d.get('area_sqft'),
        d.get('county', ''), d.get('location', ''), d.get('address', ''),
        d.get('featured', 0), d.get('amenities', ''), d.get('features', ''),
        d.get('images', '')
    ))
    conn.commit()
    c.execute('SELECT * FROM properties WHERE id=?', (pid,))
    prop = row_to_dict(c.fetchone())
    conn.close()
    return jsonify({'message': 'Property created successfully!', 'property': prop}), 201

@app.route('/api/admin/properties/<pid>', methods=['PUT'])
@require_admin
def admin_update_property(pid):
    d = request.get_json()
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id FROM properties WHERE id=?', (pid,))
    if not c.fetchone():
        conn.close()
        return jsonify({'error': 'Property not found.'}), 404
    fields = []
    values = []
    for key in ['title', 'description', 'price', 'price_period', 'type', 'category', 'bedrooms', 'bathrooms', 'area_sqft', 'county', 'location', 'address', 'featured', 'amenities', 'features', 'images']:
        if key in d:
            fields.append(f'{key}=?')
            values.append(d[key])
    if not fields:
        conn.close()
        return jsonify({'error': 'No fields to update.'}), 400
    values.append(pid)
    c.execute(f'UPDATE properties SET {",".join(fields)} WHERE id=?', values)
    conn.commit()
    c.execute('SELECT * FROM properties WHERE id=?', (pid,))
    prop = row_to_dict(c.fetchone())
    conn.close()
    return jsonify({'message': 'Property updated successfully!', 'property': prop}), 200

@app.route('/api/admin/properties/<pid>', methods=['DELETE'])
@require_admin
def admin_delete_property(pid):
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id FROM properties WHERE id=?', (pid,))
    if not c.fetchone():
        conn.close()
        return jsonify({'error': 'Property not found.'}), 404
    c.execute('DELETE FROM properties WHERE id=?', (pid,))
    c.execute('DELETE FROM favorites WHERE property_id=?', (pid,))
    c.execute('DELETE FROM comparisons WHERE property_id=?', (pid,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Property deleted successfully!'}), 200

@app.route('/api/admin/users', methods=['GET'])
@require_admin
def admin_get_users():
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id,username,email,is_admin,created_at FROM users ORDER BY created_at DESC')
    users = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify({'users': users}), 200

@app.route('/api/admin/users/<uid>', methods=['PUT'])
@require_admin
def admin_update_user(uid):
    d = request.get_json()
    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE id=?', (uid,))
    if not c.fetchone():
        conn.close()
        return jsonify({'error': 'User not found.'}), 404
    if 'is_admin' in d:
        c.execute('UPDATE users SET is_admin=? WHERE id=?', (1 if d['is_admin'] else 0, uid))
    if 'username' in d:
        c.execute('UPDATE users SET username=? WHERE id=?', (d['username'], uid))
    conn.commit()
    c.execute('SELECT id,username,email,is_admin,created_at FROM users WHERE id=?', (uid,))
    user = dict(c.fetchone())
    conn.close()
    return jsonify({'message': 'User updated successfully!', 'user': user}), 200

@app.route('/api/admin/upload', methods=['POST'])
@require_admin
def admin_upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided.'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400
    if file and allowed_file(file.filename):
        filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        return jsonify({'url': f'/api/uploads/{filename}', 'filename': filename}), 200
    return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400

@app.route('/api/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)