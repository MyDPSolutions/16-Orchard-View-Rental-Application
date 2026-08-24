/* ==========================================
16 ORCHARD VIEW RENTAL APPLICATION
EMAIL HANDLER
========================================== */

(function(){
    emailjs.init({ publicKey: "OlQi5J74Uve2qhqRu" });
})();

const EMAILJS_SERVICE_ID = "service_iuhvgrh";
const OWNER_TEMPLATE_ID = "template_j94vppx";
const TENANT_TEMPLATE_ID = "template_0ah7u62";

function buildApplicationSummary(data){
    const rows = [
        ["Application Number", data.applicationNumber],
        ["Applicant", `${data.firstName || ""} ${data.lastName || ""}`.trim()],
        ["Email", data.email],
        ["Home Phone", data.homePhone],
        ["Desired Move-In Date", data.moveInDate],
        ["Employer", data.employer],
        ["Income", data.income],
        ["Credit Check Authorization", data.creditAuthorization],
        ["Applicant Signature", data.applicantSignature],
        ["Signature Date", data.applicantSignatureDate],
        ["Submitted", data.submissionDate]
    ];
    return rows
        .filter(([,value])=>value!==undefined&&value!==null&&String(value).trim()!=="")
        .map(([label,value])=>`${label}: ${value}`)
        .join("\n");
}

function createApplicationPdfDataUri(){
    if(typeof generatePDF !== "function") return "";
    try{
        const pdf = generatePDF();
        return pdf.output("datauristring");
    } catch(error){
        console.error("PDF attachment generation error:", error);
        return "";
    }
}

async function sendApplicationEmail(applicationData){
    const data = applicationData || collectApplicationData();
    const applicantName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    const pdfDataUri = createApplicationPdfDataUri();

    const ownerParams = {
        application_number: data.applicationNumber,
        applicant_name: applicantName,
        applicant_email: data.email,
        submission_date: data.submissionDate,
        property_address: "16 Orchard View Drive",
        message: "A new rental application has been submitted for 16 Orchard View Drive. The applicant has authorized a credit check and has been provided with a downloadable PDF copy for their records.",
        application_summary: buildApplicationSummary(data),
        name: applicantName,
        email: data.email,
        application_pdf: pdfDataUri,
        application_pdf_filename: `16-Orchard-View-Rental-Application-${data.applicationNumber}.pdf`
    };

    const tenantParams = {
        name: applicantName,
        email: data.email,
        application_number: data.applicationNumber,
        applicant_name: applicantName,
        applicant_email: data.email,
        submission_date: data.submissionDate,
        property_address: "16 Orchard View Drive"
    };

    try{
        // Owner notification (PDF attaches once the Contact Us template is
        // configured with a Variable Attachment named application_pdf).
        await emailjs.send(EMAILJS_SERVICE_ID, OWNER_TEMPLATE_ID, ownerParams);

        // Send the tenant confirmation explicitly rather than relying on
        // EmailJS template-link auto-reply behaviour.
        await emailjs.send(EMAILJS_SERVICE_ID, TENANT_TEMPLATE_ID, tenantParams);
        return true;
    } catch(error){
        console.error("EmailJS submission error:",error);
        throw error;
    }
}
