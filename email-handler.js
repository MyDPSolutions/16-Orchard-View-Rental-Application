/* ==========================================
16 ORCHARD VIEW RENTAL APPLICATION
EMAIL HANDLER
========================================== */

(function(){
    emailjs.init({ publicKey: "OlQi5J74Uve2qhqRu" });
})();

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
    return rows.filter(([,value])=>value!==undefined&&value!==null&&String(value).trim()!=="").map(([label,value])=>`${label}: ${value}`).join("\n");
}

async function sendApplicationEmail(){
    const data = collectApplicationData();
    const applicantName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    const params = {
        application_number: data.applicationNumber,
        applicant_name: applicantName,
        applicant_email: data.email,
        submission_date: data.submissionDate,
        property_address: "16 Orchard View Drive",
        message: "A new rental application has been submitted for 16 Orchard View Drive. The applicant has authorized a credit check and has been provided with a downloadable PDF copy for their records.",
        application_summary: buildApplicationSummary(data)
    };
    try{
        await emailjs.send("service_iuhvgrh","template_j94vppx",params);
        return true;
    } catch(error){
        console.error("EmailJS submission error:",error);
        throw error;
    }
}