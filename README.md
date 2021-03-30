# 1. Launch the part of API
```bash
sudo apt install -y python3-venv
mkdir OCProject6
cd OCProject6
git clone https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR.git
cd OCMovies-API-EN-FR
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py create_db
python manage.py runserver
```

# 2. Launch the part of website
In "OCProject6" directory, go to the "OCMovies-FrontEnd" directory and open the file "index.html".
```bash
cd OCMovies-FrontEnd
firefox index.html &
```
Click on the page, the page will load image films
