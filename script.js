/* ==========================================
   16 ORCHARD VIEW RENTAL APPLICATION
   APPLICATION SCRIPT
========================================== */


/*
CREATE APPLICATION NUMBER
*/


function createApplicationNumber(){

    let year = new Date().getFullYear();

    let random =
    Math.floor(Math.random()*9000)+1000;


    return "ORCH-" + year + "-" + random;

}






/*
FORMAT DATE
*/


function getSubmissionDate(){

    let today = new Date();


    return today.toLocaleDateString()
    + " "
    + today.toLocaleTimeString();

}







/*
COLLECT FORM INFORMATION
*/


function collectApplicationData(){


    let form =
    document.getElementById(
    "rentalApplication"
    );


    let data = {};


    let fields =
    form.elements;



    for(let i=0;i<fields.length;i++){


        let field = fields[i];


        if(field.name){


            if(field.type==="checkbox"){


                data[field.name] =
                field.checked
                ? "Accepted"
                : "Not Accepted";


            }


            else if(field.type==="radio"){


                if(field.checked){

                    data[field.name]
                    =
                    field.value;

                }


            }


            else {


                data[field.name]
                =
                field.value;


            }

        }

    }


    data.applicationNumber =
    createApplicationNumber();



    data.submissionDate =
    getSubmissionDate();



    return data;


}







/*
CREATE REVIEW SUMMARY
*/


function createReview(){


let data =
collectApplicationData();



let summary =
document.getElementById(
"applicationSummary"
);



summary.innerHTML="";



for(let key in data){


    if(data[key]){


        summary.innerHTML +=

        "<p><strong>"
        +
        key
        +
        ":</strong> "
        +
        data[key]
        +
        "</p>";


    }


}



}








/*
FORM SUBMIT
*/


document
.getElementById(
"rentalApplication"
)
.addEventListener(
"submit",
function(event){


event.preventDefault();



/*
VALIDATE FORM
*/


if(
!this.checkValidity()
){


alert(
"Please complete all required fields."
);


this.reportValidity();


return;


}





createReview();



sendApplicationEmail();


alert(
"Your application PDF has been created."
);



});









/*
WHEN PAGE LOADS
*/


window.onload=function(){


console.log(

"16 Orchard View Drive Rental Application Loaded"

);


};