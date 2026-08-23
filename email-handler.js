/* ==========================================
16 ORCHARD VIEW RENTAL APPLICATION
EMAIL HANDLER
========================================== */

(function(){
    emailjs.init({
        publicKey: "OlQi5J74Uve2qhqRu"
    });
})();

function buildApplicationSummary(data){
    return Object.keys(data)
        .filter(key => data[key] !== undefined && data[key] !== null && String(data[key]).trim() !== "")
        .map(key => `${friendlyLabel(key)}: ${data[key]}`)
        .join("\n");
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
        message: "New rental application received for 16 Orchard View Drive.",
        application_summary: buildApplicationSummary(data)
    };

    try {
        await emailjs.send(
            "service_iuhvgrh",
            "template_j94vppx",
            params
        );
        return true;
    }
    catch(error){
        console.error("EmailJS submission error:", error);
        throw error;
    }
}