/* jshint esversion: 8 */

/**
 * This script allows to fetch film urls and displays film information.
 * When a film image or a button ( named "More info" here) is clicked, detail film information will be showed.
 * For each request realized on multiple pages of server, 35 film urls are fetched.
 * (here because 35 = 7 * 5,
 * 7 is the the number of images displayed per category,
 * 5 is the number of film urls obtained for a request realized on one server page.)
 */

// Keys to retrieve film information.
const KEYS = ["title", "genres", "date_published", "rated", "imdb_score", "directors", "actors", "duration",
	"countries", "worldwide_gross_income", "description"];

// "KEYS_OF_INFO" is the json type where each key in the constant "KEYS" will be renamed to display as a title of corresponding information.
// e.g. "title" becomes "Title", "worldwide_gross_income" becomes "Box office"
let KEYS_OF_INFO;

// Categories will be showed in html file.
const CATEGORY_NAMES = ["bestFilm", "action", "fantasy", "animation"];

// Number of images is displayed for each category.
const NB_IMAGES_PER_PAGE = 7;

// Each request realized, fetch 35 films for one chosen category.
let SIZE = 35;

let detailInfoUrls = {}; // To store all fetched url films which allow to access the detail film information.
let currentPositions = {}; // Mark the current fist image position displayed from the left to the right of the screen.
let imageIdModels = {}; // The model of image id which is defined for each category in index.html.
let nextUrls = {}; // Mark the url by category to can be continued fetching at the next time.

// Load page at the first time.
document.getElementsByTagName("body").onload = loadImages();

/**
 * Rename keys to display in the modal box as title of each information.
 */
function renameKeys(){
    let renamedKeys = {};
    for (let key of KEYS) {
        if (key.includes("_")) {
            key.replace("_", " ");
        }

        renamedKeys[key] = key.charAt(0).toUpperCase() + key.slice(1);
        if (key === "worldwide_gross_income"){
            renamedKeys[key] = "Box office";
        }
    }
    return renamedKeys;
}

/**
 * Initialize some declared parameters.
 */
function initializeParameters() {
	for (let category of CATEGORY_NAMES) {
		detailInfoUrls[category] = [];
		currentPositions[category] = 0; // Position of the first image from the left to the right.
		imageIdModels[category] = category + "Img"; // Model of an image id: actionImg => id: actionImg1, actionImg2, ect.
	}

	// Fetch by category and sorted by imdb score.
	nextUrls[CATEGORY_NAMES[0]] = "http://127.0.0.1:8000/api/v1/titles/?sort_by=-imdb_score"; // best film
	nextUrls[CATEGORY_NAMES[1]] = "http://127.0.0.1:8000/api/v1/titles/?genre=action&sort_by=-imdb_score"; // action
	nextUrls[CATEGORY_NAMES[2]] = "http://127.0.0.1:8000/api/v1/titles/?genre=fantasy&sort_by=-imdb_score"; // fantasy
	nextUrls[CATEGORY_NAMES[3]] = "http://127.0.0.1:8000/api/v1/titles/?genre=animation&sort_by=-imdb_score"; //animation

    KEYS_OF_INFO = renameKeys();
}

/**
 * Function is called when the page is loaded at the first time.
 */
async function loadImages() {
	try {
		initializeParameters();
		await showTheBestFilm();
		await showImagesOfAllCategories();
	} catch (err) {
		console.log(err);
	}
}

/**
 * Show the best film which has the best imdb score.
 */
async function showTheBestFilm() {
	try {
		let url = nextUrls[CATEGORY_NAMES[0]];
		let response = await fetch(url);
		let data = await response.json();
		let results = await data.results;
		let result = results[0]; // The first element is the best score.
		let imageUrl = result["image_url"];
		let filmUrl = result["url"];
		// Add text to image
		data = await getDetailInfo(filmUrl);
		let element = document.getElementById("theBestFilm");

		// Set or change some properties to the display of the best film.
		element.style.backgroundColor = "#2196F3";
		element.style.backgroundImage = "url(" + imageUrl + ")"; // The best film is used as the background here.

		// Add information to the display
		element = document.getElementById("title");
		element.innerHTML = data["title"];
		element = document.getElementById("description");
		element.innerHTML = data["description"];

		// Call the modal box when the button is clicked.
		let btn = document.getElementById("btn_theBestFilmImg");
		btn.onclick = async function() {
			await showModalBox(data);
		};
	} catch (err) {
		// catches errors
		console.log(err);
	}
}

/**
 * Fetch multiple pages to retrieve a list of urls where each url leads to the detail information for each film.
 * SIZE is the number of urls will be fetched. SIZE will be rounded by the available element on the fetched page.
 * e.g. each fetched page contains 5 elements, SIZE = 18 => SIZE after fetching will be the ((18 // 5) + 1)*5
 */
async function updateUrlsForDetailInfo(categoryName) {
	try {
		let url = nextUrls[categoryName];
		let nbOfItems = 0;
		while (url && nbOfItems < SIZE) {
			const res = await fetch(url);
			const data = await res.json();

			const results = data.results;
			for (let result of results) {
				let filmUrl = result["url"];
				detailInfoUrls[categoryName].push(filmUrl);
				nbOfItems++;
			}
			url = data.next;
		}
		// Mark and update the url for the next request on the same category.
		nextUrls[categoryName] = url;
	} catch (err) {
		console.log(err);
	}
}

/**
 * Build a "div" then add film information to display in the modal box.
 */
function addElementsToDiv(div, result, KEYS_OF_INFO) {
    for (const [key, renamedKey] of Object.entries(KEYS_OF_INFO)) {
		let tag = document.createElement("p");
		let info;
		if (result.hasOwnProperty(key) && result[key]) {
			info = renamedKey + ": " + result[key];
		} else {
			let noInfo = "Not available";
			info = renamedKey + ": " + noInfo;
		}
		let text = document.createTextNode(info);
		tag.appendChild(text);
		div.appendChild(tag);
	}
}

/**
 * Show film information in the modal box and handle the events (click, close).
 */
async function showInfo(result) {
	let modal = document.getElementById("myModal");
	modal.style.display = "block";

	let element = document.getElementById("modalBody");

	let newDiv = document.createElement("div");
	newDiv.setAttribute("id", "modalDiv");

	let img = new Image();
	img.src = result["image_url"];
	newDiv.appendChild(img);

	addElementsToDiv(newDiv, result, KEYS_OF_INFO); // see const KEYS_OF_INFO at the beginning of this script.

	element.appendChild(newDiv);

	// Get the <span> element that closes the modal
	let span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = "none";
		document.getElementById("modalDiv").remove();
	};

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
			document.getElementById("modalDiv").remove();
		}
	};
}

/**
 * Show detail information of a film in a modal box.
 */
async function showModalBox(data) {
	if (document.getElementById("modalDiv")) {
		document.getElementById("modalDiv").remove();
	}
	await showInfo(data);
}

/**
 * Retrieve data (type: json) from an url containing film id (e.g. "http://localhost:8000/api/v1/titles/9").
 * This data contains detail information of the corresponding film.
 */
async function getDetailInfo(url) {
	try {
		let response = await fetch(url);
		let data = await response.json();
		return data;
	} catch (err) {
		// Catches errors both in fetch and response.json.
		console.log(err);
	}
}

/**
 * Show a film image and add onclick function to show film information.
 */
async function showImage(filmUrl, imgId) {
	const data = await getDetailInfo(filmUrl);
	let imageUrl = data["image_url"];
	let img = document.getElementById(imgId);
	img.src = imageUrl;
	// Add event "onclick" to display film information in a modal box
	img.onclick = async function() {
		await showModalBox(data);
	};

	let btnId = "btn_" + imgId; // e.g. model: btn_bestFilmImg0
	let btn = document.getElementById(btnId);
	btn.onclick = async function() {
		await showModalBox(data);
	};
}

/**
 * Show a set of images via theirs id and theirs urls.
 */
async function showImagesById(imageIdModel, filmUrls) {
	try {
		let i = 0;
		for (let filmUrl of filmUrls) {
			let imgId = imageIdModel + i;
			await showImage(filmUrl, imgId);
			i++;
		}
	} catch (err) {
		//catches errors
		console.log(err);
	}
}

/**
 * Show images for a category at the first time loaded.
 */
async function showImagesByCategory(categoryName) {
	await updateUrlsForDetailInfo(categoryName);
	let filmUrls = detailInfoUrls[categoryName].slice(currentPositions[categoryName], currentPositions[categoryName] +
		NB_IMAGES_PER_PAGE);
	await showImagesById(imageIdModels[categoryName], filmUrls);

}

/**
 *Show images for all categories when the web page is loaded at the first time.
 */
async function showImagesOfAllCategories() {
	for (let categoryName of CATEGORY_NAMES) {
		await showImagesByCategory(categoryName);
	}
}

/**
 * Show next films (each time, show NB_IMAGES_PER_PAGE images, here NB_IMAGES_PER_PAGE = 7).
 */
async function next(categoryName, imageIdModel) {
	currentPositions[categoryName] += NB_IMAGES_PER_PAGE;
	let firstPosition = currentPositions[categoryName]; // First image position from the left to right.
	let filmUrls = detailInfoUrls[categoryName].slice(firstPosition, firstPosition + NB_IMAGES_PER_PAGE);
	await showImagesById(imageIdModel, filmUrls);
	/*
	 *There is no more image url in the storage, next films can not be showed.
	 *In this case, fetch more films and add/store them in detailInfoUrls.
	 */
	if (firstPosition + NB_IMAGES_PER_PAGE === detailInfoUrls[categoryName].length) {
		await updateUrlsForDetailInfo(categoryName);

	}
}

/**
 * Show previous films (each time, show NB_IMAGES_PER_PAGE images, here NB_IMAGES_PER_PAGE = 7).
 */
async function prev(categoryName, imageIdModel) {
	if (currentPositions[categoryName] >= NB_IMAGES_PER_PAGE) {
		currentPositions[categoryName] -= NB_IMAGES_PER_PAGE;
	}
	let firstPosition = currentPositions[categoryName]; // First image position from the left to right.
	let filmUrls = detailInfoUrls[categoryName].slice(firstPosition, firstPosition + NB_IMAGES_PER_PAGE);
	await showImagesById(imageIdModel, filmUrls);
}

/**
 * Show next films by detecting category via id of next button.
 */
async function nextFilms(clickedId) {
	let idBtn = clickedId; // this.id in html file.
	const words = idBtn.split('_');
	let categoryName = words[words.length - 1];
	let imageIdModel = categoryName + "Img";
	await next(categoryName, imageIdModel);
}

/**
 * Show previous films by detecting category via id of previous button.
 */
async function prevFilms(clickedId) {
	let idBtn = clickedId; // this.id in html file.
	const words = idBtn.split('_');
	let categoryName = words[words.length - 1];
	let imageIdModel = categoryName + "Img";
	await prev(categoryName, imageIdModel);
}