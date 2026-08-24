/* ==========================================
   16 ORCHARD VIEW RENTAL APPLICATION
   APPLICATION SCRIPT
========================================== */

let applicationNumber = null;
let currentStage = 0;

const ORMS_APPLICATIONS_API = "https://orms-api.16orchardviewdr.workers.dev/api/applications";
const stageGroups = [[0],[1,2],[3,4],[5,6,7,8],[9]];

function createApplicationNumber(){
    if(applicationNumber) return applicationNumber;
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
    return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function collectApplicationData(){
    const form = document.getElementById("rentalApplication");
    const data = {};
    for(const field of form.elements){
        if(!field.name) continue;
        if(field.type === "checkbox") data[field.name] = field.checked ? "Accepted" : "Not Accepted";
        else if(field.type === "radio") { if(field.checked) data[field.name] = field.value; }
        else data[field.name] = field.value;
    }
    data.applicationNumber = createApplicationNumber();
    data.submissionDate = getSubmissionDate();
    return data;
}

async function sendApplicationToOrms(data){
    const payload = {
        ...data,
        propertyAddress: "16 Orchard View Drive"
    };

    const response = await fetch(ORMS_APPLICATIONS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    let result = {};
    try { result = await response.json(); } catch { result = {}; }

    // A duplicate means ORMS already received this exact application number.
    // Treat that as safe success so an applicant can retry if EmailJS failed.
    if(response.status === 409 && result.applicationNumber === data.applicationNumber){
        return { success: true, duplicate: true, applicationId: result.applicationId };
    }

    if(!response.ok || result.success !== true){
        const message = result.error || "ORMS application intake failed.";
        const details = Array.isArray(result.details) ? ` ${result.details.join(" ")}` : "";
        throw new Error(message + details);
    }

    return result;
}

function createReview(){
    const data = collectApplicationData();
    const summary = document.getElementById("applicationSummary");
    summary.innerHTML = "";
    const importantOrder = ["applicationNumber","firstName","lastName","email","homePhone","moveInDate","employer","income","declaration","creditAuthorization","applicantSignature","applicantSignatureDate"];
    const orderedKeys = [...importantOrder,...Object.keys(data).filter(key => !importantOrder.includes(key) && key !== "submissionDate"),"submissionDate"];
    orderedKeys.forEach(key => {
        const value = data[key];
        const displayValue = value === undefined || value === null ? "" : String(value).trim();
        if(displayValue === "" || displayValue.toLowerCase() === "select") return;
        const row = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = friendlyLabel(key) + ": ";
        row.appendChild(strong);
        row.appendChild(document.createTextNode(displayValue));
        summary.appendChild(row);
    });
}

function getSections(){ return Array.from(document.querySelectorAll("#rentalApplication .form-step")); }

function validateStage(stageIndex){
    const sections = getSections();
    for(const sectionIndex of (stageGroups[stageIndex] || [])){
        const section = sections[sectionIndex];
        if(!section) continue;
        for(const field of Array.from(section.querySelectorAll("[required]"))){
            if(!field.checkValidity()){ field.reportValidity(); return false; }
        }
    }
    return true;
}

function renderStage(){
    const sections = getSections();
    const visibleIndexes = new Set(stageGroups[currentStage] || []);
    sections.forEach((section,index)=>section.classList.toggle("active",visibleIndexes.has(index)));
    document.querySelectorAll(".progress-step").forEach((step,index)=>{step.classList.toggle("active",index===currentStage);step.classList.toggle("complete",index<currentStage);});
    document.querySelectorAll(".wizard-navigation").forEach(nav=>nav.remove());
    const lastVisibleIndex = Math.max(...(stageGroups[currentStage] || [0]));
    const anchorSection = sections[lastVisibleIndex];
    if(anchorSection && currentStage < stageGroups.length - 1){
        const nav = document.createElement("div"); nav.className = "wizard-navigation";
        if(currentStage > 0){
            const back = document.createElement("button"); back.type="button"; back.className="secondary-button"; back.textContent="Back";
            back.addEventListener("click",()=>{currentStage--;renderStage();window.scrollTo({top:0,behavior:"smooth"});}); nav.appendChild(back);
        }
        const next = document.createElement("button"); next.type="button"; next.className="primary-button"; next.textContent=currentStage===stageGroups.length-2?"Review Application":"Continue";
        next.addEventListener("click",()=>{if(!validateStage(currentStage))return;currentStage++;if(currentStage===stageGroups.length-1)createReview();renderStage();window.scrollTo({top:0,behavior:"smooth"});}); nav.appendChild(next); anchorSection.appendChild(nav);
    } else if(anchorSection && currentStage === stageGroups.length - 1){
        const submitButton = anchorSection.querySelector(".submit-button");
        if(submitButton && !document.getElementById("submissionConfirmation")){
            const nav=document.createElement("div");nav.className="wizard-navigation review-navigation";
            const back=document.createElement("button");back.type="button";back.className="secondary-button";back.textContent="Back to Edit";
            back.addEventListener("click",()=>{currentStage--;renderStage();window.scrollTo({top:0,behavior:"smooth"});});submitButton.parentNode.insertBefore(nav,submitButton);nav.appendChild(back);
        }
    }
}

function ensureJsPDFLibrary(){
    if(window.jspdf && window.jspdf.jsPDF) return;
    if(document.querySelector('script[data-orms-jspdf="true"]')) return;
    const script=document.createElement("script");script.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";script.dataset.ormsJspdf="true";document.head.appendChild(script);
}

function showSubmissionConfirmation(){
    const reviewSection=document.querySelector(".review-section"); if(!reviewSection)return;
    document.querySelectorAll(".wizard-navigation").forEach(nav=>nav.remove());
    const existing=document.getElementById("submissionConfirmation");if(existing)existing.remove();
    const confirmation=document.createElement("div");confirmation.id="submissionConfirmation";confirmation.className="submission-confirmation";
    const heading=document.createElement("h3");heading.textContent="Application Submitted Successfully";
    const details=document.createElement("p");details.textContent=`Application Number: ${createApplicationNumber()}`;
    const instruction=document.createElement("p");instruction.textContent="Please download and keep a copy of your completed application for your records.";
    const downloadButton=document.createElement("button");downloadButton.type="button";downloadButton.className="download-pdf-button";downloadButton.textContent="Download My Completed Application (PDF)";
    downloadButton.addEventListener("click",()=>{try{downloadPDF();}catch(error){console.error("PDF download error:",error);alert("The PDF could not be created. Please try the download button again.");}});
    confirmation.append(heading,details,instruction,downloadButton);reviewSection.appendChild(confirmation);
    const submitButton=reviewSection.querySelector(".submit-button");if(submitButton)submitButton.style.display="none";
    const summary=document.getElementById("applicationSummary");if(summary)summary.style.display="none";
    const intro=reviewSection.querySelector("h2 + p");if(intro)intro.style.display="none";
    window.scrollTo({top:reviewSection.offsetTop-20,behavior:"smooth"});
}

document.addEventListener("DOMContentLoaded",()=>{createApplicationNumber();ensureJsPDFLibrary();renderStage();});

document.getElementById("rentalApplication").addEventListener("submit",async function(event){
    event.preventDefault();
    if(!this.checkValidity()){alert("Please complete all required fields before submitting.");this.reportValidity();return;}

    const submitButton=this.querySelector(".submit-button"),originalText=submitButton.textContent;
    submitButton.disabled=true;
    submitButton.textContent="Submitting...";

    try{
        createReview();
        const data = collectApplicationData();

        // ORMS is the system of record. Save there first.
        await sendApplicationToOrms(data);

        // Preserve the existing owner email notification.
        const emailResult = await sendApplicationEmail(data);
        if(emailResult === false) throw new Error("Email submission failed");

        submitButton.textContent="Application Submitted";
        submitButton.classList.add("submitted");
        showSubmissionConfirmation();
    }
    catch(error){
        console.error("Application submission error:",error);
        alert("There was an error submitting your application. Please try again. Your application number will remain the same.");
        submitButton.disabled=false;
        submitButton.textContent=originalText;
    }
});