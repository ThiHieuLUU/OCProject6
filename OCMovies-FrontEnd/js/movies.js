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
    }catch(err) {
//        catches errors both in fetch and response.json
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
            let image_url = results[i]["image_url"];
            imgId = modelOfId + i;
            document.getElementById(imgId).src = image_url;
        }
    } catch(err) {
        //catches errors both in fetch and response.json
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