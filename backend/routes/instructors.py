from flask import Blueprint, request, jsonify
from db import get_connection

instructors_bp = Blueprint('instructors_bp', __name__)

@instructors_bp.route('/instructors', methods=['GET'])
def get_instructors():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM instructors ORDER BY id DESC")
    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    conn.close()
    return jsonify([dict(zip(columns, row)) for row in rows])

@instructors_bp.route('/instructors', methods=['POST'])
def add_instructor():
    data = request.json
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO instructors (name, email, phone) VALUES (%s, %s, %s) RETURNING *',
                (data['name'], data.get('email'), data.get('phone')))
    new_instr = cur.fetchone()
    conn.commit()
    conn.close()
    return jsonify(dict(zip([desc[0] for desc in cur.description], new_instr))), 201
