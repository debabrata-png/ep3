import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ep1 from "../api/ep1";
import FormField from "./FormField";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Box,
  Button,
  Container,
  Typography,
  Divider,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Grid,
} from "@mui/material";

const Admissiontemplate1 = () => {
  const { colId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const printRef = useRef();

  const page1Ref = useRef();
  const page2Ref = useRef();

  const stepTitles = {
    1: "Student Personal Details",
    2: "Parent/Guardian Information",
    3: "Demographics & Category",
    4: "Previous School Information",
    5: "Academic Record (Last Class)",
    6: "TC, Siblings & Declaration",
  };

  const [formData, setFormData] = useState({
    colId: colId,
    name: "",
    gender: "",
    dateOfBirth: "",
    motherToungue: "",
    aadhaarNumber: "",
    motherName: "",
    fatherName: "",
    motherEducation: "",
    fatherEducation: "",
    motherAddress: "",
    fatherAddress: "",
    motherPhone: "",
    fatherPhone: "",
    motherEmail: "",
    fatherEmail: "",
    motherOccupation: "",
    fatherOccupation: "",
    motherOfficialAddress: "",
    fatherOfficialAddress: "",
    motherIncome: "",
    fatherIncome: "",
    singleChild: "",
    isDivyangan: "",
    category: "",
    caste: "",
    subCaste: "",
    religion: "",
    nationality: "",
    nameAndaddress: "",
    classLastattended: "",
    diseCode: "",
    lastSchoolAffiliation: "",
    otherAffiliation: "",
    results: Array(6).fill({
      subject: "",
      maxMarks: "",
      marksObtained: "",
      percentage: "",
      remarks: "",
    }),
    transfercertificateNum: "",
    dateOfissue: "",
    siblingName: "",
    siblingAge: "",
    siblingRelation: "",
    siblingSchool: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTableChange = (index, field, value) => {
    const updatedResults = [...formData.results];
    updatedResults[index] = { ...updatedResults[index], [field]: value };
    setFormData({ ...formData, results: updatedResults });
  };

  const downloadPDF = async () => {
    const page1 = page1Ref.current;
    const page2 = page2Ref.current;

    // 1. Temporarily bring them into the layout flow so canvas can render them
    page1.style.display = "block";
    page2.style.display = "block";

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    try {
      // Capture Page 1
      const canvas1 = await html2canvas(page1, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData1 = canvas1.toDataURL("image/png");
      const pdfHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
      pdf.addImage(imgData1, "PNG", 0, 0, pdfWidth, pdfHeight1);

      // Capture Page 2
      pdf.addPage();
      const canvas2 = await html2canvas(page2, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData2 = canvas2.toDataURL("image/png");
      const pdfHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
      pdf.addImage(imgData2, "PNG", 0, 0, pdfWidth, pdfHeight2);

      pdf.save(`Admission_Form_${formData.name || "Student"}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      // 2. Hide them again
      page1.style.display = "none";
      page2.style.display = "none";
    }
  };

  const handleSubmit = async (e) => {
    // 1. Prevent browser default and stop event bubbling immediately
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 2. Safety Check: Only run if we are actually on the final step
    if (step !== 6) return;

    // 3. Validation: Don't submit if TC details are missing
    if (!formData.transfercertificateNum || !formData.dateOfissue) {
      return;
    }

    try {
      const res = await ep1.post("/api/v2/createApplicationForm", {
        ...formData,
        templateType: "template1", // Change to template2 or template3 accordingly
      });

      if (res.status === 201) {
        const serverData = res.data.data;
        setFormData((prev) => ({
          ...prev,
          applicationNo: serverData.applicationNo,
        }));

        // 1. Give React a moment to render the Serial Number on screen
        setTimeout(async () => {
          // 2. Call the function (Ensure this name matches: downloadPDF / generatePDF)
          const success = await downloadPDF();

          // 3. ONLY navigate after the download process is triggered
          navigate("/success");
        }, 1000);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission Failed: " + (err.response?.data?.error || err.message));
    }
  };

  const cellStyle = {
    border: "1px solid #000",
    padding: "6px",
    fontSize: "11px",
    color: "#000",
  };
  const labelStyle = {
    ...cellStyle,
    backgroundColor: "#f9f9f9",
    fontWeight: "bold",
  };
  const inputStyle = {
    border: "none",
    outline: "none",
    width: "100%",
    background: "transparent",
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box ref={printRef}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            gutterBottom
          >
            MAHAJANA PUBLIC SCHOOL ADMISSION
          </Typography>
          <Typography align="center" sx={{ mb: 2 }}>
            Step {step} of 6: {stepTitles[step]}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            {/* STEP 1: PERSONAL DETAILS */}
            {step === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormField
                  label="Student Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Gender"
                  type="select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "TG", value: "TG" },
                    { label: "Other", value: "Other" },
                  ]}
                />
                <FormField
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                <FormField
                  label="Mother Tongue"
                  name="motherToungue"
                  value={formData.motherToungue}
                  onChange={handleChange}
                />
                <FormField
                  label="Aadhaar Number"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                />
              </Box>
            )}

            {/* STEP 2: PARENT INFORMATION */}
            {step === 2 && (
              <TableContainer sx={{ border: "1px solid #ddd" }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={labelStyle}>Details</TableCell>
                      <TableCell sx={labelStyle}>Mother</TableCell>
                      <TableCell sx={labelStyle}>Father / Guardian</TableCell>
                    </TableRow>
                    {[
                      { l: "Name", m: "motherName", f: "fatherName" },
                      {
                        l: "Education",
                        m: "motherEducation",
                        f: "fatherEducation",
                      },
                      {
                        l: "Occupation",
                        m: "motherOccupation",
                        f: "fatherOccupation",
                      },
                      {
                        l: "Income (Annual)",
                        m: "motherIncome",
                        f: "fatherIncome",
                      },
                      { l: "Phone", m: "motherPhone", f: "fatherPhone" },
                      {
                        l: "Official Address",
                        m: "motherOfficialAddress",
                        f: "fatherOfficialAddress",
                      },
                    ].map((row) => (
                      <TableRow key={row.l}>
                        <TableCell sx={labelStyle}>{row.l}</TableCell>
                        <TableCell sx={cellStyle}>
                          <input
                            name={row.m}
                            value={formData[row.m]}
                            onChange={handleChange}
                            style={inputStyle}
                          />
                        </TableCell>
                        <TableCell sx={cellStyle}>
                          <input
                            name={row.f}
                            value={formData[row.f]}
                            onChange={handleChange}
                            style={inputStyle}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* STEP 3: DEMOGRAPHICS */}
            {step === 3 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography sx={{ mb: 1 }}>Category</Typography>
                  {["General", "SC", "ST", "OBC", "EWS"].map((cat) => (
                    <Button
                      key={cat}
                      onClick={() =>
                        setFormData({ ...formData, category: cat })
                      }
                      variant={
                        formData.category === cat ? "contained" : "outlined"
                      }
                      sx={{ mr: 1, mb: 1 }}
                    >
                      {cat}
                    </Button>
                  ))}
                </Box>

                <FormField
                  label="Caste"
                  name="caste"
                  value={formData.caste}
                  onChange={handleChange}
                />
                <FormField
                  label=" subCaste "
                  name="subCaste"
                  value={formData.subCaste}
                  onChange={handleChange}
                />
                <FormField
                  label=" Religion "
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                />
                <FormField
                  label=" nationality "
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                />

                {/* Single Child & Specially Abled sections remain the same... */}
                <Box>
                  <Typography sx={{ mb: 1 }}>Single Girl Child?</Typography>
                  {["Yes", "No"].map((o) => (
                    <Button
                      key={o}
                      onClick={() =>
                        setFormData({ ...formData, singleChild: o })
                      }
                      variant={
                        formData.singleChild === o ? "contained" : "outlined"
                      }
                      sx={{ mr: 1 }}
                    >
                      {o}
                    </Button>
                  ))}
                </Box>
                <Box>
                  <Typography sx={{ mb: 1, fontWeight: "medium" }}>
                    Is the student Specially Abled?
                  </Typography>
                  {["Yes", "No"].map((option) => (
                    <Button
                      key={option}
                      onClick={() =>
                        setFormData({ ...formData, isDivyangan: option })
                      }
                      variant={
                        formData.isDivyangan === option
                          ? "contained"
                          : "outlined"
                      }
                      color={option === "Yes" ? "warning" : "primary"}
                      sx={{ mr: 1 }}
                    >
                      {option}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* STEP 4: PREVIOUS SCHOOL */}
            {step === 4 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormField
                  label="Last School Name & Address"
                  name="nameAndaddress"
                  value={formData.nameAndaddress}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
                <FormField
                  label="Class Last Attended"
                  name="classLastattended"
                  value={formData.classLastattended}
                  onChange={handleChange}
                />
                <FormField
                  label="Dise Code / STS No"
                  name="diseCode"
                  value={formData.diseCode}
                  onChange={handleChange}
                />

                <Box>
                  <Typography sx={{ mb: 1 }}>
                    Last School Affiliation
                  </Typography>
                  {["CBSE", "ICSE", "IB", "State Board"].map((aff) => (
                    <Button
                      key={aff}
                      onClick={() =>
                        setFormData({ ...formData, lastSchoolAffiliation: aff })
                      }
                      variant={
                        formData.lastSchoolAffiliation === aff
                          ? "contained"
                          : "outlined"
                      }
                      sx={{ mr: 1, mb: 1 }}
                    >
                      {aff}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* STEP 5: ACADEMIC RECORD */}
            {step === 5 && (
              <TableContainer sx={{ border: "1px solid #000" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={labelStyle}>Subject</TableCell>
                      <TableCell sx={labelStyle}>Max Marks</TableCell>
                      <TableCell sx={labelStyle}>Obtained</TableCell>
                      <TableCell sx={labelStyle}>%</TableCell>
                      <TableCell sx={labelStyle}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.results.map((row, i) => (
                      <TableRow key={i}>
                        {[
                          "subject",
                          "maxMarks",
                          "marksObtained",
                          "percentage",
                          "remarks",
                        ].map((f) => (
                          <TableCell key={f} sx={cellStyle}>
                            <input
                              value={row[f]}
                              onChange={(e) =>
                                handleTableChange(i, f, e.target.value)
                              }
                              style={inputStyle}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* STEP 6: TC, SIBLINGS & DECLARATION */}
            {step === 6 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Transfer Certificate Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormField
                      label="TC Number"
                      name="transfercertificateNum"
                      value={formData.transfercertificateNum}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormField
                      label="TC Date of Issue"
                      type="date"
                      name="dateOfissue"
                      value={formData.dateOfissue}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2">
                  Sibling Details (if any)
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormField
                    label="Sibling Name"
                    name="siblingName"
                    sx={{ flex: 2 }}
                    value={formData.siblingName}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Brother / Sister"
                    name="siblingRelation"
                    sx={{ flex: 1.5 }}
                    value={formData.siblingRelation}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Age"
                    name="siblingAge"
                    sx={{ flex: 1 }}
                    value={formData.siblingAge}
                    onChange={handleChange}
                  />
                  <FormField
                    label="School"
                    name="siblingSchool"
                    sx={{ flex: 2 }}
                    value={formData.siblingSchool}
                    onChange={handleChange}
                  />
                </Box>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "#fffbe6",
                    border: "1px solid #ffe58f",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      textDecoration: "underline",
                      mb: 1,
                      fontWeight: "bold",
                    }}
                  >
                    DECLARATION
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "justify", lineHeight: 1.6 }}
                  >
                    I hereby declare that the above information including Name
                    of the Candidate, Father's / Guardian's Name, Mother's name
                    and Date of Birth furnished by me is correct to the best of
                    my knowledge & belief. I shall abide by the rules of the
                    School.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* NAVIGATION BUTTONS */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                type="button"
                variant="outlined"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>

              {step < 6 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  variant="contained"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  size="large"
                >
                  Submit & Download PDF
                </Button>
              )}
            </Box>
          </form>
        </Paper>

        {/* PDF PRINT TEMPLATE (HIDDEN) */}
        <Box sx={{ position: "absolute", left: "-10000px", top: 0 }}>
          {/* PAGE 1 */}
          <Paper
            ref={page1Ref}
            sx={{
              width: "210mm",
              minHeight: "297mm",
              p: "12mm",
              fontFamily: "'Times New Roman', serif",
              color: "#000",
            }}
          >
            <Box sx={{ textAlign: "center", position: "relative", mb: 2 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 60,
                  height: 60,
                  border: "1px solid #000",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                }}
              >
                LOGO
              </Box>
              <Typography sx={{ fontSize: "14px" }}>
                Mahajana Education Society (R.)
              </Typography>
              <Typography
                sx={{ fontSize: "26px", fontWeight: "bold", lineHeight: 1 }}
              >
                Mahajana Public School
              </Typography>
              <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>
                CBSE / AFF / 830182
              </Typography>
              <Typography sx={{ fontSize: "11px" }}>
                Jayalakshmipuram, Mysuru - 570012. Ph. : 0821-2412524
              </Typography>
              <Typography sx={{ fontSize: "11px" }}>
                E-mail : mps830182@gmail.com Website : mps.mahajana.edu.in
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              {/* Add this inside your Paper/Box header area */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", border: "1px solid #000", px: 2 }}
                >
                  SL. NO: {formData.applicationNo || "........"}
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  borderBottom: "2px solid #000",
                  px: 2,
                }}
              >
                ADMISSION FORM
              </Typography>
              <Box
                sx={{
                  border: "1px solid #000",
                  width: "30mm",
                  height: "35mm",
                  textAlign: "center",
                  p: 1,
                  fontSize: "11px",
                }}
              >
                Photo
                <br />
                with
                <br />
                Date
              </Box>
            </Box>

            <Box sx={{ mb: 1, fontSize: "13px" }}>
              <Typography>
                Admission No & Date :
                ........................................................................................{" "}
                <small>to be filled by office.</small>
              </Typography>
              <Typography>
                Class to which admission sought: ........... Session :
                ...................
              </Typography>
            </Box>

            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "14px",
                borderBottom: "1px solid #000",
                mb: 1,
              }}
            >
              PERSONAL DETAILS :
            </Typography>

            <Box sx={{ fontSize: "13px", "& p": { mb: 0.5 } }}>
              <Typography>
                1. Name : <b>{formData.name.toUpperCase()}</b>
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography>
                  2. Gender : Male [ {formData.gender === "Male" ? "✔" : " "} ]
                  Female [ {formData.gender === "Female" ? "✔" : " "} ] Any
                  other [ ]
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                <Typography>3. D.O.B : Date</Typography>
                <Box
                  sx={{
                    border: "1px solid #000",
                    width: 30,
                    height: 20,
                    textAlign: "center",
                  }}
                >
                  {formData.dateOfBirth?.split("-")[2]}
                </Box>
                <Typography>Month</Typography>
                <Box
                  sx={{
                    border: "1px solid #000",
                    width: 30,
                    height: 20,
                    textAlign: "center",
                  }}
                >
                  {formData.dateOfBirth?.split("-")[1]}
                </Box>
                <Typography>Year</Typography>
                <Box
                  sx={{
                    border: "1px solid #000",
                    width: 50,
                    height: 20,
                    textAlign: "center",
                  }}
                >
                  {formData.dateOfBirth?.split("-")[0]}
                </Box>
              </Box>
            </Box>

            <Typography sx={{ mt: 1, fontSize: "13px" }}>
              4. Details of parents :
            </Typography>
            <TableContainer sx={{ border: "1px solid #000" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                    <TableCell sx={cellStyle}>Details</TableCell>
                    <TableCell sx={cellStyle}>Mother</TableCell>
                    <TableCell sx={cellStyle}>Father / Guardian</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { l: "Name", m: "motherName", f: "fatherName" },
                    {
                      l: "Educational Qualification",
                      m: "motherEducation",
                      f: "fatherEducation",
                    },
                    {
                      l: "Residential Address",
                      m: "motherAddress",
                      f: "fatherAddress",
                    },
                    {
                      l: "Telephone / Mobile No.",
                      m: "motherPhone",
                      f: "fatherPhone",
                    },
                    { l: "E-mail", m: "motherEmail", f: "fatherEmail" },
                    {
                      l: "Occupation",
                      m: "motherOccupation",
                      f: "fatherOccupation",
                    },
                    {
                      l: "Official Address",
                      m: "motherOfficialAddress",
                      f: "fatherOfficialAddress",
                    },
                    {
                      l: "Annual Income",
                      m: "motherIncome",
                      f: "fatherIncome",
                    },
                  ].map((r) => (
                    <TableRow key={r.l}>
                      <TableCell sx={{ ...cellStyle, fontWeight: "bold" }}>
                        {r.l}
                      </TableCell>
                      <TableCell sx={cellStyle}>{formData[r.m]}</TableCell>
                      <TableCell sx={cellStyle}>{formData[r.f]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 1, fontSize: "12px" }}>
              <Typography>5. Whether the candidate is :</Typography>
              <Box sx={{ display: "flex", gap: 5, ml: 2 }}>
                <Typography>
                  (i) Single Girl Child : Yes [
                  {formData.singleChild === "Yes" ? "✔" : " "}] No [
                  {formData.singleChild === "No" ? "✔" : " "}]
                </Typography>
                <Typography>
                  (ii) Specially abled : Yes [
                  {formData.isDivyangan === "Yes" ? "✔" : " "}] No [
                  {formData.isDivyangan === "No" ? "✔" : " "}]
                </Typography>
              </Box>
              <Typography sx={{ mt: 1 }}>
                6. Category : Gen [{formData.category === "General" ? "✔" : " "}
                ] SC [{formData.category === "SC" ? "✔" : " "}] ST [
                {formData.category === "ST" ? "✔" : " "}] OBC [
                {formData.category === "OBC" ? "✔" : " "}]
              </Typography>
              <Typography sx={{ mt: 1 }}>
                7. Caste <b>{formData.caste}</b>
              </Typography>
              <Typography sx={{ mt: 1 }}>
                8. SubCaste : <b>{formData.subCaste}</b>
              </Typography>
              <Typography sx={{ mt: 1 }}>
                9. Religion : <b>{formData.religion}</b>
              </Typography>
              <Typography sx={{ mt: 1 }}>
                10. Nationality : <b>{formData.nationality}</b>
              </Typography>
              <Typography sx={{ mt: 1 }}>
                11. Aadhar No : <b>{formData.aadhaarNumber}</b>
              </Typography>
              <Typography sx={{ mt: 1 }}>
                12. Name & Address of the last Attended School :{" "}
                <b>{formData.nameAndaddress}</b>
              </Typography>
            </Box>
          </Paper>

          {/* PAGE 2 */}
          <Paper
            ref={page2Ref}
            sx={{
              width: "210mm",
              minHeight: "297mm",
              p: "15mm",
              fontFamily: "'Times New Roman', serif",
              color: "#000",
            }}
          >
            <Box sx={{ fontSize: "13px" }}>
              <Box sx={{ display: "flex", gap: 4, mb: 1 }}>
                <Typography>
                  13. Class Last Attended : <b>{formData.classLastattended}</b>
                </Typography>
                <Typography>
                  14. Dise code / STS No. : <b>{formData.diseCode}</b>
                </Typography>
              </Box>
              <Typography>15. Last School affiliated is :</Typography>
              <Typography sx={{ ml: 2 }}>
                (i) CBSE [{" "}
                {formData.lastSchoolAffiliation === "CBSE" ? "✔" : " "} ] (ii)
                ICSE [ {formData.lastSchoolAffiliation === "ICSE" ? "✔" : " "} ]
                (iii) IB [ {formData.lastSchoolAffiliation === "IB" ? "✔" : " "}{" "}
                ] (iv) State Board [{" "}
                {formData.lastSchoolAffiliation === "State Board" ? "✔" : " "} ]
              </Typography>

              <Typography sx={{ mt: 2 }}>16. Result of last class :</Typography>
              <TableContainer sx={{ border: "1px solid #000", mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                      <TableCell sx={cellStyle}>Subject</TableCell>
                      <TableCell sx={cellStyle}>Maximum Marks</TableCell>
                      <TableCell sx={cellStyle}>Marks obtained</TableCell>
                      <TableCell sx={cellStyle}>% of Marks</TableCell>
                      <TableCell sx={cellStyle}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.results.map((res, i) => (
                      <TableRow key={i} sx={{ height: "28px" }}>
                        <TableCell sx={cellStyle}>{res.subject}</TableCell>
                        <TableCell sx={cellStyle}>{res.maxMarks}</TableCell>
                        <TableCell sx={cellStyle}>
                          {res.marksObtained}
                        </TableCell>
                        <TableCell sx={cellStyle}>{res.percentage}</TableCell>
                        <TableCell sx={cellStyle}>{res.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography sx={{ mt: 2, fontWeight: "bold" }}>
                Transfer Certificate Details :
              </Typography>
              <Typography>
                17. Transfer Certificate No. :{" "}
                <b>{formData.transfercertificateNum}</b>
              </Typography>
              <Typography sx={{ ml: 4 }}>
                18. Date of Issue : <b>{formData.dateOfissue}</b>
              </Typography>

              <Typography sx={{ mt: 2 }}>
                19. Details of Siblings (if any)
              </Typography>
              <TableContainer sx={{ border: "1px solid #000", mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                      <TableCell sx={cellStyle}>Name</TableCell>
                      <TableCell sx={cellStyle}>Brother / Sister</TableCell>
                      <TableCell sx={cellStyle}>Age</TableCell>
                      <TableCell sx={cellStyle}>School studying in</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ height: "30px" }}>
                      <TableCell sx={cellStyle}>
                        {formData.siblingName}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {formData.siblingRelation}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {formData.siblingAge}
                      </TableCell>
                      <TableCell sx={cellStyle}>
                        {formData.siblingSchool}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography sx={{ mt: 2 }}>
                20. Mother Tongue : <b>{formData.motherToungue}</b>
              </Typography>

              <Typography
                align="center"
                sx={{
                  fontWeight: "bold",
                  textDecoration: "underline",
                  mt: 4,
                  fontSize: "16px",
                }}
              >
                DECLARATION
              </Typography>
              <Typography sx={{ mt: 2, textAlign: "justify", lineHeight: 1.6 }}>
                I hereby declare that the above information including Name of
                the Candidate, Father's / Guardian's Name, Mother's name and
                Date of Birth furnished by me is correct to the best of my
                knowledge & belief. I shall abide by the rules of the School.
              </Typography>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 8 }}
              >
                <Box>
                  <Typography>Date: .............................</Typography>
                  <Typography sx={{ mt: 2 }}>
                    Place: ............................
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography>
                    Signature of the Parents (s) / Guardian
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    Relation with candidate: .................................
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 6, borderTop: "1px dashed #000", pt: 2 }}>
                <Typography sx={{ fontSize: "11px" }}>
                  Correct entries from the Admission Forms to Admission and
                  Withdrawal Register have been made on page no
                  ................. on dated .................
                </Typography>
                <Typography align="right" sx={{ fontWeight: "bold", mt: 4 }}>
                  Signature of the Principal
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Admissiontemplate1;
