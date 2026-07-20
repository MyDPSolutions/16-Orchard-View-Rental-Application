/* ==========================================
   16 ORCHARD VIEW RENTAL APPLICATION
   PDF GENERATOR
========================================== */



function generatePDF(){


const {
jsPDF
}
=
window.jspdf;



let pdf =
new jsPDF();




let data =
collectApplicationData();




let y = 20;



function addLine(text){


    if(y > 280){

        pdf.addPage();

        y=20;

    }


    pdf.text(
        String(text),
        20,
        y
    );


    y += 8;


}





/*
HEADER
*/


pdf.setFontSize(18);


pdf.text(

"16 Orchard View Drive",

20,

20

);



y = 35;


pdf.setFontSize(14);



pdf.text(

"Rental Application",

20,

y

);


y += 15;




pdf.setFontSize(10);





addLine(
"Application Number: "
+
data.applicationNumber
);



addLine(

"Submitted: "
+
data.submissionDate

);



addLine(
"--------------------------------"
);





/*
FORM DATA
*/


for(let key in data){


    if(

    data[key]
    &&
    key !== "applicationNumber"
    &&
    key !== "submissionDate"

    ){


        addLine(

        key.replaceAll(
        "_",
        " "
        )
        +
        ": "
        +
        data[key]

        );


    }


}






/*
FOOTER
*/


pdf.setFontSize(9);



pdf.text(

"16 Orchard View Drive Rental Application",

20,

290

);






return pdf;



}







/*
DOWNLOAD PDF
*/


function downloadPDF(){


let pdf =
generatePDF();



pdf.save(

"16-Orchard-View-Rental-Application.pdf"

);


}