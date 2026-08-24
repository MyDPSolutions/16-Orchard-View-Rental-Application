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
        // Tenant confirmation only. The completed owner PDF copy is handled
        // separately by the Cloudflare Worker + Resend mailer when the PDF is downloaded.
        await emailjs.send(EMAILJS_SERVICE_ID, TENANT_TEMPLATE_ID, tenantParams);
        return true;
    } catch(error){
        console.error("EmailJS tenant confirmation error:",error);
        throw error;
    }
}
