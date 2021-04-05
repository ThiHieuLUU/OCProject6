const KEYS = ["title", "genres", "date_published", "rated", "imdb_score", "directors", "actors", "duration",
"countries", "description"];

const CATEGORY_NAMES = ["bestFilm", "action", "fantasy", "animation"];
const NB_IMAGES_PER_PAGE = 7; // Number of images is displayed for each category.
let SIZE = 35; // Each time fetch 35 films for each category.

let detailInfoUrls ={}; // To store all fetched url films to get detail film information.
let currentPositions = {}; //Current fist image position displayed from the left to the right of the screen.
let imageIdModel = {}; // The model of image id which is defined for each category in index.html.
let nextUrls = {}; // Mark the url by category to can be continued fetching at the next time.
let theBestFilmImgId = "theBestFilmImg"

document.getElementsByTagName("body").onload = loadImages();

function initializeParameters(){
    /*
    * Initialize some declared parameters.
    */

    for(category of CATEGORY_NAMES){
        detailInfoUrls[category] = [];
        currentPositions[category] = 0;// Position of the first image from the left to the right.
        imageIdModel[category] = category + "Img";// e.g. Model of image id: actionImg -> id: actionImg1, actionImg2, ect.
    }

    nextUrls[CATEGORY_NAMES[0]] = "http://127.0.0.1:8000/api/v1/titles/?sort_by=-imdb_score";
    nextUrls[CATEGORY_NAMES[1]] = "http://127.0.0.1:8000/api/v1/titles/?genre=action&sort_by=-imdb_score";
    nextUrls[CATEGORY_NAMES[2]] = "http://127.0.0.1:8000/api/v1/titles/?genre=fantasy&sort_by=-imdb_score";
    nextUrls[CATEGORY_NAMES[3]] = "http://127.0.0.1:8000/api/v1/titles/?genre=animation&sort_by=-imdb_score";
}

async function loadImages() {
    /*
    * Function is called when the page is loaded at the first time.
    */

    try {
        initializeParameters();
        await showTheBestFilm();
        await showImagesOfAllCategories();
    } catch(err) {
        console.log(err);
    }
}

async function showTheBestFilm() {
    /*
    * Show the best film which has the best imdb score.
    */

    try{
        let url = nextUrls[CATEGORY_NAMES[0]];
        let response = await fetch(url);
        let data = await response.json();
        let results = await data.results;
        let result = results[0]; // The first element is the best score.
        let image_url = result["image_url"];
        let filmUrl = result["url"];
        // Add text to image
        data = await getDetailInfo(filmUrl);
        element = document.getElementById("theBestFilm");
        element.style.backgroundColor = "#2196F3";
        element.style.height = "350px";
        element.style.backgroundImage = "url("+image_url+")";
        element = document.getElementById("title");
        element.innerHTML = data["title"];
         element = document.getElementById("description");
        element.innerHTML = data["description"];

        let btn = document.getElementById("btn_theBestFilmImg");
        btn.onclick = async function(){await showModalBox(data);};
    }
    catch(err) {
        // catches errors
        console.log(err);
    }
}

async function updateUrlsForDetailInfo(categoryName) {
    /*
    * Fetch multiple pages to retrieve a list of urls where each url leads to the detail information for each film.
    * SIZE is the number of urls will be fetched. SIZE will be rounded by the available element on the fetched page.
    * e.g. each fetched page contains 5 elements, SIZE = 18 => SIZE after fetching will be the ((18 // 5) + 1)*5
    */

    try{
        let url = nextUrls[categoryName];
        let nbOfItems = 0;
        while (url && nbOfItems < SIZE) {
            const res = await fetch(url);
            const data = await res.json();

            const results = data.results;
            for (result of results){
                let film_url = result["url"];
                detailInfoUrls[categoryName].push(film_url);
                nbOfItems ++;
            }
            url = data.next;
        }
    // Mark and update the url for the next request on the same category.
    nextUrls[categoryName] = url;
    }catch(err){
        console.log(err);
    }
}

function addElementsToDiv(div, result, KEYS){
    /*
    * Build a div then add film information to display in the modal box.
    */

    for (key of KEYS) {
        let tag = document.createElement("p");
        let info;
        if(result.hasOwnProperty(key)){
            info = key.charAt(0).toUpperCase() + key.slice(1) + ": " + result[key];

        }else{
            let no_info = "Not available"
            info = key.charAt(0).toUpperCase() + key.slice(1) + ": " + no_info;
        }
        // Deal to some characters
        if (info.includes("_")){
            info.replace("_", " ");
        }

        if (info.includes(",")){
            info.replace(",", " ");
        }

        let text = document.createTextNode(info);
        tag.appendChild(text);
        div.appendChild(tag);
    }
}

async function showInfo(result){
    /*
    * Show film information in the modal box and handle the events (click, close).
    */

    let modal = document.getElementById("myModal");
    modal.style.display = "block";

    let element = document.getElementById("modalBody");

    let newDiv = document.createElement("div");
    newDiv.setAttribute("id", "modalDiv");

    let img = new Image();
    img.src = result["image_url"];
//    img.height = 90;
//    img.width = 70;
    newDiv.appendChild(img);

    addElementsToDiv(newDiv, result, KEYS); // see const KEYS at the beginning of this script.

    element.appendChild(newDiv);

    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
      document.getElementById("modalDiv").remove();
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
              document.getElementById("modalDiv").remove();

      }
    }
}

async function showModalBox(data){
    /*
    * Show detail information of a film in a modal box.
    */

    if(document.getElementById("modalDiv")){
        document.getElementById("modalDiv").remove();
    }
    await showInfo(data);
}

async function getDetailInfo(url) {
    /*
    * Retrieve data (type: json) from an url containing film id (e.g. "http://localhost:8000/api/v1/titles/9").
    * This data contains detail information of the corresponding film.
    */

    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch(err) {
    // Catches errors both in fetch and response.json.
        console.log(err);
    }
}

async function showImage(filmUrl, imgId){
    /*
    * Show a film image and add onclick function to show film information.
    */

    const data = await getDetailInfo(filmUrl);
    let imageUrl = data["image_url"];
    let img = document.getElementById(imgId);
    img.src = imageUrl;
    // Add event "onclick" to display film information in a modal box
    img.onclick = async function(){await showModalBox(data);};

    let btnId = "btn_" + imgId; // e.g. model: btn_bestFilmImg0
    let btn = document.getElementById(btnId);
    btn.onclick = async function(){await showModalBox(data);};
}

async function showImagesById(imageIdModel, filmUrls) {
    /*
    * Show a set of images via theirs id and theirs urls.
    */

    try {
        let i = 0;
        for (filmUrl of filmUrls){
            let filmUrl = filmUrls[i];
            imgId = imageIdModel + i;
            await showImage(filmUrl, imgId);
            i++;
        }
    } catch(err) {
        //catches errors
        console.log(err);
    }
}

async function showImagesByCategory(categoryName){
    /*
    * Show images for a category at the first time loaded.
    */

    await updateUrlsForDetailInfo(categoryName);
    filmUrls = detailInfoUrls[categoryName].slice(currentPositions[categoryName], currentPositions[categoryName] + NB_IMAGES_PER_PAGE);
    await showImagesById(imageIdModel[categoryName], filmUrls);

    }

async function showImagesOfAllCategories() {
    /*
    *Show images for all categories when the web page is loaded at the first time.
    */
    for(categoryName of CATEGORY_NAMES){
        await showImagesByCategory(categoryName);
    }
}

async function next(categoryName, imageIdModel){
    /*
    * Show next films (each time, show NB_IMAGES_PER_PAGE images, here NB_IMAGES_PER_PAGE = 7).
    */

    currentPositions[categoryName] += NB_IMAGES_PER_PAGE;
    firstPosition = currentPositions[categoryName]; // First image position from the left to right.
    filmUrls = detailInfoUrls[categoryName].slice(firstPosition, firstPosition + NB_IMAGES_PER_PAGE);
    await showImagesById(imageIdModel, filmUrls);
    // There is no more image url in the storage, next films can not be showed. 
    // In this case, fetch more films and add/store them in detailInfoUrls.
    if (firstPosition + NB_IMAGES_PER_PAGE === detailInfoUrls[categoryName].length){
        await updateUrlsForDetailInfo(categoryName);
    
    }
}

async function prev(categoryName, imageIdModel){
    /*
    * Show previous films (each time, show NB_IMAGES_PER_PAGE images, here NB_IMAGES_PER_PAGE = 7).
    */

    if (currentPositions[categoryName] >= NB_IMAGES_PER_PAGE){
        currentPositions[categoryName] -= NB_IMAGES_PER_PAGE;
    }
    firstPosition = currentPositions[categoryName]; // First image position from the left to right.
    filmUrls = detailInfoUrls[categoryName].slice(firstPosition, firstPosition + NB_IMAGES_PER_PAGE);
    await showImagesById(imageIdModel, filmUrls);
}

async function nextFilms(clicked_id){
    /*
    * Show next films by detecting category via id of next button.
    */

    idBtn = clicked_id; //this.id;
    const words = idBtn.split('_');
    categoryName = words[words.length -1];
    let imageIdModel = categoryName + "Img";
    await next(categoryName, imageIdModel);
}

async function prevFilms(clicked_id){
    /*
    * Show previous films by detecting category via id of previous button.
    */

    idBtn = clicked_id; //this.id;
    const words = idBtn.split('_');
    categoryName = words[words.length -1];
    let imageIdModel = categoryName + "Img";
    await prev(categoryName, imageIdModel);
}
