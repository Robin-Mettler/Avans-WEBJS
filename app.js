var currentStep = 0;
let freeSlots = [0, 1, 2, 3];

showStep(currentStep);

function showStep(n) {
    var tabs = document.getElementsByClassName("tab");
    tabs[n].style.display = "block";

    if (n == (tabs.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Volgende";
    }
}

function nextStep() {
    var tabs = document.getElementsByClassName("tab");
    if (!validateForm()) return false;
    tabs[currentStep].style.display = "none";
    currentStep++;
    if (currentStep >= tabs.length) {
        createTruck();
        resetForm();
    }
    showStep(currentStep);
}

function validateForm() {
    var tabs, tab, i, valid = true;
    var tabs = document.getElementsByClassName("tab");
    var tab = tabs[currentStep].getElementsByTagName("input");

    for (i = 0; i < tab.length; i++) {
        if (currentStep == 0) {
            if (tab[i].value > 4) {
                valid = false;
            }
        }

        if (tab[i].value == "") {
            valid = false;
        }
    }
    return valid;
}

function createTruck() {
    let truck = {
        lengte: document.getElementById("length").value,
        breedte: document.getElementById("width").value,
        interval: document.getElementById("arrival_interval").value,
        type: document.getElementById("type").value,
        radius: document.getElementById("radius").value
    };

    drawTruck(truck);
}

function resetForm() {
    currentStep = 0;
    document.getElementById("length").value = null;
    document.getElementById("width").value = null;
    document.getElementById("arrival_interval").value = null;
    document.getElementById("type").value = null;
    document.getElementById("radius").value = null;
}

function drawTruck(truck) {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");

    let truckBreedte = truck.breedte * 75;
    let trucklengte = truck.lengte * 38;
    let color = truckColor(truck.type);

    let slot = freeSlots.shift();
    let x = 10;
    let y = 250 * slot + 10;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, truckBreedte, trucklengte);
}

function truckColor(type) {
    let color = null;
    switch(type) {
        case 'cold':
            color = "rgb(204,255,255)";
            break;
        case 'fragile':
            color = "rgb(255,204,204)";
            break;
        case 'general':
            color = "rgb(224,224,224)";
            break;
        case 'pallets':
            color = "rgb(255,229,204)";
            break;
        case 'fastdelivery':
            color = "rgb(255,255,204)";
            break;
    }
    return color;
}

 
