let temperature = 0;
let condition = "";

function fetchWeather(city) {
    let key = "adf361d7c7a840f58bd145207221206";
    let weerElement = document.getElementById("weersbeschrijving");

    fetch("http://api.weatherapi.com/v1/current.json?key=" + key + "&q=" + city + "&aqi=no")
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

function searchCity() {
    fetchWeather(document.getElementById("city").value);
}

window.onload = () => {
    fetchWeather("Amsterdam");
} 