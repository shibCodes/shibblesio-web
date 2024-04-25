// Imports
import projectData from "./data/projects.json";
import { initialiseProjects, setActiveProject } from "./assets/scripts/projects";

window.addEventListener("resize", debounce( handleResize, 300 ));

// Plugins
gsap.registerPlugin(Draggable);

// Initialise
initialiseProjects(projectData);
handleResize();

// Variables
const overlapThreshold = "25%";
let consoleElement = document.getElementById("console-front");
let consoleFrontElement = document.getElementById("console-front");
let consoleBackElement = document.getElementById("console-back");
let consoleBoundingClientRect = consoleElement.getBoundingClientRect();
let consolePositionX = consoleElement.offsetLeft + (consoleElement.clientWidth / 2) + 13;
let consolePositionY = consoleBoundingClientRect.top - (consoleElement.clientHeight);
let cartridges = document.querySelectorAll(".cartridge");
let showMeMoreButton = document.getElementById("check-it");
let closeDetailsButton = document.getElementById("close-details");
let animatingPlugOutCartridge = false;
let activeProject = false;

let cartridgeDraggables = Draggable.create(cartridges, {
    bounds: window,
    onDrag: function(e) {

        let activeCartridge = getActiveCartridge();
        let thisCartridge = parseInt(e.target.getAttribute("index"));
        let activeCartridgeIsThisCartridge = activeCartridge === thisCartridge;
        let element = document.querySelector("[index='" + activeCartridge + "']");

        if (this.hitTest("#console-front", overlapThreshold)) {

            consoleFrontElement.classList.add("hit");
            consoleBackElement.classList.add("hit");
            e.target.classList.add("hit");

            if (activeCartridge != null && !animatingPlugOutCartridge && !activeCartridgeIsThisCartridge) {  
                animatePlugOutCartridgeBegin(element);
            }

        }
        else {

            e.target.classList.remove("hit");
            consoleFrontElement.classList.remove("hit");
            consoleBackElement.classList.remove("hit");

            if (activeCartridge != null && animatingPlugOutCartridge && !activeCartridgeIsThisCartridge) {
                animatePlugInCartridgeEnd(element);
            }

        }
    },
    onDragEnd: function(e) {

        let cartridgeElement = e.target;
        cartridgeElement.classList.remove("dragging");
        consoleFrontElement.classList.remove("hit");
        consoleBackElement.classList.remove("hit");

        if (this.hitTest("#console-front", overlapThreshold)) {
            
            // If there's already an active cartridge then remove it
            let activeCartridge = getActiveCartridge();
            if (activeCartridge != null) {
                let element = document.querySelector("[index='" + activeCartridge + "']");
                animateReturnCartridgeToBox(element);
            }
            
            // Animate the current cartridge into the Nintendo
            animatePlugInCartridgeBegin(cartridgeElement);

        }
        else {
            // Animate the current cartridge back into the box
            animateReturnCartridgeToBox(cartridgeElement);

        }

    },
    onPressInit: function(e) {
        let element = e.target;
        element.classList.add("dragging");
        //initialiseCartridgeStartPosition(element, this.startX, this.startY);
    }
});

cartridgeDraggables.forEach((cartridge) => {
    cartridge.addEventListener("click", handleCartridgeClick)
});

showMeMoreButton.addEventListener("click", handleShowMoreClick);
closeDetailsButton.addEventListener("click", handleCloseDetailsClick);

function animatePlugInCartridgeBegin(element) {

    if (element) {

        let cartridgeHalfWidth = element.clientWidth / 2;

        let relativeX = element.getAttribute("x");
        let relativeY = element.getAttribute("y");
    
        let plugInCartridgeBegin = gsap.to(element, 
            { 
                x: (consolePositionX - cartridgeHalfWidth) - relativeX, 
                y: consolePositionY - relativeY,  
                ease: "bounce",
                duration: 0.5,
            }
        );

        plugInCartridgeBegin.eventCallback("onComplete", animatePlugInCartridgeEnd, [element]);

    }

}

function animatePlugInCartridgeEnd(element) {

    if (element) {

        let relativeY = element.getAttribute("y");

        let plugInCartridgeEnd = gsap.to(element, 
            { 
                y: (consolePositionY - relativeY + element.clientHeight),
                ease: "bounce",
                duration: 0.8,
            }
        );
        
    
        let elementIndex = element.getAttribute("index");
        projectData[elementIndex].active = true;
        element.classList.add("active");
        element.classList.remove("hit");
        setActiveProject(projectData[elementIndex]);
        activeProject = projectData[elementIndex];
        animatingPlugOutCartridge = false;

    }

}

function animatePlugOutCartridgeBegin(element) {  

    if (element) {

        let relativeY = element.getAttribute("y");

        animatingPlugOutCartridge = true;

        let plugOutCartridgeBegin = gsap.to(element, 
            { 
                y:  consolePositionY - relativeY,  
                ease: "bounce",
                duration: 0.5,
            }
        );

    }
}

function animateReturnCartridgeToBox(element) {

    if (element) {
        
        let index = element.getAttribute("index");
        let project = projectData[index];

        gsap.to(element, { x: 0, y: 0,  ease: "bounce", duration: 1.5 });

        project.active = false;
        element.classList.remove("active");
        setActiveProject(false);
        activeProject = false;
    }

}


function getActiveCartridge() {

    let activeCartridge = null;

    for (let i = 0; i < projectData.length; i++) {
        if (projectData[i].active) {
            activeCartridge = i;
            break;
        }
    }

    return activeCartridge;

}

function handleCartridgeClick(e) {

    let cartridgeElement = e.target;
    let activeCartridge = getActiveCartridge();
    let thisCartridge = parseInt(cartridgeElement.getAttribute("index"));
    let activeCartridgeIsThisCartridge = activeCartridge === thisCartridge;
    let activeCartridgeElement = document.querySelector("[index='" + activeCartridge + "']");

    //initialiseCartridgeStartPosition(cartridgeElement, this.x, this.y);

    // if active cartridge then:
    // - if active cart == this one then just remove and be done
    // otherwise remove and animate the current cart into the nintentdo

    // If there's already an active cartridge then remove it
    
    if (activeCartridge != null && activeCartridgeIsThisCartridge) {
        animateReturnCartridgeToBox(cartridgeElement);
    }
    else if (activeCartridge != null && !activeCartridgeIsThisCartridge) {
        // Return active cartridge to the box
        animateReturnCartridgeToBox(activeCartridgeElement);
        // Animate the current cartridge into the Nintendo
        animatePlugInCartridgeBegin(cartridgeElement);
    }
    else if (activeCartridge == null) {
        // Animate the current cartridge into the Nintendo
        animatePlugInCartridgeBegin(cartridgeElement);
    }
    
}

function calculateCartridgePositions() {

    let cartridges = document.querySelectorAll(".cartridge");

    cartridges.forEach((cartridgeElement, index) => {

        let boundingRect = cartridgeElement.getBoundingClientRect();
        let leftPosition = boundingRect.left;
        let topPosition = boundingRect.top;

        cartridgeElement.setAttribute("x", leftPosition);
        cartridgeElement.setAttribute("y", topPosition);

    });
}

function calculateConsolePosition() {
    let consoleElement = document.getElementById("console-front");
    let consoleBoundingClientRect = consoleElement.getBoundingClientRect();
    let x = consoleElement.offsetLeft + (consoleElement.clientWidth / 2) + 13;
    let y = consoleBoundingClientRect.top - (consoleElement.clientHeight);

    consolePositionX = x;
    consolePositionY = y;
}

function debounce(func, time) {

    var time = time || 100; // 100 by default if no param
    var timer;
    return function(event){
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, time, event);
        showResizeOverlay();
    };

}

function showResizeOverlay() {
    let resizeOverlay = document.getElementById("window-resizing");
    resizeOverlay.classList.add("resizing");

    // If there's already an active cartridge then remove it
    let activeCartridge = getActiveCartridge();
    if (activeCartridge != null) {
        let element = document.querySelector("[index='" + activeCartridge + "']");
        animateReturnCartridgeToBox(element);
    }
}

function handleResize() {
    calculateCartridgePositions();
    calculateConsolePosition();
    let resizeOverlay = document.getElementById("window-resizing");
    resizeOverlay.classList.remove("resizing");
}

function handleShowMoreClick() {
    
    let detailPopoverElement = document.getElementById("detail-popover");
    let projectCopyElement = document.getElementById("project-copy");

    projectCopyElement.innerHTML = activeProject.description;
    detailPopoverElement.classList.add("visible");


}

function handleCloseDetailsClick() {

    let detailPopoverElement = document.getElementById("detail-popover");
    let slideVideoElement = document.getElementById("slide-video");

    if (detailPopoverElement) {
        detailPopoverElement.classList.remove("visible");
    }

    if (slideVideoElement) {
        slideVideoElement.pause();
    }

}
