const keys = ["title", "genres", "date_published", "rated", "imdb_score", "directors", "actors", "duration",
"countries", "description"];

document.getElementsByTagName("body").onload = loadImages();

async function loadImages() {
    try {
        await showImages();
    } catch(err) {
        console.log(err);
    }
}

async function getDetailInfo(url) {
//   Retrieve data (type: json) from an url containing film id (e.g. "http://localhost:8000/api/v1/titles/9").
// This data contains detail information of the corresponding film.
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch(err) {
//        catches errors both in fetch and response.json
        console.log(err);
    }
}


async function showTheBestFilm(imgId, url) {
    try{
        size = 1; // Take only one film from the sorted films by imdb_score
        let filmUrls = await getUrlsForDetailInfo(url, size);
        filmUrl = filmUrls[0];
        await showImage(filmUrl, imgId);

        const data = await getDetailInfo(filmUrl);

        let element = document.getElementById("info_theBestFilmImg");

        let info = "The best film: " + "<br>" + data["title"] + "<br>" + data["description"];
        element.innerHTML = info;
    }catch(err) {
//        catches errors
        console.log(err);
    }
}

async function getUrlsForDetailInfo(url, size) {
//  Fetch multiple pages to retrieve a list of urls where each url leads to the detail information for each film.
    try{
        const urlsForDetailInfo = [];
        while (url && urlsForDetailInfo.length < size) {
            const res = await fetch(url);
            const data = await res.json();

            const results = data.results;
            let i = 0;
            while(urlsForDetailInfo.length < size && i < results.length){
                let film_url = results[i]["url"];
                urlsForDetailInfo.push(film_url);
                i++;
            }
            url = data.next;
        }
        return urlsForDetailInfo;
    }catch(err){
    console.log(err);
    }
}

async function getDataFromMultiPages(url, size) {
//  Fetch multiple pages to retrieve json data in a list.
    const listOfResults = [];
    let numberOfItems = 0;
    try{
            do {
                const res = await fetch(url);
                const data = await res.json();
                url = data.next;
                const results = data.results;// get element with key "results", this is a collection of movie infos
                for(let i = 0; i < results.length; i++){
                    listOfResults.push(results[i]);
                }
                if (listOfResults.length === size){
                // Retrieve only the given number of elements (size), not all.
                    break;
                }
            } while(url)
    return listOfResults;
    }catch(err){
    console.log(err);
    }
}

async function showModalBox(data){
    if(document.getElementById("modalDiv")){
        document.getElementById("modalDiv").remove();
    }
    await showInfo(data);
}

async function showImage(filmUrl, imgId){
    const data = await getDetailInfo(filmUrl);
    let imageUrl = data["image_url"];


    let img = document.getElementById(imgId);
    img.src = imageUrl;
    // Add event "onclick" to display film information in a modal box
    img.onclick = async function(){await showModalBox(data);};

    let btnId = "btn_" + imgId; // model: btn_bestFilmImg0
    let btn = document.getElementById(btnId);
    btn.onclick = async function(){await showModalBox(data);};
}


async function showImagesByCategory(modelOfId, numberOfImages, url, size) {
//Retrieve data (type: json) from the attribute "results".
    try {
        let filmUrls = await getUrlsForDetailInfo(url, size);
        for (let i = 0; i < numberOfImages; i++){
            let filmUrl = filmUrls[i];
            imgId = modelOfId + i;
            await showImage(filmUrl, imgId);
        }
    } catch(err) {
        //catches errors
        console.log(err);
    }

}

async function showImages() {
    let size = 15; // set a max element number for fetching multiple pages
    let numberOfImages = 7; // number of element displayed in screen
    let url;
    let modelOfId;

    url = "http://127.0.0.1:8000/api/v1/titles/?sort_by=-imdb_score";
    let imgId = "theBestFilmImg";
    await showTheBestFilm(imgId, url);

    modelOfId = "bestFilmImg";
    await showImagesByCategory(modelOfId, numberOfImages, url, size);

    url = "http://127.0.0.1:8000/api/v1/titles/?genre=action&sort_by=-imdb_score";
    modelOfId = "actionImg";
    await showImagesByCategory(modelOfId, numberOfImages, url, size);

    url = "http://127.0.0.1:8000/api/v1/titles/?genre=fantasy&sort_by=-imdb_score";
    modelOfId = "fantasyImg";
    await showImagesByCategory(modelOfId, numberOfImages, url, size);

    url = "http://127.0.0.1:8000/api/v1/titles/?genre=animation&sort_by=-imdb_score";
    modelOfId = "animationImg";
    await showImagesByCategory(modelOfId, numberOfImages, url, size);

}

function addElementsToDiv(div, result, keys){
    for (key of keys) {
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
    // Get the modal
    let modal = document.getElementById("myModal");
    modal.style.display = "block";

    var element = document.getElementById("modalBody");

    var newDiv = document.createElement("div");
    newDiv.setAttribute("id", "modalDiv");

    var img = new Image();
    img.src = result["image_url"];
    img.height = 90;
    img.width = 70;
    newDiv.appendChild(img);

    addElementsToDiv(newDiv, result, keys); // see const keys at the beginning of this script.

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

