const keys = ["title", "genres", "date_published", "rated", "imdb_score", "directors", "actors", "duration",
"countries", "description"];

async function loadImages() {
    try {
        await showImages();
    } catch(err) {
        console.log(err);
    }
}

async function getTheBestFilm(url) {
//   Retrieve data (type: json) from the attribute "results".
    try {
        let response = await fetch(url);
        let data = await response.json();
        let results = await data.results;
        return results[0]; // The first element is the best score.
    } catch(err) {
//        catches errors both in fetch and response.json
        console.log(err);
    }
}

async function showTheBestFilm(imgId, url) {
    try{
        let result = await getTheBestFilm(url);
        let image_url = result["image_url"];
        document.getElementById(imgId).src = image_url;
        let element = document.getElementById("info_theBestFilmImg");
        element.innerHTML =result["title"];

        let newDiv = document.createElement("div");
        newDiv.setAttribute("id", "modalDiv");

        let btnId = "btn_" + imgId; // e.g. model: btn_bestFilmImg0
        let btn = document.getElementById(btnId);
        btn.onclick = async function(){
            if(document.getElementById("modalDiv")){
                document.getElementById("modalDiv").remove();
            }
            await showInfo(result);
        };

    }catch(err) {
//        catches errors
        console.log(err);
    }
}

async function getDataFromMultiPages(url, size) {
//  Fetch multiple pages to retrieve json data in a list.
    const listOfResults = [];
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

async function showImagesByCategory(modelOfId, numberOfImages, url, size) {
//Retrieve data (type: json) from the attribute "results".
    try {
        let results = await getDataFromMultiPages(url, size);
        for (let i = 0; i < numberOfImages; i++){
            let result = results[i];
            let image_url = result["image_url"];
            imgId = modelOfId + i;
            let img = document.getElementById(imgId);
            img.src = image_url;
            // Add event "onclick" to display film information in a modal box
            img.onclick = async function(){
                if(document.getElementById("modalDiv")){
                    document.getElementById("modalDiv").remove();
                }
                await showInfo(result);
            };
            let btnId = "btn_" + imgId; // model: btn_bestFilmImg0
            let btn = document.getElementById(btnId);
            btn.onclick = async function(){
                if(document.getElementById("modalDiv")){
                    document.getElementById("modalDiv").remove();
                }
                await showInfo(result);
            };

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

