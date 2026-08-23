/* ==========================================
   16 ORCHARD VIEW RENTAL APPLICATION
   PDF GENERATOR
========================================== */

function generatePDF(){
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "letter" });
    const data = collectApplicationData();

    const pageWidth = 215.9;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = 16;

    const displayValue = value => {
        if(value === undefined || value === null) return "";
        const clean = String(value).trim();
        return clean === "Select" ? "" : clean;
    };

    function addPageIfNeeded(requiredHeight = 10){
        if(y + requiredHeight > 263){
            pdf.addPage();
            y = 16;
            addPageHeader();
        }
    }

    function addPageHeader(){
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("16 Orchard View Drive Rental Application", margin, y);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.text(`Application Number: ${data.applicationNumber}`, pageWidth - margin, y, { align: "right" });
        y += 7;
    }

    function section(title){
        addPageIfNeeded(10);
        pdf.setFillColor(31, 78, 121);
        pdf.rect(margin, y, contentWidth, 6.5, "F");
        pdf.setTextColor(255,255,255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);
        pdf.text(title, margin + 3, y + 4.6);
        pdf.setTextColor(0,0,0);
        y += 8.5;
    }

    function field(label, value, options = {}){
        const clean = displayValue(value);
        const boxHeight = options.multiline ? 13 : 7.5;
        addPageIfNeeded(boxHeight + 5);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.2);
        pdf.text(label, margin, y);
        y += 2.5;

        pdf.setDrawColor(195,195,195);
        pdf.setFillColor(250,250,250);
        pdf.rect(margin, y, contentWidth, boxHeight, "FD");

        if(clean){
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            const lines = pdf.splitTextToSize(clean, contentWidth - 6);
            pdf.text(lines, margin + 3, y + 4.7);
        }
        y += boxHeight + 3.5;
    }

    function twoColumnFields(items){
        const colGap = 5;
        const colWidth = (contentWidth - colGap) / 2;

        for(let i = 0; i < items.length; i += 2){
            const left = items[i];
            const right = items[i+1];
            addPageIfNeeded(13.5);
            const startY = y;

            [left, right].forEach((item, idx) => {
                if(!item) return;
                const x = idx === 0 ? margin : margin + colWidth + colGap;
                const value = displayValue(item.value);

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(7.2);
                pdf.text(item.label, x, startY);
                pdf.setDrawColor(195,195,195);
                pdf.setFillColor(250,250,250);
                pdf.rect(x, startY + 2.5, colWidth, 7.5, "FD");

                if(value){
                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(8);
                    pdf.text(pdf.splitTextToSize(value, colWidth - 6), x + 3, startY + 7.2);
                }
            });

            y += 13.5;
        }
    }

    function consentLine(label, value){
        const clean = displayValue(value);
        addPageIfNeeded(6);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        const mark = (clean === "Accepted" || clean === "Yes") ? "X" : "";
        pdf.rect(margin, y - 3.2, 3.5, 3.5);
        if(mark) pdf.text(mark, margin + 0.9, y - 0.4);
        pdf.text(label, margin + 6, y);
        y += 5.5;
    }

    pdf.setFillColor(31, 78, 121);
    pdf.rect(0, 0, pageWidth, 27, "F");
    pdf.setTextColor(255,255,255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.text("16 Orchard View Drive", pageWidth/2, 11, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.text("Rental Application", pageWidth/2, 18, { align: "center" });
    pdf.setTextColor(0,0,0);
    y = 34;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(`Application Number: ${data.applicationNumber}`, margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Submitted: ${data.submissionDate}`, pageWidth - margin, y, { align: "right" });
    y += 7;

    section("Applicant Information");
    twoColumnFields([
        {label:"First Name", value:data.firstName},
        {label:"Middle Initial", value:data.middleInitial},
        {label:"Last Name", value:data.lastName},
        {label:"Home Phone", value:data.homePhone},
        {label:"Work Phone", value:data.workPhone},
        {label:"Email", value:data.email},
        {label:"Government Identification Type", value:data.idType},
        {label:"Last 4 Digits of Identification", value:data.idLastFour},
        {label:"Date of Birth", value:data.dob},
        {label:"Marital Status", value:data.maritalStatus}
    ]);

    section("Co-Applicant Information");
    twoColumnFields([
        {label:"First Name", value:data.coFirstName},
        {label:"Last Name", value:data.coLastName},
        {label:"Email", value:data.coEmail},
        {label:"Phone", value:data.coPhone},
        {label:"Government Identification Type", value:data.coIdType},
        {label:"Last 4 Digits of Identification", value:data.coIdLastFour}
    ]);

    section("Residents & Rental Requirements");
    field("Other Residents", data.otherResidents, {multiline:true});
    twoColumnFields([
        {label:"Unit Size Required", value:data.unitSize},
        {label:"Desired Move-In Date", value:data.moveInDate},
        {label:"Pets", value:data.pets},
        {label:"Number of Pets", value:data.numberOfPets}
    ]);

    section("Residential History");
    field("Present Address", data.presentAddress);
    twoColumnFields([
        {label:"How Long at Address", value:data.timeAtAddress},
        {label:"Monthly Rent", value:data.currentRent},
        {label:"Landlord Name", value:data.currentLandlord},
        {label:"Landlord Phone", value:data.currentLandlordPhone}
    ]);
    field("Reason for Leaving", data.reasonLeaving, {multiline:true});
    field("Previous Address 1", data.previousAddress1);
    field("Previous Address 2", data.previousAddress2);

    section("Employment Information");
    twoColumnFields([
        {label:"Employer", value:data.employer},
        {label:"Length of Employment", value:data.employmentLength},
        {label:"Annual / Monthly Income", value:data.income},
        {label:"Supervisor Name", value:data.supervisor}
    ]);
    field("Employer Address", data.employerAddress);

    section("Co-Applicant Employment");
    twoColumnFields([
        {label:"Employer", value:data.coEmployer},
        {label:"Length of Employment", value:data.coEmploymentLength},
        {label:"Income", value:data.coIncome},
        {label:"Supervisor", value:data.coSupervisor}
    ]);
    field("Other Sources of Income", data.otherIncome, {multiline:true});

    section("Loans & Financial Obligations");
    twoColumnFields([
        {label:"Institution 1", value:data.loanInstitution1},
        {label:"Address 1", value:data.loanAddress1},
        {label:"Monthly Payment 1", value:data.loanPayment1},
        {label:"Balance 1", value:data.loanBalance1},
        {label:"Institution 2", value:data.loanInstitution2},
        {label:"Address 2", value:data.loanAddress2},
        {label:"Monthly Payment 2", value:data.loanPayment2},
        {label:"Balance 2", value:data.loanBalance2}
    ]);

    section("Automobiles");
    twoColumnFields([
        {label:"Vehicle 1 Make / Model", value:data.vehicleMake1},
        {label:"Vehicle 1 Year", value:data.vehicleYear1},
        {label:"Vehicle 1 Plate", value:data.vehiclePlate1},
        {label:"Vehicle 1 Province", value:data.vehicleProvince1},
        {label:"Vehicle 2 Make / Model", value:data.vehicleMake2},
        {label:"Vehicle 2 Year", value:data.vehicleYear2},
        {label:"Vehicle 2 Plate", value:data.vehiclePlate2},
        {label:"Vehicle 2 Province", value:data.vehicleProvince2}
    ]);

    section("Emergency Contact");
    twoColumnFields([
        {label:"Name", value:data.emergencyName},
        {label:"Phone", value:data.emergencyPhone},
        {label:"Address", value:data.emergencyAddress},
        {label:"Relationship", value:data.emergencyRelationship}
    ]);

    section("Tenant Screening");
    twoColumnFields([
        {label:"Do you smoke?", value:data.smoke},
        {label:"Ever evicted from a rental property?", value:data.evicted},
        {label:"Ever broken a rental agreement?", value:data.brokenLease},
        {label:"Credit Check Consent", value:data.creditConsent}
    ]);

    section("Declarations & Authorization");
    consentLine("I accept the declaration that the information provided is true and complete.", data.declaration);
    consentLine("I authorize a credit check.", data.creditAuthorization);

    section("Electronic Signatures");
    twoColumnFields([
        {label:"Applicant Signature", value:data.applicantSignature},
        {label:"Signature Date", value:data.applicantSignatureDate},
        {label:"Co-Applicant Signature", value:data.coApplicantSignature},
        {label:"Co-Applicant Signature Date", value:data.coApplicantSignatureDate}
    ]);

    const pageCount = pdf.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++){
        pdf.setPage(i);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(100,100,100);
        pdf.text(`16 Orchard View Drive Rental Application  |  ${data.applicationNumber}`, margin, 274);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 274, { align: "right" });
    }

    return pdf;
}

function downloadPDF(){
    const pdf = generatePDF();
    const data = collectApplicationData();
    pdf.save(`16-Orchard-View-Rental-Application-${data.applicationNumber}.pdf`);
}