/* ==========================================
   16 ORCHARD VIEW RENTAL APPLICATION
   APPLICATION SCRIPT
========================================== */

let applicationNumber = null;
let currentStage = 0;

const stageGroups = [
    [0],
    [1, 2],
    [3, 4],
    [5, 6, 7, 8],
    [9]
];

function createApplicationNumber(){
    if(applicationNumber){
        return applicationNumber;
    }

    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    applicationNumber = `ORCH-${year}-${random}`;
    return applicationNumber;
}

function getSubmissionDate(){
    const today = new Date();
    return today.toLocaleDateString() + " " + today.toLocaleTimeString();
}

function friendlyLabel(key){
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function collectApplicationData(){
    const form = document.getElementById("rentalApplication");
    const data = {};

    for(const field of form.elements){
        if(!field.name){
            continue;
        }

        if(field.type === "checkbox"){
            data[field.name] = field.checked ? "Accepted" : "Not Accepted";
        }
        else if(field.type === "radio"){
            if(field.checked){
                data[field.name] = field.value;
            }
        }
        else {
            data[field.name] = field.value;
        }
    }

    data.applicationNumber = createApplicationNumber();
    data.submissionDate = getSubmissionDate();
    return data;
}

function createReview(){
    const data = collectApplicationData();
    const summary = document.getElementById("applicationSummary");
    summary.innerHTML = "";

    const importantOrder = [
        "applicationNumber",
        "firstName",
        "lastName",
        "email",
        "homePhone",
        "moveInDate",
        "employer",
        "income",
        "creditConsent",
        "declaration",
        "creditAuthorization",
        "applicantSignature",
        "applicantSignatureDate"
    ];

    const orderedKeys = [
        ...importantOrder,
        ...Object.keys(data).filter(key => !importantOrder.includes(key) && key !== "submissionDate"),
        "submissionDate"
    ];

    orderedKeys.forEach(key => {
        const value = data[key];
        if(value === undefined || value === null || String(value).trim() === ""){
            return;
        }

        const row = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = friendlyLabel(key) + ": ";
        row.appendChild(strong);
        row.appendChild(document.createTextNode(String(value)));
        summary.appendChild(row);
    });
}

function getSections(){
    return Array.from(document.querySelectorAll("#rentalApplication .form-step"));
}

function validateStage(stageIndex){
    const sections = getSections();
    const sectionIndexes = stageGroups[stageIndex] || [];

    for(const sectionIndex of sectionIndexes){
        const section = sections[sectionIndex];
        if(!section){
            continue;
        }

        const requiredFields = Array.from(section.querySelectorAll("[required]"));
        for(const field of requiredFields){
            if(!field.checkValidity()){
                field.reportValidity();
                return false;
            }
        }
    }

    return true;
}

function renderStage(){
    const sections = getSections();
    const visibleIndexes = new Set(stageGroups[currentStage] || []);

    sections.forEach((section, index) => {
        section.classList.toggle("active", visibleIndexes.has(index));
    });

    document.querySelectorAll(".progress-step").forEach((step, index) => {
        step.classList.toggle("active", index === currentStage);
        step.classList.toggle("complete", index < currentStage);
    });

    document.querySelectorAll(".wizard-navigation").forEach(nav => nav.remove());

    const lastVisibleIndex = Math.max(...(stageGroups[currentStage] || [0]));
    const anchorSection = sections[lastVisibleIndex];

    if(anchorSection && currentStage < stageGroups.length - 1){
        const nav = document.createElement("div");
        nav.className = "wizard-navigation";

        if(currentStage > 0){
            const back = document.createElement("button");
            back.type = "button";
            back.className = "secondary-button";
            back.textContent = "Back";
            back.addEventListener("click", () => {
                currentStage--;
                renderStage();
                window.scrollTo({top: 0, behavior: "smooth"});
            });
            nav.appendChild(back);
        }

        const next = document.createElement("button");
        next.type = "button";
        next.className = "primary-button";
        next.textContent = currentStage === stageGroups.length - 2 ? "Review Application" : "Continue";
        next.addEventListener("click", () => {
            if(!validateStage(currentStage)){
                return;
            }

            currentStage++;
            if(currentStage === stageGroups.length - 1){
                createReview();
            }
            renderStage();
            window.scrollTo({top: 0, behavior: "smooth"});
        });
        nav.appendChild(next);
        anchorSection.appendChild(nav);
    }
    else if(anchorSection && currentStage === stageGroups.length - 1){
        const submitButton = anchorSection.querySelector(".submit-button");
        if(submitButton){
            const nav = document.createElement("div");
            nav.className = "wizard-navigation review-navigation";

            const back = document.createElement("button");
            back.type = "button";
            back.className = "secondary-button";
            back.textContent = "Back to Edit";
            back.addEventListener("click", () => {
                currentStage--;
                renderStage();
                window.scrollTo({top: 0, behavior: "smooth"});
            });

            submitButton.parentNode.insertBefore(nav, submitButton);
            nav.appendChild(back);
        }
    }
}

function ensureJsPDFLibrary(){
    if(window.jspdf && window.jspdf.jsPDF){
        return;
    }

    if(document.querySelector('script[data-orms-jspdf="true"]')){
        return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.dataset.ormsJspdf = "true";
    document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", () => {
    createApplicationNumber();
    ensureJsPDFLibrary();
    renderStage();
});

document.getElementById("rentalApplication").addEventListener("submit", async function(event){
    event.preventDefault();

    if(!this.checkValidity()){
        alert("Please complete all required fields before submitting.");
        this.reportValidity();
        return;
    }

    const submitButton = this.querySelector(".submit-button");
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
        createReview();
        const result = await sendApplicationEmail();

        if(result !== false){
            try {
                downloadPDF();
            }
            catch(pdfError){
                console.warn("PDF copy could not be downloaded:", pdfError);
            }

            alert("Your rental application has been submitted successfully. A PDF copy will also be downloaded for your records.");
            submitButton.textContent = "Application Submitted";
            submitButton.classList.add("submitted");
            return;
        }

        throw new Error("Email submission failed");
    }
    catch(error){
        console.error(error);
        alert("There was an error submitting your application. Please try again.");
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});