import psycopg2

DB_CONFIG = {
    'dbname': 'postgres',
    'user': 'postgres',
    'password': 'test123',
    'host': 'localhost',
    'port': '5432'
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def create_db():
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute('''
            CREATE TABLE IF NOT EXISTS instructors (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT
            )
        ''')

        cur.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                license_number TEXT UNIQUE,
                date_of_birth TEXT,
                address TEXT,
                emergency_contact TEXT,
                emergency_phone TEXT,
                status TEXT DEFAULT 'Active',
                lessons_completed INTEGER DEFAULT 0,
                instructor_id INTEGER REFERENCES instructors(id)
            )
        ''')

        conn.commit()
        conn.close()
        print("✅ Database tables created successfully.")
    except Exception as e:
        print("❌ Error creating database:", e)
