
from flask import Flask, request, jsonify
import sql
from sql  import create_connection, execute_query, execute_read_query
import creds
from creds import Creds
from flask_cors import CORS


username = "myusername"
password = "mypassword"



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5000"]}})

@app.route('/', methods=['GET'])
def home():
    return "<h1> Thank you for checking me!</h1>"

#login page check
@app.route('/login', methods=['POST'])
def login():
    auth = request.authorization

    # Check if the provided username and password match the pre-configured ones
    if auth and auth.username == username and auth.password == password:
        return "Login successful"
    else:
        return "Invalid credentials"
    
@app.route('/tables', methods=['GET'])
def get_tables():
    connection = create_connection(Creds.connectionstring, Creds.username, Creds.password, Creds.database)
    tables = execute_read_query(connection, "SHOW TABLES;")
    return tables

    
@app.route('/tables/<table_name>')
def get_table_contents(table_name):
    conn = create_connection(Creds.connectionstring, Creds.username, Creds.password, Creds.database)
    cursor = conn.cursor()
    cursor.execute(f'SELECT * FROM `{table_name}`;')
    results = cursor.fetchall()
    columns = [i[0] for i in cursor.description]
    cursor.close()
    conn.close()
    return jsonify({'columns': columns, 'data': results})

@app.route('/views', methods=['GET'])
def get_views():
    connection = create_connection(Creds.connectionstring, Creds.username, Creds.password, Creds.database)
    views = execute_read_query(connection, "SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';")
    return views
    


@app.route('/check-db-connection', methods=['GET'])
def check_db_connection():
    try:
        connection = create_connection(Creds.connectionstring, Creds.username, Creds.password, Creds.database)
        return "Successfully connected to the database"
    except Exception as e:
        return f"Failed to connect to the database. Error: {str(e)}"

app.run()