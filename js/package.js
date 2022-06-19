var amountOfPackageIds = 0;

class Package {
	constructor(x, y) {
		this.id = amountOfPackageIds;
		this.x = x;
		this.y = y;
		
		this.width = 48;
		this.height = 48;
		this.shape = generatePackageShape();
		this.color = getRandomPackageColor();
		this.isBeingDragged = false;
		this.slottedInTruck = false;
		this.slotId = -1;
		
		amountOfPackageIds++;
	}
	
	draw(ctx) {
		let packageX = this.x;
		let packageY = this.y;
		let packageWidth = this.width;
		let packageHeight = this.height;
		let packageColor = this.color;
		
		this.shape.forEach(function(vector) {
			let x = packageX - packageWidth*.5 + vector.x*packageWidth*.25;
			let y = packageY - packageHeight*.5 + vector.y*packageHeight*.25;
			
			// black outline
			ctx.fillStyle = "black";
			ctx.fillRect(x, y, packageWidth*.25, packageHeight*.25);
			
			// colored fill
			ctx.fillStyle = packageColor;
			ctx.fillRect(x + 1, y + 1, packageWidth*.25 - 2, packageHeight*.25 - 2);
		});
	}
}

var tetrominoShapes = [
	[ // straight hori
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 1, y: 2},
		{x: 1, y: 3}
	],
	[ // straight vert
		{x: 0, y: 1},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 3, y: 1}
	],
	[ // square
		{x: 1, y: 1},
		{x: 1, y: 2},
		{x: 2, y: 1},
		{x: 2, y: 2}
	],
	[ // T hori
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 1, y: 2},
		{x: 2, y: 1}
	],
	[ // T vert
		{x: 0, y: 1},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 1, y: 2}
	],
	[ // L hori
		{x: 0, y: 1},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 2, y: 2}
	],
	[ // L vert
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 1, y: 2},
		{x: 2, y: 2}
	],
	[ // skew hori
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 2, y: 2}
	],
	[ // skew vert
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 2, y: 2}
	]
]

var packageColors = [
	"green",
	"red",
	"blue",
	"yellow",
	"purple",
	"orange",
	"lightblue"
]

function generatePackageShape() {
	let randomShape = tetrominoShapes[Math.floor(Math.random() * tetrominoShapes.length)];
	
	// copy shape
	let newShape = [];
	randomShape.forEach(function(vector) {
		newShape.push({x: vector.x, y: vector.y})
	});
	
	if (Math.random() <= .5) { // 50% chance
		mirrorFlipXShape(newShape);
	}
	if (Math.random() <= .5) { // 50% chance
		mirrorFlipYShape(newShape);
	}
	
	return newShape;
}

function mirrorFlipXShape(shape) {
	shape.forEach(function(vector) {
		vector.x = Math.abs(vector.x - 5) - 2;
	});
}

function mirrorFlipYShape(shape) {
	shape.forEach(function(vector) {
		vector.y = Math.abs(vector.y - 5) - 2;
	});
}

function getRandomPackageColor() {
	return packageColors[Math.floor(Math.random() * packageColors.length)];
}

// DRAG AND DROP PACKAGES //

var pickedUpPackage = null;

function onMouseDown(e) {
	if (pickedUpPackage === null) {
		let canvasBoundingClientRect = canvas.getBoundingClientRect();
		let mouseX = parseInt(e.clientX - canvasBoundingClientRect.left);
		let mouseY = parseInt(e.clientY - canvasBoundingClientRect.top);
		
		halls.forEach(function(hall) {
			if (hall.id == currentHallId) {
				hall.packages.forEach(function(truckPackage) {
					// if mouse position is on top of a package pick it up
					if (pickedUpPackage === null && Math.abs(mouseX - truckPackage.x) <= truckPackage.width*.5 
							&& Math.abs(mouseY - truckPackage.y) <= truckPackage.height*.5 ) {
						e.preventDefault();
						e.stopPropagation();
						
						pickUpPackage(truckPackage, mouseX, mouseY);
					}
				});
			}
		});
	}
}

function onMouseMove(e) {
	// move package if it is picked up
	if (pickedUpPackage !== null) {
		e.preventDefault();
        e.stopPropagation();
		
		let canvasBoundingClientRect = canvas.getBoundingClientRect();
		let mouseX = parseInt(e.clientX - canvasBoundingClientRect.left);
		let mouseY = parseInt(e.clientY - canvasBoundingClientRect.top);
		
		pickedUpPackage.x = mouseX;
		pickedUpPackage.y = mouseY;
	}
}

function onMouseUp(e) {
	// drop package on mouse up
	if (pickedUpPackage !== null) {
		e.preventDefault();
        e.stopPropagation();
		
		let canvasBoundingClientRect = canvas.getBoundingClientRect();
		let mouseX = parseInt(e.clientX - canvasBoundingClientRect.left);
		let mouseY = parseInt(e.clientY - canvasBoundingClientRect.top);
		
		dropPackage(mouseX, mouseY);
	}
}

canvas.onmousedown = onMouseDown;
canvas.onmousemove = onMouseMove;
canvas.onmouseup = onMouseUp;

function pickUpPackage(truckPackage, x, y) {
	pickedUpPackage = truckPackage;
	
	truckPackage.x = x;
	truckPackage.y = y;
	truckPackage.isBeingDragged = true;
	truckPackage.slottedInTruck = false;
}

function dropPackage(x, y) {
	if (pickedUpPackage) {
		halls.forEach(function(hall) {
			if (hall.id == currentHallId) {
				let packageInTruck = false;
				
				hall.trucks.forEach(function(truck) {
					if (x >= truck.x && x <= truck.x + truck.width
							&& y >= truck.y && y <= truck.y + truck.length) {
						
						let target = truck.getPackageTargetLocation();
						pickedUpPackage.x = target.x;
						pickedUpPackage.y = target.y;
						pickedUpPackage.isBeingDragged = false;
						
						if (truck.addPackage(pickedUpPackage)) {
							packageInTruck = true;
						}
					}
				});
				
				if (!packageInTruck) {
					hall.destroyPackage(pickedUpPackage);
				}
				
				pickedUpPackage = null;
			}
		});
	}
}