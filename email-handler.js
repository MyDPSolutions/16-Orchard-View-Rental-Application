/* ==========================================
16 ORCHARD VIEW RENTAL APPLICATION
EMAIL HANDLER
========================================== */

(function(){
    emailjs.init({ publicKey: "OlQi5J74Uve2qhqRu" });
})();

const EMAILJS_SERVICE_ID = "service_iuhvgrh";
const TENANT_TEMPLATE_ID = "template_0ah7u62";

async function sendApplicationEmail(applicationData){
    const data = applicationData || collectApplicationData();
    const applicantName = `${data.firstName || ""} ${data.lastName || ""}`.trim();

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
        // Send exactly one tenant confirmation through EmailJS.
        await emailjs.send(EMAILJS_SERVICE_ID, TENANT_TEMPLATE_ID, tenantParams);

        // Automatically generate and email the landlord's completed PDF copy
        // at submission time. The tenant download button remains available,
        // but is no longer required for the landlord to receive the PDF.
        if(typeof generatePDF === "function" && typeof emailOwnerCompletedPDF === "function"){
            const pdf = generatePDF();
            await emailOwnerCompletedPDF(pdf, data);
        } else {
            console.error("Owner PDF mailer is unavailable.");
        }

        return true;
    } catch(error){
        console.error("Application email workflow error:",error);
        throw error;
    }
}
