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
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";

const Admissiontemplateag2 = () => {
  const { colId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const printRef = useRef();
  const page1Ref = useRef();
  const page2Ref = useRef();

  const stepTitles = {
    1: "Office Use Only",
    2: "Personal Details",
    3: "Contact & Address",
    4: "Educational Details",
    5: "Documents & Source",
  };

  const [formData, setFormData] = useState({
    colId: colId,
    // --- Step 1: Office Use Only ---
    admissionFeeAmount: "", admissionFeeReceiptNo: "", admissionFeeDate: "",
    collegeFeeAmount: "", collegeFeeReceiptNo: "", collegeFeeDate: "",
    counselingFeeAmount: "", counselingFeeReceiptNo: "", counselingFeeDate: "",
    courseApplied: "", branchPreference1: "", branchPreference2: "", branchPreference3: "",
    instituteName: "", counselingRegistrationNo: "", counselingDOB: "",
    counselingRegisteredMobile: "", counselingOther: "",

    // --- Step 2: Personal Details ---
    firstName: "", middleName: "", lastName: "",
    fatherName: "", motherName: "",
    studentWhatsApp1: "", studentWhatsApp2: "",
    fatherWhatsApp: "", motherPhone: "",
    aadhaarNumber: "", dateOfBirth: "",
    
    // --- Step 3: Contact & Address ---
    permanentAddress: "", permanentDistrict: "", permanentState: "", permanentPinCode: "",
    correspondenceAddress: "", correspondenceDistrict: "", correspondenceState: "", correspondencePinCode: "",
    studentEmail: "", gender: "", parentEmail: "", category: "", caste: "", bloodGroup: "",
    religion: "", hostelRequired: "", fatherOccupation: "", annualIncome: "", sssmId: "",
    abcId: "", samagraId: "",

    // --- Step 4: Academic Details ---
    academicDetailsAg2: [
      { examination: "10th", boardUniversity: "", rollNo: "", marksObtain: "", maxMarks: "", percentage: "", yearOfPassing: "" },
      { examination: "12th", boardUniversity: "", rollNo: "", marksObtain: "", maxMarks: "", percentage: "", yearOfPassing: "" },
      { examination: "Diploma/Graduation", boardUniversity: "", rollNo: "", marksObtain: "", maxMarks: "", percentage: "", yearOfPassing: "" },
      { examination: "JEE/CMAT", boardUniversity: "", rollNo: "", marksObtain: "", maxMarks: "", percentage: "", yearOfPassing: "" },
    ],

    // --- Step 5: Documents & Source ---
    documentsList: [], sourceOfInquiry: [], otherSourceText: "", counselorName: "", referenceName: "", applicationNo: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const updated = [...formData[arrayName]];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, [arrayName]: updated });
  };

  const handleCheckboxChange = (name, value, isChecked) => {
    setFormData((prev) => {
      const currentList = prev[name];
      if (isChecked) {
        return { ...prev, [name]: [...currentList, value] };
      } else {
        return { ...prev, [name]: currentList.filter((item) => item !== value) };
      }
    });
  };

  const downloadPDF = async () => {
    const pages = [page1Ref.current, page2Ref.current];
    pages.forEach((p) => (p.style.display = "block"));

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    try {
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL("image/png");
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }
      pdf.save(`Admission_Form_${formData.firstName || "Student"}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      pages.forEach((p) => (p.style.display = "none"));
    }
  };

  const handleSubmit = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (step !== 5) return;

    const nameParts = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean);
    const fullName = nameParts.join(" ");

    try {
      const res = await ep1.post("/api/v2/createApplicationForm", {
        ...formData,
        name: fullName,
        templateType: "template2",
      });
      if (res.status === 201) {
        const serverData = res.data.data;
        setFormData((prev) => {
          const updatedData = { ...prev, applicationNo: serverData.applicationNo };
          setTimeout(async () => {
            await downloadPDF();
            navigate("/success");
          }, 500);
          return updatedData;
        });
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission Failed: " + (err.response?.data?.error || err.message));
    }
  };

  // Styles
  const cellStyle = { border: "1px solid #000", padding: "5px 8px", fontSize: "11px", color: "#000" };
  const labelStyle = { ...cellStyle, backgroundColor: "#f0f0f0", fontWeight: "bold" };
  const inputStyle = { border: "none", outline: "none", width: "100%", background: "transparent", fontSize: "11px" };
  const pageStyle = { width: "210mm", minHeight: "297mm", padding: "10mm 12mm", fontFamily: "'Arial', sans-serif", color: "#000", fontSize: "11px", backgroundColor: "#fff" };

  const documentOptions = ["Photographs", "10th Mark sheet", "12th Mark sheet", "Migration", "TC", "Caste Certificate", "EWS if applicable", "Graduation/ Diploma mark shee", "Income Certificate", "Entrance Exam Certificate", "Domicile Certificate", "Aadhar Card", "Samagra ID", "Bank Pass Book"];
  const sourceOptions = ["Facebook", "Consultant", "Student", "Instagram", "College website", "Google ads", "Faculty", "Hording"];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box ref={printRef}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
            CHAMELI DEVI GROUP OF INSTITUTIONS
          </Typography>
          <Typography align="center" color="text.secondary">Admissions / Inquiry Portal</Typography>
          <Typography align="center" sx={{ mb: 1 }}>
            Step {step} of 5: <strong>{stepTitles[step]}</strong>
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>

            {/* STEP 1: OFFICE USE ONLY */}
            {step === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Fee Details (Office Use Only)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}><FormField label="Admission Fee Amount" name="admissionFeeAmount" value={formData.admissionFeeAmount} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Receipt No" name="admissionFeeReceiptNo" value={formData.admissionFeeReceiptNo} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Date" type="date" name="admissionFeeDate" value={formData.admissionFeeDate} onChange={handleChange} /></Grid>
                  
                  <Grid item xs={4}><FormField label="College Fee Amount" name="collegeFeeAmount" value={formData.collegeFeeAmount} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Receipt No" name="collegeFeeReceiptNo" value={formData.collegeFeeReceiptNo} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Date" type="date" name="collegeFeeDate" value={formData.collegeFeeDate} onChange={handleChange} /></Grid>
                  
                  <Grid item xs={4}><FormField label="Counseling Fee Amount" name="counselingFeeAmount" value={formData.counselingFeeAmount} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Receipt No" name="counselingFeeReceiptNo" value={formData.counselingFeeReceiptNo} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Date" type="date" name="counselingFeeDate" value={formData.counselingFeeDate} onChange={handleChange} /></Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Course Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><FormField label="Course" name="courseApplied" value={formData.courseApplied} onChange={handleChange} required /></Grid>
                  <Grid item xs={6}><FormField label="Institute Name" name="instituteName" value={formData.instituteName} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Branch Preference 1" name="branchPreference1" value={formData.branchPreference1} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Branch Preference 2" name="branchPreference2" value={formData.branchPreference2} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Branch Preference 3" name="branchPreference3" value={formData.branchPreference3} onChange={handleChange} /></Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Counseling Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><FormField label="Registration No." name="counselingRegistrationNo" value={formData.counselingRegistrationNo} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="DOB" type="date" name="counselingDOB" value={formData.counselingDOB} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Registered Mobile" name="counselingRegisteredMobile" value={formData.counselingRegisteredMobile} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Other" name="counselingOther" value={formData.counselingOther} onChange={handleChange} /></Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 2: PERSONAL */}
            {step === 2 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Student's Full Name</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}><FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required /></Grid>
                  <Grid item xs={4}><FormField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required /></Grid>
                  <Grid item xs={6}><FormField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} /></Grid>
                  
                  <Grid item xs={6}><FormField label="Students What's App No. 1" name="studentWhatsApp1" value={formData.studentWhatsApp1} onChange={handleChange} required /></Grid>
                  <Grid item xs={6}><FormField label="Students What's App No. 2" name="studentWhatsApp2" value={formData.studentWhatsApp2} onChange={handleChange} /></Grid>
                  
                  <Grid item xs={6}><FormField label="Mobile No. (Father)" name="fatherWhatsApp" value={formData.fatherWhatsApp} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Mobile No. (Mother)" name="motherPhone" value={formData.motherPhone} onChange={handleChange} /></Grid>
                  
                  <Grid item xs={6}><FormField label="Aadhaar Card No." name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required /></Grid>
                  <Grid item xs={6}><FormField label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required /></Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 3: CONTACT & ADDRESS */}
            {step === 3 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Permanent Address</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}><FormField label="Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} required /></Grid>
                  <Grid item xs={4}><FormField label="Distt" name="permanentDistrict" value={formData.permanentDistrict} onChange={handleChange} required /></Grid>
                  <Grid item xs={4}><FormField label="State" name="permanentState" value={formData.permanentState} onChange={handleChange} required /></Grid>
                  <Grid item xs={4}><FormField label="Pin Code" name="permanentPinCode" value={formData.permanentPinCode} onChange={handleChange} required /></Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Correspondence Address</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}><FormField label="Address" name="correspondenceAddress" value={formData.correspondenceAddress} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Distt" name="correspondenceDistrict" value={formData.correspondenceDistrict} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="State" name="correspondenceState" value={formData.correspondenceState} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Pin Code" name="correspondencePinCode" value={formData.correspondencePinCode} onChange={handleChange} /></Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}><FormField label="Email (Student)" name="studentEmail" value={formData.studentEmail} onChange={handleChange} required /></Grid>
                  <Grid item xs={6}>
                    <FormField label="Gender" type="select" name="gender" value={formData.gender} onChange={handleChange} required
                      options={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }]} />
                  </Grid>
                  
                  <Grid item xs={6}><FormField label="Email (Parent)" name="parentEmail" value={formData.parentEmail} onChange={handleChange} /></Grid>
                  <Grid item xs={6}>
                    <FormField label="Category" type="select" name="category" value={formData.category} onChange={handleChange} required
                      options={[{ label: "SC", value: "SC" }, { label: "ST", value: "ST" }, { label: "OBC", value: "OBC" }, { label: "GEN", value: "GEN" }]} />
                  </Grid>

                  <Grid item xs={4}><FormField label="Caste" name="caste" value={formData.caste} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Religion" name="religion" value={formData.religion} onChange={handleChange} /></Grid>

                  <Grid item xs={4}>
                    <FormField label="Hostel Required (Y/N)" type="select" name="hostelRequired" value={formData.hostelRequired} onChange={handleChange}
                      options={[{ label: "Yes", value: "Y" }, { label: "No", value: "N" }]} />
                  </Grid>
                  <Grid item xs={4}><FormField label="Father's Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Annual Income" name="annualIncome" value={formData.annualIncome} onChange={handleChange} /></Grid>

                  <Grid item xs={4}><FormField label="SSSM ID" name="sssmId" value={formData.sssmId} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="ABC ID" name="abcId" value={formData.abcId} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Samagra ID" name="samagraId" value={formData.samagraId} onChange={handleChange} /></Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 4: ACADEMIC */}
            {step === 4 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Educational Details</Typography>
                <TableContainer sx={{ border: "1px solid #000" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                        <TableCell sx={labelStyle}>Examination</TableCell>
                        <TableCell sx={labelStyle}>Board/University</TableCell>
                        <TableCell sx={labelStyle}>Roll No</TableCell>
                        <TableCell sx={labelStyle}>Marks Obtain</TableCell>
                        <TableCell sx={labelStyle}>Max. Marks</TableCell>
                        <TableCell sx={labelStyle}>%</TableCell>
                        <TableCell sx={labelStyle}>Year of Passing</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.academicDetailsAg2.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{...cellStyle, fontWeight: 'bold', width: '20%'}}>{row.examination}</TableCell>
                          <TableCell sx={{...cellStyle, width: '20%'}}><input value={row.boardUniversity} onChange={(e) => handleArrayChange("academicDetailsAg2", i, "boardUniversity", e.target.value)} style={inputStyle} /></TableCell>
                          <TableCell sx={{...cellStyle, width: '15%'}}><input value={row.rollNo} onChange={(e) => handleArrayChange("academicDetailsAg2", i, "rollNo", e.target.value)} style={inputStyle} /></TableCell>
                          <TableCell sx={{...cellStyle, width: '10%'}}><input value={row.marksObtain} onChange={(e) => handleArrayChange("academicDetailsAg2", i, "marksObtain", e.target.value)} style={inputStyle} /></TableCell>
                          <TableCell sx={{...cellStyle, width: '10%'}}><input value={row.maxMarks} onChange={(e) => handleArrayChange("academicDetailsAg2", i, "maxMarks", e.target.value)} style={inputStyle} /></TableCell>
                          <TableCell sx={{...cellStyle, width: '10%'}}><input value={row.percentage} onChange={(e) => handleArrayChange("academicDetailsAg2", i, "percentage", e.target.value)} style={inputStyle} /></TableCell>
                          <TableCell sx={{...cellStyle, width: '15%'}}><input value={row.yearOfPassing} onChange={(e) => handleArrayChange("academicDetailsAg2", i, "yearOfPassing", e.target.value)} style={inputStyle} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* STEP 5: DOCUMENTS & OFFICE USE BOTTOM */}
            {step === 5 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                 <Typography variant="subtitle1" fontWeight="bold">Documents List</Typography>
                 <FormGroup row>
                    {documentOptions.map((doc) => (
                      <FormControlLabel
                        key={doc}
                        control={<Checkbox checked={formData.documentsList.includes(doc)} onChange={(e) => handleCheckboxChange("documentsList", doc, e.target.checked)} />}
                        label={doc}
                        sx={{ width: '45%' }}
                      />
                    ))}
                 </FormGroup>

                 <Divider sx={{ my: 1 }} />
                 <Typography variant="subtitle1" fontWeight="bold">Office Use Only Section</Typography>
                 <Grid container spacing={2}>
                    <Grid item xs={6}><FormField label="Counselor Name" name="counselorName" value={formData.counselorName} onChange={handleChange} /></Grid>
                    <Grid item xs={6}><FormField label="Reference Name" name="referenceName" value={formData.referenceName} onChange={handleChange} /></Grid>
                 </Grid>
                 
                 <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1 }}>Source:</Typography>
                 <FormGroup row>
                    {sourceOptions.map((src) => (
                      <FormControlLabel
                        key={src}
                        control={<Checkbox checked={formData.sourceOfInquiry.includes(src)} onChange={(e) => handleCheckboxChange("sourceOfInquiry", src, e.target.checked)} />}
                        label={src}
                        sx={{ width: '25%' }}
                      />
                    ))}
                    <FormControlLabel
                      control={<Checkbox checked={formData.sourceOfInquiry.includes("Other")} onChange={(e) => handleCheckboxChange("sourceOfInquiry", "Other", e.target.checked)} />}
                      label={
                        <Box display="flex" alignItems="center">
                          Other <input style={{ marginLeft: "8px", borderBottom: "1px solid #000", border: 'none', borderBottom: '1px solid black', outline: 'none' }} placeholder="(Specify)" value={formData.otherSourceText} name="otherSourceText" onChange={handleChange} disabled={!formData.sourceOfInquiry.includes("Other")} />
                        </Box>
                      }
                      sx={{ width: '45%' }}
                    />
                 </FormGroup>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
              <Button type="button" variant="outlined" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</Button>
              {step < 5 ? (
                <Button type="button" onClick={() => setStep(step + 1)} variant="contained">Next</Button>
              ) : (
                <Button type="submit" variant="contained" color="success" size="large">Submit & Download PDF</Button>
              )}
            </Box>
          </form>
        </Paper>

        {/* ═══════════════════════════════════════════
            PDF PRINT TEMPLATES
        ═══════════════════════════════════════════ */}
        <Box sx={{ position: "absolute", left: "-9999px", top: 0 }}>
          
          {/* PAGE 1: ADMISSION FORM */}
          <div ref={page1Ref} style={{ ...pageStyle, display: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <div style={{ width: "80%" }}>
                 <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px", letterSpacing: "1px" }}>CHAMELI DEVI GROUP OF INSTITUTIONS</div>
                 <div style={{ textAlign: "center", fontSize: "10px", marginBottom: "5px" }}>Gram Umrikheda, Khandwa Road, Indore - 452020 (Madhya Pradesh) • Phone: 0731-4243600</div>
                 <div style={{ display: "flex", justifyContent: "space-between", padding: "0 20px" }}>
                   <div>S.No. - CD/ <strong>2435</strong></div>
                   <div style={{ fontWeight: "bold", fontSize: "14px", backgroundColor: "#000", color: "#fff", padding: "2px 10px", borderRadius: "2px" }}>ADMISSION FORM</div>
                   <div>Date: {new Date().toLocaleDateString()}</div>
                 </div>
              </div>
              <div style={{ width: "20%", border: "1px solid #000", height: "80px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Photograph
              </div>
            </div>

            <div style={{ fontWeight: "bold", backgroundColor: "#d9d9d9", border: "1px solid #000", padding: "2px 5px", fontSize: "10px" }}>OFFICE USE ONLY</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "15px", fontSize: "10px" }}>
               <tbody>
                  <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold", textAlign: "center" }}>
                     <td style={cellStyle}>Fee Details</td>
                     <td style={cellStyle}>Amount</td>
                     <td style={cellStyle}>Receipt No</td>
                     <td style={cellStyle}>Date</td>
                     <td style={cellStyle} colSpan={2}>Course Details</td>
                  </tr>
                  <tr>
                     <td style={cellStyle}>Admission Fee</td>
                     <td style={cellStyle}>{formData.admissionFeeAmount}</td>
                     <td style={cellStyle}>{formData.admissionFeeReceiptNo}</td>
                     <td style={cellStyle}>{formData.admissionFeeDate}</td>
                     <td style={cellStyle}>Course</td>
                     <td style={cellStyle}>{formData.courseApplied}</td>
                  </tr>
                  <tr>
                     <td style={cellStyle}>College Fee</td>
                     <td style={cellStyle}>{formData.collegeFeeAmount}</td>
                     <td style={cellStyle}>{formData.collegeFeeReceiptNo}</td>
                     <td style={cellStyle}>{formData.collegeFeeDate}</td>
                     <td style={cellStyle}>Branch Preference</td>
                     <td style={cellStyle}>1. {formData.branchPreference1} 2. {formData.branchPreference2}</td>
                  </tr>
                  <tr>
                     <td style={cellStyle}>Counseling Fee</td>
                     <td style={cellStyle}>{formData.counselingFeeAmount}</td>
                     <td style={cellStyle}>{formData.counselingFeeReceiptNo}</td>
                     <td style={cellStyle}>{formData.counselingFeeDate}</td>
                     <td style={cellStyle}>Institute Name</td>
                     <td style={cellStyle}>{formData.instituteName}</td>
                  </tr>
                  <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold", textAlign: "center" }}>
                     <td style={cellStyle} colSpan={6}>Counseling Details</td>
                  </tr>
                  <tr>
                     <td style={cellStyle} colSpan={2}>Registration No.</td>
                     <td style={cellStyle} colSpan={2}>{formData.counselingRegistrationNo}</td>
                     <td style={cellStyle}>DOB</td>
                     <td style={cellStyle}>{formData.counselingDOB}</td>
                  </tr>
                  <tr>
                     <td style={cellStyle} colSpan={2}>Registered Mobile</td>
                     <td style={cellStyle} colSpan={2}>{formData.counselingRegisteredMobile}</td>
                     <td style={cellStyle}>Other</td>
                     <td style={cellStyle}>{formData.counselingOther}</td>
                  </tr>
               </tbody>
            </table>

            <div style={{ fontWeight: "bold", backgroundColor: "#d9d9d9", border: "1px solid #000", padding: "2px 5px", fontSize: "10px", marginTop: "10px" }}>PERSONAL DETAILS</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "15px", fontSize: "10px" }}>
               <tbody>
                  <tr><td style={{ ...labelStyle, width: "25%" }}>Student's Full Name:</td><td style={cellStyle} colSpan={3}>{formData.firstName} {formData.middleName} {formData.lastName}</td></tr>
                  <tr><td style={labelStyle}>Father's Name:</td><td style={cellStyle} colSpan={3}>{formData.fatherName}</td></tr>
                  <tr><td style={labelStyle}>Mother's Name:</td><td style={cellStyle} colSpan={3}>{formData.motherName}</td></tr>
                  <tr><td style={labelStyle}>Students What's App No. 1:</td><td style={cellStyle}>{formData.studentWhatsApp1}</td><td style={labelStyle}>2:</td><td style={cellStyle}>{formData.studentWhatsApp2}</td></tr>
                  <tr><td style={labelStyle}>Mobile No. (Father):</td><td style={cellStyle}>{formData.fatherWhatsApp}</td><td style={labelStyle}>Mobile No. (Mother):</td><td style={cellStyle}>{formData.motherPhone}</td></tr>
                  <tr><td style={labelStyle}>Aadhaar Card No.:</td><td style={cellStyle}>{formData.aadhaarNumber}</td><td style={labelStyle}>Date of Birth:</td><td style={cellStyle}>{formData.dateOfBirth}</td></tr>
                  
                  <tr><td style={labelStyle} colSpan={4}>Permanent Address: {formData.permanentAddress}</td></tr>
                  <tr><td style={labelStyle} colSpan={4}>Distt: {formData.permanentDistrict} &nbsp;&nbsp;&nbsp;&nbsp; State: {formData.permanentState} &nbsp;&nbsp;&nbsp;&nbsp; Pin Code: {formData.permanentPinCode}</td></tr>
                  
                  <tr><td style={labelStyle} colSpan={4}>Correspondence Address: {formData.correspondenceAddress}</td></tr>
                  <tr><td style={labelStyle} colSpan={4}>Distt: {formData.correspondenceDistrict} &nbsp;&nbsp;&nbsp;&nbsp; State: {formData.correspondenceState} &nbsp;&nbsp;&nbsp;&nbsp; Pin Code: {formData.correspondencePinCode}</td></tr>

                  <tr><td style={labelStyle}>Email (Student):</td><td style={cellStyle} colSpan={2}>{formData.studentEmail}</td><td style={cellStyle}>Gender: {formData.gender}</td></tr>
                  <tr><td style={labelStyle}>Email (Parent):</td><td style={cellStyle} colSpan={2}>{formData.parentEmail}</td><td style={cellStyle}>Category: {formData.category}</td></tr>
                  
                  <tr><td style={labelStyle} colSpan={4}>
                    Caste: {formData.caste} &nbsp;&nbsp;&nbsp;&nbsp; Blood Group: {formData.bloodGroup} &nbsp;&nbsp;&nbsp;&nbsp; Religion: {formData.religion} &nbsp;&nbsp;&nbsp;&nbsp; Hostel Required(Y/N): {formData.hostelRequired}
                  </td></tr>
                  <tr><td style={labelStyle} colSpan={4}>
                    Father's Occupation: {formData.fatherOccupation} &nbsp;&nbsp;&nbsp;&nbsp; Annual Income: {formData.annualIncome} &nbsp;&nbsp;&nbsp;&nbsp; SSSM ID: {formData.sssmId}
                  </td></tr>
               </tbody>
            </table>

            <div style={{ fontWeight: "bold", backgroundColor: "#d9d9d9", border: "1px solid #000", padding: "2px 5px", fontSize: "10px", marginTop: "10px" }}>EDUCATIONAL DETAILS</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "15px", fontSize: "10px" }}>
               <thead style={{ backgroundColor: "#f0f0f0", textAlign: "center" }}>
                  <tr>
                    <td style={labelStyle}>Examination</td><td style={labelStyle}>Board/University</td><td style={labelStyle}>Roll No</td>
                    <td style={labelStyle}>Marks Obtain</td><td style={labelStyle}>Max. Marks</td><td style={labelStyle}>%</td><td style={labelStyle}>Year of Passing</td>
                  </tr>
               </thead>
               <tbody style={{ textAlign: "center" }}>
                  {formData.academicDetailsAg2.map((row, i) => (
                    <tr key={i}>
                      <td style={cellStyle}>{row.examination}</td><td style={cellStyle}>{row.boardUniversity}</td><td style={cellStyle}>{row.rollNo}</td>
                      <td style={cellStyle}>{row.marksObtain}</td><td style={cellStyle}>{row.maxMarks}</td><td style={cellStyle}>{row.percentage}</td><td style={cellStyle}>{row.yearOfPassing}</td>
                    </tr>
                  ))}
               </tbody>
            </table>

          </div>

          {/* PAGE 2: ADMISSION INQUIRY FORM */}
          <div ref={page2Ref} style={{ ...pageStyle, display: "none" }}>
            <div style={{ textAlign: "center", border: "1px solid #000", padding: "5px", marginBottom: "10px", fontWeight: "bold" }}>
               ADMISSION INQUIRY FORM &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: {new Date().toLocaleDateString()}
            </div>
            
            {/* The pre-printed matrix for courses would be hard to hardcode perfectly, so we just summarize the preferences */}
            <div style={{ border: "1px solid #000", padding: "5px", marginBottom: "10px" }}>
               <b>Branch/Course Preference :</b> 1. {formData.branchPreference1} &nbsp;&nbsp;&nbsp; 2. {formData.branchPreference2} &nbsp;&nbsp;&nbsp; 3. {formData.branchPreference3}
            </div>

            <table style={{ width: "100%", tableLayout: "fixed" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "top", width: "60%" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Personal Details: (As per 10th MarkSheet)</div>
                    <div style={{ marginBottom: "3px" }}>Name of Student: <u>{formData.firstName} {formData.middleName} {formData.lastName}</u></div>
                    <div style={{ marginBottom: "3px" }}>Father's Name: <u>{formData.fatherName}</u></div>
                    <div style={{ marginBottom: "3px" }}>Mother Name: <u>{formData.motherName}</u></div>
                    <div style={{ marginBottom: "3px" }}>DOB: <u>{formData.dateOfBirth}</u> &nbsp;&nbsp; Gender: <u>{formData.gender}</u></div>
                    <div style={{ marginBottom: "3px" }}>Category: <u>{formData.category}</u> (OBC/SC/ST/Gen)</div>
                    <div style={{ marginBottom: "3px" }}>Student what's App No. 1: <u>{formData.studentWhatsApp1}</u></div>
                    <div style={{ marginBottom: "3px" }}>Father what's App No. 1: <u>{formData.fatherWhatsApp}</u></div>
                    <div style={{ marginBottom: "3px" }}>Aadhaar Card No.: <u>{formData.aadhaarNumber}</u> &nbsp;&nbsp; SSSM ID: <u>{formData.sssmId}</u></div>
                    <div style={{ marginBottom: "3px" }}>ABC ID: <u>{formData.abcId}</u> &nbsp;&nbsp; Blood Group: <u>{formData.bloodGroup}</u></div>
                    <div style={{ marginBottom: "3px" }}>Email ID (Student): <u>{formData.studentEmail}</u></div>
                    <div style={{ marginBottom: "3px" }}>Email ID (Parents): <u>{formData.parentEmail}</u></div>
                    <div style={{ marginBottom: "3px" }}>Permanent Address: <u>{formData.permanentAddress}</u></div>
                    <div style={{ marginBottom: "3px" }}>Distt: <u>{formData.permanentDistrict}</u> &nbsp;&nbsp; State: <u>{formData.permanentState}</u> &nbsp;&nbsp; Pin Code: <u>{formData.permanentPinCode}</u></div>
                  </td>
                  <td style={{ verticalAlign: "top", width: "40%" }}>
                     <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Documents List:</div>
                     {documentOptions.map((doc) => (
                        <div key={doc} style={{ marginBottom: "3px" }}>
                          [{formData.documentsList.includes(doc) ? "X" : " "}] {doc}
                        </div>
                     ))}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontWeight: "bold", marginTop: "15px", marginBottom: "5px" }}>Academic Details:</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", marginBottom: "15px", fontSize: "10px" }}>
               <thead style={{ backgroundColor: "#f0f0f0", textAlign: "center" }}>
                  <tr>
                    <td style={labelStyle}>Examination</td><td style={labelStyle}>Board/University</td><td style={labelStyle}>Roll No</td>
                    <td style={labelStyle}>Marks Obtain</td><td style={labelStyle}>Max. Marks</td><td style={labelStyle}>%</td><td style={labelStyle}>Year of Passing</td>
                  </tr>
               </thead>
               <tbody style={{ textAlign: "center" }}>
                  {formData.academicDetailsAg2.map((row, i) => (
                    <tr key={i}>
                      <td style={cellStyle}>{row.examination}</td><td style={cellStyle}>{row.boardUniversity}</td><td style={cellStyle}>{row.rollNo}</td>
                      <td style={cellStyle}>{row.marksObtain}</td><td style={cellStyle}>{row.maxMarks}</td><td style={cellStyle}>{row.percentage}</td><td style={cellStyle}>{row.yearOfPassing}</td>
                    </tr>
                  ))}
               </tbody>
            </table>

            <div style={{ fontWeight: "bold", backgroundColor: "#d9d9d9", border: "1px solid #000", padding: "2px 5px", fontSize: "10px", marginTop: "10px" }}>Office Use Only:</div>
            <div style={{ border: "1px solid #000", padding: "10px", fontSize: "11px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <div>Counselor Name: <u>{formData.counselorName}</u></div>
                  <div>Student's Signature: .......................................</div>
               </div>
               <div style={{ marginBottom: "15px" }}>Reference Name: <u>{formData.referenceName}</u></div>
               <div>
                 <span style={{ fontWeight: "bold", marginRight: "10px" }}>Source:</span>
                 {sourceOptions.map((src) => (
                    <span key={src} style={{ marginRight: "10px" }}>[{formData.sourceOfInquiry.includes(src) ? "X" : " "}] {src}</span>
                 ))}
                 <span>
                    [{formData.sourceOfInquiry.includes("Other") ? "X" : " "}] Other (<u>{formData.otherSourceText}</u>)
                 </span>
               </div>
            </div>

          </div>
        </Box>
      </Box>
    </Container>
  );
};

export default Admissiontemplateag2;
