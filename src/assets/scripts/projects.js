export function initialiseProjects(projectData) {

    let cartridgeHolderElement = document.getElementById("console-cartridges-wrap");
    let cartridgeLeftHolderElement = document.getElementById("cartridges-left");
    let cartridgeRightHolderElement = document.getElementById("cartridges-right");
    
    if (projectData && cartridgeLeftHolderElement && cartridgeRightHolderElement) {

        projectData.forEach((project, index) => {

            let cartridgeElement = document.createElement("button");
            cartridgeElement.classList.add("cartridge");
            cartridgeElement.setAttribute("index", index);
            cartridgeElement.ariaLabel = project.title;

            if (index < 3) {
                cartridgeLeftHolderElement.appendChild(cartridgeElement);
            }
            else if (index > 2) {
                cartridgeRightHolderElement.appendChild(cartridgeElement);
            }

            
            let boundingRect = cartridgeElement.getBoundingClientRect();
            let leftPosition = boundingRect.left;
            let topPosition = boundingRect.top;

            cartridgeElement.setAttribute("x", leftPosition);
            cartridgeElement.setAttribute("y", topPosition);

        });

    }

}

export function setActiveProject(project) {

    let tellyTextWrapElement = document.getElementById("telly-text");
    let tellyTitleElement = document.getElementById("telly-title-copy");
    let tellyImages = document.querySelectorAll(".image");
    let tellyImageWrapElement = document.getElementById("telly-image-wrap");

    if (tellyTitleElement) {
        
        if (project) {
            tellyTextWrapElement.classList.add("active");
            tellyTitleElement.innerHTML = "<h3>" + project.title + "</h3><span>" + project.shortie + "</span>";
            if (project.slides) { 
                setProjectSlides(project); 
            }
            else {
                let sliderElement = document.getElementById("slider");
                sliderElement.innerHTML = "";
            }
            tellyImages.forEach((image) => {
                let projectID = image.getAttribute("data-project");
                if (projectID == project.id) {
                    image.classList.remove("hide");
                }
            });
        }
        else {
            tellyTextWrapElement.classList.remove("active");
            tellyTitleElement.innerHTML = "Tap or drag a project!<br>✧・ﾟ:*(= ФェФ=)*:・ﾟ✧";
            tellyImages.forEach((image) => {
                image.classList.add("hide");
            });
        }
        
    }

}

function setProjectSlides(project) {

    let sliderElement = document.getElementById("slider");

    sliderElement.innerHTML = "";

    let swiperDiv = document.createElement("div");
    swiperDiv.classList.add("swiper");

    let swiperWrapperDiv = document.createElement("div");
    swiperWrapperDiv.classList.add("swiper-wrapper");

    project.slides.forEach((slide) => {
        let swiperSlideDiv = document.createElement("div");
        swiperSlideDiv.classList.add("swiper-slide");
        
        if (!slide.video) {
            let slideImage = document.createElement("img");
            slideImage.src = slide.src;
            slideImage.alt = slide.alt;
            slideImage.title = slide.alt;
            swiperSlideDiv.appendChild(slideImage);
        }
        else {
            let slideVideo = document.createElement("video");
            slideVideo.id = "slide-video";
            slideVideo.width = 320;
            slideVideo.height = 240;
            slideVideo.controls = true;
            let slideVideoSource = document.createElement("source");
            slideVideoSource.src = slide.src;
            slideVideoSource.type = "video/mp4";
            slideVideo.appendChild(slideVideoSource);
            swiperSlideDiv.appendChild(slideVideo);
        }
        
        swiperWrapperDiv.appendChild(swiperSlideDiv);
    });

    let swiperButtonPrev = document.createElement("div");
    let swiperButtonNext = document.createElement("div");
    swiperButtonPrev.classList.add("swiper-button-prev");
    swiperButtonNext.classList.add("swiper-button-next");

    let swiperPagination = document.createElement("div");
    swiperPagination.classList.add("swiper-pagination");

    swiperDiv.appendChild(swiperWrapperDiv);
    swiperDiv.appendChild(swiperButtonPrev);
    swiperDiv.appendChild(swiperButtonNext);
    swiperDiv.appendChild(swiperPagination);

    sliderElement.appendChild(swiperDiv);

    const swiper = new Swiper('.swiper', {
        speed: 400,
        spaceBetween: 100,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
        }
    });

    swiper.on('slideChange', function() {
        let slideVideoElement = document.getElementById("slide-video");
        if (slideVideoElement) {
            slideVideoElement.pause();
        }
    });

}