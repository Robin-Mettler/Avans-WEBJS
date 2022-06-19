let key = "adf361d7c7a840f58bd145207221206";
let temperature = 0;
let condition = "";

async function getWeatherInformation(city) {
    let stadElement = document.getElementById("weerStad");
    let gradenElement = document.getElementById("weerGraden");
    let conditieElement = document.getElementById("weerConditie");

    fetch("http://api.weatherapi.com/v1/current.json?key=" + key + "&q=" + city + "&aqi=no&lang=nl")
    .then(resp => resp.json())
    .then(data => {
        temperature = data.current.temp_c;
        condition = data.current.condition.text;

        stadElement.innerText = city;
        gradenElement.innerText = temperature;
        conditieElement.innerText = condition;
    })
    .catch( () => {
        console.log("Fout bij het ophalen van het weer");
    });
}

function allowedToLeaveDueToWeather(type, city) {
    fetch("http://api.weatherapi.com/v1/current.json?key=" + key + "&q=" + city + "&aqi=no&lang=nl")
    .then(resp => resp.json())
    .then(data => {
        temperature = data.current.temp_c;
        condition = data.current.condition.text;
    })
    .catch( () => {
        console.log("Fout bij het ophalen van de temperatuur");
    });

    if (temperature > 35 && type == "cold") {return false;}
    if (type == "fragile" && (condition == "Sneeuw" || condition == "Regen")) {return false;}
    return true;
}

function searchCity() {
    getWeatherInformation(document.getElementById("city").value);
}

window.onload = () => {
    getWeatherInformation("Amsterdam");
	
	document.getElementById("weather-button").addEventListener("click", searchCity);
} 