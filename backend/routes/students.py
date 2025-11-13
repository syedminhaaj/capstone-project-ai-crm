from flask import Blueprint, request, jsonify
from db import get_connection

students_bp = Blueprint('students_bp', __name__)

@students_bp.route('/students', methods=['GET'])
def get_students():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM students ORDER BY id DESC")
    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    conn.close()
    return jsonify([dict(zip(columns, row)) for row in rows])

@students_bp.route('/students', methods=['POST'])
def add_student():
    data = request.json
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute('''
            INSERT INTO students (
                name, email, phone, license_number, date_of_birth, address,
                emergency_contact, emergency_phone, status, lessons_completed, instructor_id
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING *
        ''', (
            data.get('name'), data.get('email'), data.get('phone'),
            data.get('license_number'), data.get('date_of_birth'),
            data.get('address'), data.get('emergency_contact'),
            data.get('emergency_phone'), data.get('status', 'Active'),
            data.get('lessons_completed', 0), data.get('instructor_id')
        ))
        new_student = cur.fetchone()
        conn.commit()
        conn.close()
        return jsonify(dict(zip([desc[0] for desc in cur.description], new_student))), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@students_bp.route('/students/<int:id>', methods=['PUT'])
def update_student(id):
    data = request.json
    fields = [
        'name', 'email', 'phone', 'license_number', 'date_of_birth', 'address',
        'emergency_contact', 'emergency_phone', 'status', 'lessons_completed', 'instructor_id'
    ]
    updates = [f"{f} = %s" for f in fields]
    values = [data.get(f) for f in fields]
    values.append(id)

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"UPDATE students SET {', '.join(updates)} WHERE id = %s RETURNING *", values)
    updated = cur.fetchone()
    conn.commit()
    conn.close()
    if not updated:
        return jsonify({"error": "Student not found"}), 404
    return jsonify(dict(zip([desc[0] for desc in cur.description], updated)))

@students_bp.route('/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM students WHERE id = %s", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Student deleted successfully"})
