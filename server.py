#!/usr/bin/env python
import sqlite3
from flask import Flask,g,jsonify,render_template, request
from flask_cors import CORS
import random

DATABASE = 'config/ledger.db'

app = Flask(__name__)
CORS(app)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def exec_stmt(sql,args={}):
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute(sql,args)
        db.commit()
        cur.close()
        return '{"success":"true"}'
    except:
        return '{"success":"false"}'

def run_query(sql,args={}):
    db = get_db()
    cur = db.cursor()
    cur.execute(sql,args)
    r = cur.fetchall()
    cur.close()
    return r

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/',strict_slashes=False)
def index():
    return render_template('ledger.html') 

@app.route('/touched',strict_slashes=False)
def touched():
    print("touched")
    return '{"success":"true"}'

@app.route('/repeat',strict_slashes=False, methods = ['POST'])
def repeat():
    print(request.get_json())
    return '{"success":"true"}'

@app.route('/deploy',strict_slashes=False)
def deploy():
    exec_stmt("create table ledger(id TEXT PRIMARY KEY, send_key TEXT, receive_key TEXT, amount INT, sender_signature TEXT, validation_signature TEXT);")
    return '{"success":"true"}'

