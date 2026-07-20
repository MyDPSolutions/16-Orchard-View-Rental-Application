/* ==========================================
16 ORCHARD VIEW RENTAL APPLICATION
EMAIL HANDLER
========================================== */


(function(){

emailjs.init({

publicKey:

"OlQi5J74Uve2qhqRu"

});


})();





async function sendApplicationEmail(){


let data =
collectApplicationData();



let pdf =
generatePDF();



let pdfBlob =
pdf.output("blob");



let applicantName =
data.firstName
+
" "
+
data.lastName;



let params = {


application_number:
data.applicationNumber,


applicant_name:
applicantName,


applicant_email:
data.email,


submission_date:
data.submissionDate,


message:

"New rental application received for 16 Orchard View Drive."

};





emailjs.send(

"service_iuhvgrh",

"template_j94vppx",

params

)

.then(function(){


alert(

"Your application has been submitted successfully."

);


})


.catch(function(error){


console.log(error);


alert(

"There was an error submitting your application. Please try again."

);


});


}