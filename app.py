from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import sqlite3, os, uuid, tempfile


def load_dotenv(path='.env'):
    if not os.path.exists(path):
        return
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and value and key not in os.environ:
                os.environ[key] = value


def get_env(key, default=None):
    value = os.environ.get(key, default)
    if isinstance(value, str):
        return value.strip()
    return value


def normalize_origin(origin):
    if not origin:
        return ''
    return origin.strip().rstrip('/')


def parse_bool(value, default=False):
    if value is None:
        return default
    return str(value).strip().lower() in ('1', 'true', 'yes', 'on')


load_dotenv()

ENVIRONMENT = get_env('ENVIRONMENT', 'development').lower()

app = Flask(__name__)
app.secret_key = get_env('SECRET_KEY', 'rentease-secret-key-change-in-production')
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='None' if ENVIRONMENT == 'production' else 'Lax',
    SESSION_COOKIE_SECURE=ENVIRONMENT == 'production',
)

# CORS configuration - allows local development and production URLs
ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    normalize_origin(get_env('FRONTEND_URL', '')),
    normalize_origin(get_env('BACKEND_URL', '')),
]
ALLOWED_ORIGINS = [origin for origin in ALLOWED_ORIGINS if origin]

CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

# ── EMAIL CONFIGURATION ────────────────────────────────────────────────────
app.config['MAIL_SERVER'] = get_env('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(get_env('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = parse_bool(get_env('MAIL_USE_TLS', 'true'))
app.config['MAIL_USE_SSL'] = parse_bool(get_env('MAIL_USE_SSL', 'false'))
app.config['MAIL_USERNAME'] = get_env('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = get_env('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = get_env('MAIL_DEFAULT_SENDER', get_env('MAIL_USERNAME', 'noreply@rentease.com'))
RENT_EASE_EMAIL = get_env('RENT_EASE_EMAIL', get_env('ADMIN_EMAIL', 'agencyrentease@gmail.com'))

mail = Mail(app)

if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
    print('WARNING: Mail is not fully configured. Contact form and verification emails will fail.')

def send_verification_email(email, verification_code, username):
    """Send verification code via email"""
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        msg = f"Email not configured. Verification code for {email}: {verification_code}"
        print(msg)
        return False, msg

    try:
        msg = Message(
            subject='RentEase Email Verification',
            recipients=[email],
            html=f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to RentEase, {username}!</h1>
                        <p style="color: #555; font-size: 16px; margin-bottom: 20px;">Thank you for signing up. Please verify your email address by entering the code below:</p>
                        <div style="background-color: #f0f4ff; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Your Verification Code:</p>
                            <p style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 0;">{verification_code}</p>
                        </div>
                        <p style="color: #555; font-size: 14px; margin-bottom: 10px;">This code will expire in 24 hours.</p>
                        <p style="color: #555; font-size: 14px; margin-top: 20px;">If you did not create this account, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">RentEase Team | Finding Your Perfect Home</p>
                    </div>
                </body>
            </html>
            """
        )
        mail.send(msg)
        return True, None
    except Exception as e:
        err = f"Error sending email to {email}: {str(e)}"
        print(err)
        return False, err


def send_contact_email(name, email, message_text):
    """Send contact form message to the RentEase email"""
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        msg = f"Email not configured. Contact message from {name} <{email}>: {message_text}"
        print(msg)
        return False, msg

    try:
        msg = Message(
            subject=f'New RentEase contact message from {name}',
            recipients=[RENT_EASE_EMAIL],
            reply_to=email,
            html=f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h1 style="color: #2563eb; margin-bottom: 20px;">New Contact Us Message</h1>
                        <p style="color: #555; font-size: 16px; margin-bottom: 10px;"><strong>Name:</strong> {name}</p>
                        <p style="color: #555; font-size: 16px; margin-bottom: 10px;"><strong>Email:</strong> {email}</p>
                        <p style="color: #555; font-size: 16px; margin-bottom: 20px;"><strong>Message:</strong></p>
                        <div style="background-color: #f0f4ff; padding: 20px; border-radius: 6px; color: #333; line-height: 1.6; white-space: pre-wrap;">{message_text}</div>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">RentEase Contact Form</p>
                    </div>
                </body>
            </html>
            """
        )
        mail.send(msg)
        return True, None
    except Exception as e:
        err = f"Error sending contact email: {str(e)}"
        print(err)
        return False, err

UPLOAD_FOLDER = os.environ.get(
    'UPLOAD_FOLDER',
    os.path.join(tempfile.gettempdir(), 'rentease_uploads')
)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

DATABASE_URL = os.environ.get('DATABASE_URL')
DB_PATH = os.environ.get(
    'DB_PATH',
    os.path.join(tempfile.gettempdir(), 'rentease.db')
)
DB_DRIVER = 'postgres' if DATABASE_URL else 'sqlite'


def placeholder_sql(sql):
    return sql if DB_DRIVER == 'sqlite' else sql.replace('?', '%s')


def execute(cursor, sql, params=None):
    if params is None:
        params = ()
    return cursor.execute(sql, params)


class AdaptedCursor:
    def __init__(self, cursor):
        self._cursor = cursor

    def execute(self, sql, params=None):
        if params is None:
            params = ()
        return self._cursor.execute(placeholder_sql(sql), params)

    def executemany(self, sql, seq_of_params):
        return self._cursor.executemany(placeholder_sql(sql), seq_of_params)

    def __getattr__(self, item):
        return getattr(self._cursor, item)

    def __iter__(self):
        return iter(self._cursor)


class AdaptedConnection:
    def __init__(self, conn):
        self._conn = conn

    def cursor(self, *args, **kwargs):
        c = self._conn.cursor(*args, **kwargs)
        return AdaptedCursor(c)

    def __getattr__(self, item):
        return getattr(self._conn, item)


def adapt_connection(conn):
    return AdaptedConnection(conn)


def get_db():
    if DATABASE_URL:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return adapt_connection(conn)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return adapt_connection(conn)


def get_table_columns(conn, table_name):
    c = conn.cursor()
    if DB_DRIVER == 'sqlite':
        c.execute(f"PRAGMA table_info({table_name})")
        cols = [row['name'] for row in c.fetchall()]
    else:
        c.execute('SELECT column_name FROM information_schema.columns WHERE table_name=%s', (table_name,))
        cols = [row['column_name'] for row in c.fetchall()]
    c.close()
    return cols


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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


@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'environment': ENVIRONMENT}), 200


@app.route('/')
def root():
    return jsonify({'service': 'RentEase API', 'status': 'ok'}), 200

def init_db():
    conn = get_db()
    c = conn.cursor()
    execute(c, '''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0,
            email_verified INTEGER DEFAULT 0,
            verification_code TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    execute(c, '''
        CREATE TABLE IF NOT EXISTS properties (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            price_period TEXT DEFAULT 'month',
            type TEXT,
            category TEXT DEFAULT 'for-rent',
            bedrooms INTEGER DEFAULT 0,
            bathrooms INTEGER DEFAULT 0,
            area_sqft INTEGER,
            county TEXT,
            location TEXT,
            address TEXT,
            featured INTEGER DEFAULT 0,
            amenities TEXT,
            features TEXT,
            images TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    execute(c, '''
        CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            property_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    execute(c, '''
        CREATE TABLE IF NOT EXISTS comparisons (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            property_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    existing_columns = set(get_table_columns(conn, 'users'))
    if 'email_verified' not in existing_columns:
        execute(c, 'ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0')
    if 'verification_code' not in existing_columns:
        execute(c, 'ALTER TABLE users ADD COLUMN verification_code TEXT')
    admin_email = os.environ.get('ADMIN_EMAIL')
    admin_username = os.environ.get('ADMIN_USERNAME')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    if admin_email and admin_username and admin_password:
        execute(c, 'SELECT id FROM users WHERE is_admin=1 LIMIT 1')
        if not c.fetchone():
            execute(
                c,
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
        execute(c, 'INSERT INTO users(id,username,email,password_hash,email_verified,verification_code) VALUES(?,?,?,?,?,?)',
                (uid, username, email, generate_password_hash(password), 0, verification_code))
        conn.commit()
        # Send verification email
        sent, send_error = send_verification_email(email, verification_code, username)
        if not sent:
            return jsonify({
                'error': 'Account created, but verification email could not be sent.',
                'details': send_error
            }), 500
        return jsonify({
            'message': 'Account created successfully. Please verify your email before signing in.',
            'email': email
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
    execute(c, 'SELECT id, username, verification_code, email_verified FROM users WHERE email=?', (email,))
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
    execute(c, 'UPDATE users SET email_verified=1, verification_code=NULL WHERE id=?', (user['id'],))
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
    execute(c, 'SELECT id, username, email_verified FROM users WHERE email=?', (email,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({'message': 'Verification instructions have been sent if the email exists.'}), 200
    if user['email_verified'] == 1:
        conn.close()
        return jsonify({'message': 'Email is already verified.'}), 200
    verification_code = '{:06d}'.format(uuid.uuid4().int % 1000000)
    execute(c, 'UPDATE users SET verification_code=? WHERE id=?', (verification_code, user['id']))
    conn.commit()
    conn.close()
    # Send verification email
    sent, send_error = send_verification_email(email, verification_code, user['username'])
    if not sent:
        return jsonify({
            'error': 'Verification email could not be sent.',
            'details': send_error
        }), 500
    return jsonify({
        'message': 'Verification instructions have been sent. Check your email.'
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
    name = (d.get('name') or '').strip()
    email = (d.get('email') or '').strip().lower()
    message_text = (d.get('message') or '').strip()
    if not all([name, email, message_text]):
        return jsonify({'error': 'All fields are required.'}), 400

    success, error_message = send_contact_email(name, email, message_text)
    if not success:
        if ENVIRONMENT != 'production':
            return jsonify({'error': error_message}), 500
        return jsonify({'error': 'Unable to send contact email. Check backend mail configuration and logs.'}), 500

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
        # Prefer external storage when configured (Supabase Storage or Cloudinary)
        # 1) Supabase Storage (recommended, has a generous free tier)
        SUPABASE_URL = os.environ.get('SUPABASE_URL')
        SUPABASE_KEY = os.environ.get('SUPABASE_KEY')  # service role key
        SUPABASE_BUCKET = os.environ.get('SUPABASE_BUCKET', 'uploads')
        if SUPABASE_URL and SUPABASE_KEY:
            try:
                import requests
                data = file.read()
                upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{filename}"
                headers = {
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'apikey': SUPABASE_KEY,
                    'Content-Type': file.content_type or 'application/octet-stream'
                }
                resp = requests.post(upload_url, data=data, headers=headers)
                if resp.status_code not in (200, 201):
                    return jsonify({'error': 'Upload to Supabase failed.', 'details': resp.text}), 500
                public_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{filename}"
                return jsonify({'url': public_url, 'filename': filename}), 200
            except Exception as e:
                return jsonify({'error': 'Supabase upload error', 'details': str(e)}), 500

        # 2) Cloudinary (also offers a free tier)
        if os.environ.get('CLOUDINARY_CLOUD_NAME') and os.environ.get('CLOUDINARY_API_KEY') and os.environ.get('CLOUDINARY_API_SECRET'):
            try:
                import cloudinary
                import cloudinary.uploader
                cloudinary.config(
                    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
                    api_key=os.environ.get('CLOUDINARY_API_KEY'),
                    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
                )
                res = cloudinary.uploader.upload(file, public_id=filename, resource_type='image')
                return jsonify({'url': res.get('secure_url'), 'filename': filename}), 200
            except Exception as e:
                return jsonify({'error': 'Cloudinary upload failed', 'details': str(e)}), 500

        # 3) Fallback to local temp storage
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        return jsonify({'url': f'/api/uploads/{filename}', 'filename': filename}), 200
    return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400

@app.route('/api/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
