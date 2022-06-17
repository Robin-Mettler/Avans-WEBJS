let key = "adf361d7c7a840f58bd145207221206";
let temperature = 0;
let condition = "";

function getWeatherInformation(city) {
    let weerElement = document.getElementById("weersbeschrijving");

    fetch("http://api.weatherapi.com/v1/current.json?key=" + key + "&q=" + city + "&aqi=no&lang=nl")
    .then(resp => resp.json())
    .then(data => {
        temperature = data.current.temp_c;
        condition = data.current.condition.text;
        weerElement.innerText = "Weer in " + city + " : de temperatuur is " + temperature + " graden en het is " + condition;
    })
    .catch( () => {
        console.log("Fout bij het ophalen van het weer");
    });
}

function allowedToLeave(type, city) {
    fetch("http://api.weatherapi.com/v1/current.json?key=" + key + "&q=" + city + "&aqi=no&lang=nl")
    .then(resp => resp.json())
    .then(data => {
        temperature = data.current.temp_c;
        condition = data.current.condition.text;
    })
    .catch( () => {
        console.log("Fout bij het ophalen van de temperatuur");
    });

    if (temperature > 35 && truck.type == "cold") {return false;}
    if (truck.type == "fragile" && (condition == "Sneeuw" || condition == "Regen")) {return false;}
    return true;
}

function searchCity() {
    getWeatherInformation(document.getElementById("city").value);
}

window.onload = () => {
    getWeatherInformation("Amsterdam");
} 