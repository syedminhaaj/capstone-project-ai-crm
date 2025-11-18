from flask import Flask
from flask_cors import CORS
from db import create_db
from routes.students import students_bp
from routes.instructors import instructors_bp
from routes.ai_routes import ai_bp

app = Flask(__name__)
CORS(app)
create_db()

app.register_blueprint(students_bp, url_prefix="/api")
app.register_blueprint(instructors_bp, url_prefix="/api")
app.register_blueprint(ai_bp, url_prefix="/api")

@app.route('/')
def home():
    return {"message": "Driving School CRM Backend Running"}

if __name__ == "__main__":
    app.run(debug=True, port=8000)
