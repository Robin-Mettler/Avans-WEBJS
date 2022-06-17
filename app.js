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
        createTruck(0, 
			document.getElementById("length").value,
			document.getElementById("width").value,
			document.getElementById("arrival_interval").value,
			document.getElementById("type").value,
			document.getElementById("radius").value
		);
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

function resetForm() {
    currentStep = 0;
    document.getElementById("length").value = null;
    document.getElementById("width").value = null;
    document.getElementById("arrival_interval").value = null;
    document.getElementById("type").value = null;
    document.getElementById("radius").value = null;
}

// HALLS //

var halls = [];
var currentHallId = 0;

class Hall {
	constructor(id) {
		this.id = id;
		this.trucks = [];
	}
	
	addTruck(truck) {
		this.trucks.push(truck);
	}
}

function createHall() {
	halls.push(new Hall(halls.length))
}

createHall();

// TRUCKS //

class Truck {
	constructor(length, width, interval, type, radius) {
		this.length = length;
		this.width = width;
		this.interval = interval;
		this.type = type;
		this.radius = radius;
		
		this.color = truckColor(this.type);
		this.slot = freeSlots.shift();
		this.y = 10;
		this.x = 250 * this.slot + 10;

        if (allowedToLeave(type, document.getElementById("city").value)) {
            document.getElementById("send"+this.slot).disabled = false;
        }
	}
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

function createTruck(hallId, length, width, interval, type, radius) {
	let truck = new Truck(
        length,
        width,
        interval,
        type,
        radius
    );
	
	halls.forEach(function(hall) {
		if (hall.id == hallId) {
			hall.addTruck(truck);
		}
	});
}

function sendTruckAway() {
    
}

// UPDATE LOGIC //

let updateRate = 100;

function update() {
	draw(currentHallId);
}

// CANVAS //

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let canvasWidth = 1200;
let canvasHeight = 1020;

function draw(hallId) {
	halls.forEach(function(hall) {
		if (hall.id == hallId) {
			clearCanvas()
			
			hall.trucks.forEach(function(truck) {
				drawTruck(truck);
			});
		}
	});
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function drawTruck(truck) {
    let truckLength = truck.width * 75;
    let truckWidth = Math.round(truck.length * 37.5);

    ctx.fillStyle = truck.color;
    ctx.fillRect(truck.x, truck.y, truckWidth, truckLength);
}

setInterval(update, updateRate)