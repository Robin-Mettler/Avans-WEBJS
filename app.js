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
        // Submit form
        return false;
    }
    showStep(currentStep);
}

function validateForm() {
    var tabs, tab, i, valid = true;
    var tabs = document.getElementsByClassName("tab");
    var tab = tabs[currentStep].getElementsByTagName("input");

    for (i = 0; i < tab.length; i++) {
        if (tab[i].value == "") {
            valid = false;
        }
    }

    return valid;
}
