import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ep1 from "../api/ep1";
import FormField from "../components/FormField";
import { Box, Button, Typography, Paper, Grid, Divider } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Admissiontemplate2 = () => {
  const navigate = useNavigate();
  const { colId } = useParams();

  // Refs for PDF Generation
  const page1Ref = useRef();
  const page2Ref = useRef();
  const printRef = useRef();

  const [formData, setFormData] = useState({
    colId: colId,
    name: "",
    motherName: "",
    fatherName: "",
    qualification: "",
    occupation: "",
    bloodGroup: "",
    annualIncome: "",
    gender: "",
    dateOfBirth: "",
    category: "",
    caste: "",
    religion: "",
    aadhaarNumber: "",
    bankAcno: "",
    addressAndphone: "",
    parentAddress: "",
    nameofLastschool: "",
    languagesStudied: "",
    motherTongue: "",
    noOfDependents: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDownloadPDF = async () => {
    const page1 = page1Ref.current;
    const page2 = page2Ref.current;

    // Hide buttons during capture so they don't appear in the PDF
    const buttons = document.getElementById("submit-section");
    buttons.style.visibility = "hidden";

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    try {
      // Capture Page 1 (Personal Details)
      const canvas1 = await html2canvas(page1, { scale: 2 });
      const imgData1 = canvas1.toDataURL("image/png");
      const imgProps1 = pdf.getImageProperties(imgData1);
      const pdfHeight1 = (imgProps1.height * pdfWidth) / imgProps1.width;
      pdf.addImage(imgData1, "PNG", 0, 0, pdfWidth, pdfHeight1);

      // Add Page 2 (Declaration & Office Use)
      pdf.addPage();
      const canvas2 = await html2canvas(page2, { scale: 2 });
      const imgData2 = canvas2.toDataURL("image/png");
      const imgProps2 = pdf.getImageProperties(imgData2);
      const pdfHeight2 = (imgProps2.height * pdfWidth) / imgProps2.width;
      pdf.addImage(imgData2, "PNG", 0, 0, pdfWidth, pdfHeight2);

      pdf.save(`Admission_Form_${formData.name || "Student"}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      buttons.style.visibility = "visible";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await ep1.post("/api/v2/createApplicationFormann", formData);
      if (res.status === 201) {
        await handleDownloadPDF();
        navigate("/success", { state: { formData } });
      } else {
        alert("Error: " + res.data.message);
      }
    } catch (err) {
      alert("Failed to submit form: " + err.message);
    }
  };

  return (
    <Box sx={{ py: 4, backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <form onSubmit={handleSubmit}>
        {/* PAGE 1: STUDENT DATA ENTRY */}
        <Paper
          ref={page1Ref}
          elevation={3}
          sx={{
            maxWidth: 850,
            mx: "auto",
            p: 5,
            mb: 4,
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold", letterSpacing: 1, mb: 0 }}
            >
              MAHAJANA HIGH SCHOOL
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Jayalakshmipuram, Mysuru - 570 012
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
              Application for Admission
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              202____ - 202____
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                mt: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                VIII, IX & X Std.
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" sx={{ mr: 1, fontWeight: "bold" }}>
                  APPLICATION No.
                </Typography>
                <Box
                  sx={{
                    border: "1px solid #000",
                    px: 4,
                    py: 0.5,
                    minWidth: "120px",
                    textAlign: "center",
                  }}
                >
                  {/* This stays empty for manual filling or you can map a variable here */}
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderBottomWidth: 2, borderColor: "#000", mb: 4 }} />

          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", textDecoration: "underline", mb: 4 }}
          >
            ADMISSION APPLICATION FORM
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormField
                label="NAME OF THE STUDENT (In Block Letters)"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormField
                label="MOTHER'S NAME"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormField
                label="FATHER'S NAME"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <FormField
                label="QUALIFICATION"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <FormField
                label="OCCUPATION"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={4}>
              <FormField
                label="BLOOD GROUP"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={8}>
              <FormField
                label="ANNUAL INCOME OF PARENTS"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={4}>
              <FormField
                label="DATE OF BIRTH"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={2}>
              <FormField
                label="SEX"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={2}>
              <FormField
                label="RELIGION"
                name="religion"
                value={formData.religion}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={2}>
              <FormField
                label="CASTE"
                name="caste"
                value={formData.caste}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={2}>
              <FormField
                label="CATEGORY"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormField
                label="AADHAAR NO."
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormField
                label="BANK A/c No."
                name="bankAcno"
                value={formData.bankAcno}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={9}>
              <FormField
                label="ADDRESS FOR COMMUNICATION (with phone number)"
                multiline
                rows={2}
                name="addressAndphone"
                value={formData.addressAndphone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={3}>
              <FormField
                label="No. of dependents"
                name="noOfDependents"
                value={formData.noOfDependents}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormField
                label="PERMANENT ADDRESS (If different) with phone number"
                multiline
                rows={2}
                name="parentAddress"
                value={formData.parentAddress}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormField
                label="NAME OF THE LAST SCHOOL ATTENDED"
                name="nameofLastschool"
                value={formData.nameofLastschool}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={8}>
              <FormField
                label="LANGUAGES STUDIED"
                placeholder="I: KAN, II: ENG, III: HINDI"
                name="languagesStudied"
                value={formData.languagesStudied}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <FormField
                label="MOTHER TONGUE"
                name="motherTongue"
                value={formData.motherTongue}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* PAGE 2: DECLARATION & OFFICE USE (Visible in UI) */}
        <Paper
          ref={page2Ref}
          elevation={3}
          sx={{
            maxWidth: 850,
            mx: "auto",
            p: 6,
            backgroundColor: "#fff",
            color: "#000",
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            DECLARATION
          </Typography>
          <Typography variant="body1" paragraph>
            I declare that the information provided in the application is
            correct, I shall abide by any disciplinary action that may be taken
            by the Vice Principal if the information provided is found to be in
            correct.
          </Typography>

          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            UNDERTAKING BY THE STUDENT
          </Typography>
          <Typography variant="body1" paragraph>
            I shall abide by the rules of the Institution and extend full
            co-operation for the smooth working of if failing which I shall be
            bound by any disciplinary action that may be taken by the Vice
            Principal, including the issue of Transfer Certificate at any time
            of the academic year.
          </Typography>

          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: "bold", mt: 3, mb: 1 }}
          >
            UNDERTAKING BY PARENT OR GUARDIAN
          </Typography>
          <Typography variant="body1" paragraph>
            I assure the authorities of the Institution that I shall be
            responsible for good conduct of my son/ daughter/ ward during the
            years of his/her stay in the Institution. I shall abide by any
            disciplinary action (including the issue of Transfer Certificate)
            taken against my son / daughter/ward for breach of discipline at any
            time of the academic year.
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4, mb: 6 }}>
            <Grid item xs={6}>
              <Box sx={{ border: "1px solid #000", height: 80, mb: 1 }} />
              <Typography
                variant="subtitle2"
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                Signature of Parent or Guardian
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ border: "1px solid #000", height: 80, mb: 1 }} />
              <Typography
                variant="subtitle2"
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                Signature of Pupil
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                ENCLOSURE
              </Typography>
              <Typography variant="body2">
                1. Transfer Certificate (Original + two xerox copy)
              </Typography>
              <Typography variant="body2">
                2. Caste Certificate (Original + two xerox copy)
              </Typography>
              <Typography variant="body2">
                3. Certificate of merit in Extra curricular activity (if any)
              </Typography>
              <Typography variant="body2">
                4. Four passport size photograph
              </Typography>
              <Typography variant="body2">5. Aadhar xerox copy</Typography>
              <Typography variant="body2">
                6. Bank Passbook xerox copy
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  border: "1px solid #000",
                  width: 130,
                  height: 150,
                  ml: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  p: 1,
                  fontSize: "11px",
                }}
              >
                Affix Recent Passport Size Colour Photograph
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ border: "1px solid #000", p: 2, mt: 4, mb: 4 }}>
            <Typography variant="caption" display="block">
              1. For all payments obtain receipt
            </Typography>
            <Typography variant="caption" display="block">
              2. Failure to issue receipt by the office should be brought to the
              knowledge of president or Hon. Secretary of the Institution
              IMMEDIATELY.
            </Typography>
            <Typography variant="caption" display="block">
              3. Collect acknowledgment for all documents handed over to the
              office
            </Typography>
          </Box>

          <Divider sx={{ borderBottomWidth: 2, borderColor: "#000", mb: 2 }} />
          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            FOR OFFICE USE ONLY
          </Typography>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Admitted
            to................................................................
            Standard.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Typography variant="body2">
              Date of Admission: .....................
            </Typography>
            <Typography variant="body2">
              Admission No.: .....................
            </Typography>
          </Box>
        </Paper>

        {/* SUBMIT SECTION (Visible at bottom of page) */}
        <Box id="submit-section" sx={{ textAlign: "center", py: 4 }}>
          <Button
            variant="contained"
            color="success"
            size="large"
            type="submit"
            sx={{ px: 10, py: 2, fontWeight: "bold", fontSize: "1.1rem" }}
          >
            Submit Application & Download PDF
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default Admissiontemplate2;
