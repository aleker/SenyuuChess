### About
Chess game created in **Django** 2.0.3. 
Communication with players was implemented using **WebSockets**.


### Building
In main project directory:
```commandline
pip install -r requirements.txt
python3 manage.py makemigrations
python3 manage.py migrate
```

### Running
```commandline
redis-server
python3 manage.py runserver
```
