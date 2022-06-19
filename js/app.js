// UPDATE LOGIC //

let updateRate = 20;

function update() {
	halls.forEach(function(hall) {
		hall.addPackage();
		
		hall.conveyers.forEach(function(conveyer) {
			conveyer.update();
		});
		hall.trucks.forEach(function(truck) {
			truck.update();
		});
	});
	
	draw(currentHallId);
}

// CANVAS //

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let canvasWidth = 1200;
let canvasHeight = 800;

function draw(hallId) {
	halls.forEach(function(hall) {
		if (hall.id == hallId) {
			clearCanvas()
			
			hall.trucks.forEach(function(truck) {
				truck.draw(ctx);
			});
			hall.conveyers.forEach(function(conveyer) {
				conveyer.draw(ctx);
			});
			hall.packages.forEach(function(truckPackage) {
				truckPackage.draw(ctx);
			});
		}
	});
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

setInterval(update, updateRate)