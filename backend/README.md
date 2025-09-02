## Scripts
To run install
```bash
pip install flask flask-cors flask-sqlalchemy werkzeug
```
run
```cmd
python app.py
```

## Note
```bash
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/campus_events')
```

### Make changes
database name: campus_events<br>
username: postgres<br>
password: password<br>
No password encrption, stored as a plain text "werkzeug" is not used 
