var currentStep = 0;

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
        createTruck(currentHallId, 
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
            if (tab[0].value > 6 || tab[0].value <= 0) {
                valid = false;
            }
			if (tab[1].value > 3 || tab[1].value <= 0) {
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
    document.getElementById("type").value = "cold";
    document.getElementById("radius").value = null;
}

function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

document.getElementById("nextBtn").addEventListener("click", nextStep);
