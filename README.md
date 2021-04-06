# 1. About the project
The goal of this project is to develop the frontend part for streaming films of some categories.
The request is realized with API developed at [this github link](https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR.git). 
# 2. Launch the API
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
# 3. Launch the web page 
In "OCProject6" directory, go to the "OCMovies-FrontEnd" directory and open the file "index.html". For example:
```bash
cd OCMovies-FrontEnd
firefox index.html &
```
At the first time, the page will be loaded with image films (in this version, 7 films sorted by imdb score will be displayed for each category). When a film image or a button 'More info' is clicked, the detail film information will be showed in a modal box. The next/previous films will be showed when the next/previous button is clicked.
