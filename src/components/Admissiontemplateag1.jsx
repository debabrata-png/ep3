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
  const page3Ref = useRef();

  const stepTitles = {
    1: "Personal Information",
    2: "Nominee & Address Details",
    3: "Contact & Legal Reservation",
    4: "Education Details",
    5: "Subject & Document Details",
    6: "Guardian Info & Declaration",
  };

  const [formData, setFormData] = useState({
    colId: colId,
    // Personal
    lastName: "",
    firstName: "",
    middleName: "",
    fatherLastName: "",
    fatherFirstName: "",
    fatherMiddleName: "",
    motherName: "",
    maritalStatus: "",
    saralNo: "",
    dateOfBirth: "",
    gender: "",
    placeOfBirth: "",
    bloodGroup: "",
    grandfatherName: "",
    nativePlace: "",
    voterIdNo: "",
    organDonor: "",
    bankName: "",
    accountNo: "",
    transactionType: "",
    religion: "",
    citizenship: "",
    udiseNo: "",
    aadhaarNumber: "",
    drivingLicenceNo: "",
    // Nominee
    nomineeName: "",
    nomineeDob: "",
    nomineeAge: "",
    nomineeAadhar: "",
    nomineeMobile: "",
    // Address
    correspondenceAddress: "",
    correspondencePinCode: "",
    correspondenceState: "",
    correspondenceDistrict: "",
    correspondenceTehsil: "",
    correspondenceCity: "",
    permanentAddress: "",
    permanentPinCode: "",
    permanentState: "",
    permanentDistrict: "",
    permanentTehsil: "",
    permanentCity: "",
    // Contact
    studentPhone: "",
    parentPhone: "",
    studentMobile: "",
    studentEmail: "",
    // Legal Reservation
    domicileState: "",
    categoryType: "",
    casteCategory: "",
    subCaste: "",
    physicallyHandicapped: "",
    casteCertificateNo: "",
    learningDisabilityNo: "",
    // Social Reservation
    socialReservationName: "",
    // Education
    examName: "",
    boardName: "",
    schoolCollege: "",
    dateOfPassing: "",
    seatNumber: "",
    passingCertNo: "",
    gradeTotalMarks: "",
    marksObtained: "",
    percentage: "",
    // Qualifying Exam
    qualifyingExam: "",
    qualCollegeAttended: "",
    qualBoard: "",
    qualAdmissionYear: "",
    qualPassingYear: "",
    qualMarksObt: "",
    qualTotalMarks: "",
    qualPercentage: "",
    qualPlace: "",
    qualStream: "",
    qualEducationGap: "",
    qualSubjects: Array(3).fill({ subjectName: "", marksObtained: "" }),
    // Subjects
    subjectGroups: Array(3).fill({ groupName: "", subjectName: "" }),
    // Documents
    attachedDocuments: Array(3).fill({ documentName: "" }),
    // Guardian
    guardianName: "",
    guardianOccupation: "",
    guardianAnnualIncome: "",
    guardianRelationship: "",
    guardianPhone: "",
    // Other
    motherTongue: "",
    employmentStatus: "",
    nccNss: "",
    applyHostel: "",
    hobbies: "",
    sportParticipation: "",
    personalIdentificationMarks: "",
    applicationNo: "",
    courseApplied: "",
    registrationNo: "",
    collegeCode: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const updated = [...formData[arrayName]];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, [arrayName]: updated });
  };

  const downloadPDF = async () => {
    const pages = [page1Ref.current, page2Ref.current, page3Ref.current];
    pages.forEach((p) => (p.style.display = "block"));

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    try {
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          logging: false,
        });
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
    if (step !== 6) return;

    const nameParts = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean);
    const fullName = nameParts.join(" ");

    try {
      // 1. Hit the API first
      const res = await ep1.post("/api/v2/createApplicationForm", {
        ...formData,
        name: fullName,
        templateType: "template1",
      });
      // 2. Only if the API succeeds, trigger download and redirect
      if (res.status === 201) {
        const serverData = res.data.data;
        // Update form data state with the application number returned by the server
        setFormData((prev) => {
          const updatedData = { ...prev, applicationNo: serverData.applicationNo };
          
          // Using a small timeout to allow state to settle before PDF generation
          // is sometimes needed, but the navigation MUST wait for PDF generation.
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

  // ─── Styles ───────────────────────────────────────────────────
  const cellStyle = {
    border: "1px solid #000",
    padding: "5px 8px",
    fontSize: "11px",
    color: "#000",
  };
  const labelStyle = { ...cellStyle, backgroundColor: "#f0f0f0", fontWeight: "bold" };
  const inputStyle = { border: "none", outline: "none", width: "100%", background: "transparent", fontSize: "11px" };

  // ─── Print Page wrapper style ──────────────────────────────────
  const pageStyle = {
    width: "210mm",
    minHeight: "297mm",
    padding: "10mm 12mm",
    fontFamily: "'Arial', sans-serif",
    color: "#000",
    fontSize: "11px",
  };

  // ─── Reusable print cell builders ─────────────────────────────
  const PCell = ({ children, style = {}, colSpan, rowSpan }) => (
    <td colSpan={colSpan} rowSpan={rowSpan}
      style={{ border: "1px solid #000", padding: "4px 6px", fontSize: "11px", verticalAlign: "middle", ...style }}>
      {children}
    </td>
  );
  const PLabelCell = ({ children, style = {}, colSpan, rowSpan }) => (
    <PCell style={{ backgroundColor: "#f0f0f0", fontWeight: "bold", ...style }} colSpan={colSpan} rowSpan={rowSpan}>
      {children}
    </PCell>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box ref={printRef}>
        {/* ═══════════════════════════════════════════
            MULTI-STEP FORM (Visible to User)
        ═══════════════════════════════════════════ */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
            SAINT FRANCIS DE SALES COLLEGE
          </Typography>
          <Typography align="center" color="text.secondary">Seminary Hill, Nagpur, Maharashtra, India</Typography>
          <Typography align="center" sx={{ mb: 1 }}>
            Step {step} of 6: <strong>{stepTitles[step]}</strong>
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>

            {/* ── STEP 1: PERSONAL INFORMATION ── */}
            {step === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormField label="Course Applied For" name="courseApplied" value={formData.courseApplied} onChange={handleChange} required />
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Student Name</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}><FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required /></Grid>
                  <Grid item xs={4}><FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required /></Grid>
                  <Grid item xs={4}><FormField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} /></Grid>
                </Grid>

                <Typography variant="subtitle1" fontWeight="bold">Father's Name</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}><FormField label="Last Name" name="fatherLastName" value={formData.fatherLastName} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="First Name" name="fatherFirstName" value={formData.fatherFirstName} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Middle Name" name="fatherMiddleName" value={formData.fatherMiddleName} onChange={handleChange} /></Grid>
                </Grid>

                <FormField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormField label="Marital Status" type="select" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}
                      options={[{ label: "Unmarried", value: "UnMarried" }, { label: "Married", value: "Married" }, { label: "Divorced", value: "Divorced" }]} />
                  </Grid>
                  <Grid item xs={6}><FormField label="Saral No." name="saralNo" value={formData.saralNo} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={6}>
                    <FormField label="Gender" type="select" name="gender" value={formData.gender} onChange={handleChange}
                      options={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }]} />
                  </Grid>
                  <Grid item xs={6}><FormField label="Place of Birth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Grandfather Name" name="grandfatherName" value={formData.grandfatherName} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Native Place" name="nativePlace" value={formData.nativePlace} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Voter ID Card No." name="voterIdNo" value={formData.voterIdNo} onChange={handleChange} /></Grid>
                  <Grid item xs={6}>
                    <FormField label="Organ Donor" type="select" name="organDonor" value={formData.organDonor} onChange={handleChange}
                      options={[{ label: "Yes", value: "YES" }, { label: "No", value: "NO" }]} />
                  </Grid>
                  <Grid item xs={4}><FormField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Account No." name="accountNo" value={formData.accountNo} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Transaction Type" name="transactionType" value={formData.transactionType} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Religion" name="religion" value={formData.religion} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Citizenship" name="citizenship" value={formData.citizenship} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="U-DISE No." name="udiseNo" value={formData.udiseNo} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Aadhaar Card No." name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Driving Licence No." name="drivingLicenceNo" value={formData.drivingLicenceNo} onChange={handleChange} /></Grid>
                </Grid>
              </Box>
            )}

            {/* ── STEP 2: NOMINEE & ADDRESS ── */}
            {step === 2 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Nominee Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><FormField label="Nominee Name" name="nomineeName" value={formData.nomineeName} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Date of Birth" type="date" name="nomineeDob" value={formData.nomineeDob} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={3}><FormField label="Age" name="nomineeAge" value={formData.nomineeAge} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Aadhar Number" name="nomineeAadhar" value={formData.nomineeAadhar} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Mobile Number" name="nomineeMobile" value={formData.nomineeMobile} onChange={handleChange} /></Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Address of Correspondence</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={8}><FormField label="Address" name="correspondenceAddress" value={formData.correspondenceAddress} onChange={handleChange} multiline rows={2} /></Grid>
                  <Grid item xs={4}><FormField label="Pin Code" name="correspondencePinCode" value={formData.correspondencePinCode} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="State" name="correspondenceState" value={formData.correspondenceState} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="District" name="correspondenceDistrict" value={formData.correspondenceDistrict} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Tehsil" name="correspondenceTehsil" value={formData.correspondenceTehsil} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="City" name="correspondenceCity" value={formData.correspondenceCity} onChange={handleChange} /></Grid>
                </Grid>

                <Typography variant="subtitle1" fontWeight="bold">Permanent Address</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={8}><FormField label="Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} multiline rows={2} /></Grid>
                  <Grid item xs={4}><FormField label="Pin Code" name="permanentPinCode" value={formData.permanentPinCode} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="State" name="permanentState" value={formData.permanentState} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="District" name="permanentDistrict" value={formData.permanentDistrict} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Tehsil" name="permanentTehsil" value={formData.permanentTehsil} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="City" name="permanentCity" value={formData.permanentCity} onChange={handleChange} /></Grid>
                </Grid>
              </Box>
            )}

            {/* ── STEP 3: CONTACT & LEGAL RESERVATION ── */}
            {step === 3 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Contact Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><FormField label="Student Phone" name="studentPhone" value={formData.studentPhone} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Parent Phone" name="parentPhone" value={formData.parentPhone} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Student Mobile No." name="studentMobile" value={formData.studentMobile} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Student Email Id" name="studentEmail" value={formData.studentEmail} onChange={handleChange} /></Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Legal Reservation Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}><FormField label="Domicile State" name="domicileState" value={formData.domicileState} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Type of Category" name="categoryType" value={formData.categoryType} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Caste Category" name="casteCategory" value={formData.casteCategory} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Sub Caste" name="subCaste" value={formData.subCaste} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Phy. Handicapped" name="physicallyHandicapped" value={formData.physicallyHandicapped} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Caste Certificate No." name="casteCertificateNo" value={formData.casteCertificateNo} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Learning Disability No." name="learningDisabilityNo" value={formData.learningDisabilityNo} onChange={handleChange} /></Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Social Reservation (Special Category)</Typography>
                <FormField label="Social Reservation Name" name="socialReservationName" value={formData.socialReservationName} onChange={handleChange} />
              </Box>
            )}

            {/* ── STEP 4: EDUCATION DETAILS ── */}
            {step === 4 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Education Details (HSC / Last Exam)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}><FormField label="Name of Examination" name="examName" value={formData.examName} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Name of Board" name="boardName" value={formData.boardName} onChange={handleChange} /></Grid>
                  <Grid item xs={4}><FormField label="Name of School/College" name="schoolCollege" value={formData.schoolCollege} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Date of Passing" type="date" name="dateOfPassing" value={formData.dateOfPassing} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={3}><FormField label="Exam Seat Number" name="seatNumber" value={formData.seatNumber} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Passing Certificate No." name="passingCertNo" value={formData.passingCertNo} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Grade/Total Marks" name="gradeTotalMarks" value={formData.gradeTotalMarks} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Marks Obtained" name="marksObtained" value={formData.marksObtained} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Percentage / CGPA" name="percentage" value={formData.percentage} onChange={handleChange} /></Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Qualifying Exam Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}><FormField label="Qualifying Exam Name" name="qualifyingExam" value={formData.qualifyingExam} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="College Attended" name="qualCollegeAttended" value={formData.qualCollegeAttended} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Board/University" name="qualBoard" value={formData.qualBoard} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Admission Year" name="qualAdmissionYear" value={formData.qualAdmissionYear} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Passing Year" name="qualPassingYear" value={formData.qualPassingYear} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Marks Obtained" name="qualMarksObt" value={formData.qualMarksObt} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Total Marks" name="qualTotalMarks" value={formData.qualTotalMarks} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Percentage" name="qualPercentage" value={formData.qualPercentage} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Place" name="qualPlace" value={formData.qualPlace} onChange={handleChange} /></Grid>
                  <Grid item xs={3}><FormField label="Arts / Com / Sci" name="qualStream" value={formData.qualStream} onChange={handleChange} /></Grid>
                  <Grid item xs={3}>
                    <FormField label="Education Gap" type="select" name="qualEducationGap" value={formData.qualEducationGap} onChange={handleChange}
                      options={[{ label: "Yes", value: "YES" }, { label: "No", value: "NO" }]} />
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1 }}>Qualifying Exam Subject Details</Typography>
                <TableContainer sx={{ border: "1px solid #000" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                        <TableCell sx={labelStyle}>Sr. No.</TableCell>
                        <TableCell sx={labelStyle}>Subject Name</TableCell>
                        <TableCell sx={labelStyle}>Obtained Marks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.qualSubjects.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={cellStyle}>{i + 1}</TableCell>
                          <TableCell sx={cellStyle}>
                            <input value={row.subjectName} onChange={(e) => handleArrayChange("qualSubjects", i, "subjectName", e.target.value)} style={inputStyle} />
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            <input value={row.marksObtained} onChange={(e) => handleArrayChange("qualSubjects", i, "marksObtained", e.target.value)} style={inputStyle} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* ── STEP 5: SUBJECTS & DOCUMENTS ── */}
            {step === 5 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Subject Details</Typography>
                <TableContainer sx={{ border: "1px solid #000" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                        <TableCell sx={labelStyle}>Sr. No.</TableCell>
                        <TableCell sx={labelStyle}>Group Name</TableCell>
                        <TableCell sx={labelStyle}>Subject Name</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.subjectGroups.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={cellStyle}>{i + 1}</TableCell>
                          <TableCell sx={cellStyle}>
                            <input value={row.groupName} onChange={(e) => handleArrayChange("subjectGroups", i, "groupName", e.target.value)} style={inputStyle} />
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            <input value={row.subjectName} onChange={(e) => handleArrayChange("subjectGroups", i, "subjectName", e.target.value)} style={inputStyle} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Attached Documents</Typography>
                <TableContainer sx={{ border: "1px solid #000" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                        <TableCell sx={labelStyle}>Sr No.</TableCell>
                        <TableCell sx={labelStyle}>Name of Documents / Certificate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.attachedDocuments.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={cellStyle}>{i + 1}</TableCell>
                          <TableCell sx={cellStyle}>
                            <input value={row.documentName} onChange={(e) => handleArrayChange("attachedDocuments", i, "documentName", e.target.value)} style={inputStyle} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* ── STEP 6: GUARDIAN & OTHER ── */}
            {step === 6 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Guardian / Parent Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}><FormField label="Guardian's / Parent's Name" name="guardianName" value={formData.guardianName} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Occupation of Guardian/Parent" name="guardianOccupation" value={formData.guardianOccupation} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Annual Income" name="guardianAnnualIncome" value={formData.guardianAnnualIncome} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Relationship with Applicant" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Guardian/Parent Phone No." name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} /></Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Other Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}><FormField label="Mother Tongue" name="motherTongue" value={formData.motherTongue} onChange={handleChange} /></Grid>
                  <Grid item xs={4}>
                    <FormField label="Employment Status" type="select" name="employmentStatus" value={formData.employmentStatus} onChange={handleChange}
                      options={[{ label: "Yes", value: "YES" }, { label: "No", value: "NO" }]} />
                  </Grid>
                  <Grid item xs={4}>
                    <FormField label="Wish to join NCC/NSS" type="select" name="nccNss" value={formData.nccNss} onChange={handleChange}
                      options={[{ label: "Yes", value: "YES" }, { label: "No", value: "NO" }]} />
                  </Grid>
                  <Grid item xs={4}>
                    <FormField label="Apply for Hostel" type="select" name="applyHostel" value={formData.applyHostel} onChange={handleChange}
                      options={[{ label: "Yes", value: "YES" }, { label: "No", value: "NO" }]} />
                  </Grid>
                  <Grid item xs={8}><FormField label="Hobbies, Proficiency and Other Interests" name="hobbies" value={formData.hobbies} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Games and Sports Participation" name="sportParticipation" value={formData.sportParticipation} onChange={handleChange} /></Grid>
                  <Grid item xs={6}><FormField label="Personal Identification Marks" name="personalIdentificationMarks" value={formData.personalIdentificationMarks} onChange={handleChange} /></Grid>
                </Grid>

                <Box sx={{ mt: 3, p: 2, bgcolor: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 1 }}>
                  <Typography variant="h6" align="center" sx={{ textDecoration: "underline", mb: 1, fontWeight: "bold" }}>
                    REMARK OF THE ADMISSION COMMITTEE
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: "justify", lineHeight: 1.6 }}>
                    May be admitted to Class ______________ Section ______________ May be Rejected ______________
                    Last date of payment of fees ______________. Admission may be cancelled if the fees are not paid by this date.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* NAVIGATION */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
              <Button type="button" variant="outlined" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</Button>
              {step < 6 ? (
                <Button type="button" onClick={() => setStep(step + 1)} variant="contained">Next</Button>
              ) : (
                <Button type="submit" variant="contained" color="success" size="large">Submit & Download PDF</Button>
              )}
            </Box>
          </form>
        </Paper>

        {/* ═══════════════════════════════════════════
            PDF PRINT TEMPLATES (Hidden off-screen)
        ═══════════════════════════════════════════ */}
        <Box sx={{ position: "absolute", left: "-9999px", top: 0 }}>

          {/* ── PAGE 1 ── */}
          <div ref={page1Ref} style={{ ...pageStyle, display: "none" }}>
            {/* Header */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6px" }}>
              <tbody>
                <tr>
                  <td rowSpan={2} style={{ border: "1px solid #000", width: "15%", textAlign: "center", padding: "4px", fontWeight: "bold", fontSize: "10px" }}>
                    [LOGO]
                  </td>
                  <td style={{ border: "1px solid #000", textAlign: "center", padding: "4px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>SAINT FRANCIS DE SALES COLLEGE</div>
                    <div style={{ fontSize: "11px" }}>SEMINARY HILL, NAGPUR, MAHARASHTRA, INDIA</div>
                  </td>
                  <td style={{ border: "1px solid #000", width: "20%", padding: "4px", fontSize: "11px" }}>
                    <div><strong>College Code:</strong></div>
                    <div>{formData.collegeCode || "SFS"}</div>
                    <div><strong>Application No.:</strong></div>
                    <div>{formData.applicationNo || ""}</div>
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "4px", fontSize: "11px" }}>
                    <div><strong>For College use only</strong></div>
                    <div>Course Applied For : {formData.courseApplied || "BACHELOR OF ARTS(B.A) - 1"}</div>
                    <div>Registration Date :</div>
                  </td>
                  <td style={{ border: "1px solid #000", padding: "4px", fontSize: "11px" }}>
                    <div><strong>Registration No.</strong></div>
                    <div>{formData.registrationNo || ""}</div>
                    <div style={{ marginTop: "20px", textAlign: "center", border: "1px dashed #999", padding: "4px", fontSize: "10px" }}>Photo</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Section 1 */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>1. Personal information section</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", width: "25%" }}></td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0", width: "25%", textAlign: "center" }}>Last Name</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0", width: "25%", textAlign: "center" }}>First Name</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0", width: "25%", textAlign: "center" }}>Middle Name</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0" }}>Name of the Student</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{formData.lastName}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{formData.firstName}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{formData.middleName}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0" }}>Father's Name</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{formData.fatherLastName}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{formData.fatherFirstName}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{formData.fatherMiddleName}</td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ border: "1px solid #000", padding: "3px 6px" }}>Mother's Name : {formData.motherName}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Marital Status : {formData.maritalStatus}</td>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Saral No. : {formData.saralNo}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Date of Birth : {formData.dateOfBirth}</td>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Gender : {formData.gender}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Place of Birth : {formData.placeOfBirth}</td>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Blood Group : {formData.bloodGroup}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Grandfather Name : {formData.grandfatherName}</td>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Native Place : {formData.nativePlace}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Voter ID card No. : {formData.voterIdNo}</td>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Organ Donor: {formData.organDonor}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0" }}>Bank Name :</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Account No. : {formData.accountNo}</td>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Transaction Type : {formData.transactionType}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Religion : {formData.religion}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Citizenship of: {formData.citizenship}</td>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>U-DISE No. : {formData.udiseNo}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Aadhar card No. : {formData.aadhaarNumber}</td>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Driving Licence No. : {formData.drivingLicenceNo}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 2: Nominee */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>2. Nominee Details</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Name: {formData.nomineeName}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Date Of Birth: {formData.nomineeDob}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Age: {formData.nomineeAge}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Aadhar Number: {formData.nomineeAadhar}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Mobile Number: {formData.nomineeMobile}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 3: Address */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>3. Address Details</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0", width: "25%" }}>Address of Correspondance :</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", width: "50%" }}>{formData.correspondenceAddress}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Pin Code : {formData.correspondencePinCode}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>State : {formData.correspondenceState}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>District : {formData.correspondenceDistrict} &nbsp;&nbsp; Tehsil: {formData.correspondenceTehsil}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>City : {formData.correspondenceCity}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0" }}>Permanent Address :</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{formData.permanentAddress}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Pin Code : {formData.permanentPinCode}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>State : {formData.permanentState}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>District : {formData.permanentDistrict} &nbsp;&nbsp; Tehsil: {formData.permanentTehsil}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>City : {formData.permanentCity}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 4: Contact */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>4. Contact Details</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Student Phone : {formData.studentPhone}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Parent phone : {formData.parentPhone}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Student Mobile No. : {formData.studentMobile}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Student Email Id : {formData.studentEmail}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 5: Legal Reservation */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>5. Legal Reservation Information Section</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Domicile state : {formData.domicileState}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Type of Category : {formData.categoryType}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Caste Category : {formData.casteCategory}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Sub Caste : {formData.subCaste}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Phy. Handicapped : {formData.physicallyHandicapped}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Caste Certificate No. : {formData.casteCertificateNo}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Learning Disability No. : {formData.learningDisabilityNo}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── PAGE 2 ── */}
          <div ref={page2Ref} style={{ ...pageStyle, display: "none" }}>

            {/* Section 6: Social Reservation */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "0 0 3px 0" }}>6. Social Reservation (Special Category) Information Section</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0", width: "20%" }}>SR No.</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", backgroundColor: "#f0f0f0", textAlign: "center" }}>SOCIAL RESERVATION NAME</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", height: "30px" }}></td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{formData.socialReservationName}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 7: Education Details */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>7. Education Details Section</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
              <tbody>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  {["Name of Examination","Name of Board","Name of school/College","Date of Passing","Examination Seat Number","Passing certificate No.","Grade/Total Marks","Obt. Marks","% CGPA"].map(h => (
                    <td key={h} style={{ border: "1px solid #000", padding: "2px 4px", fontWeight: "bold" }}>{h}</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.examName}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.boardName}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.schoolCollege}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.dateOfPassing}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.seatNumber}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.passingCertNo}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.gradeTotalMarks}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.marksObtained}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.percentage}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 8: Qualifying Exam */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>8. Qualifying Exam Details Section</div>
            <div style={{ fontSize: "11px", marginBottom: "3px" }}>Qualifying Exam Name : {formData.qualifyingExam}</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
              <tbody>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  {["College/School Attended","Board/university","Admission Year","Passing Year","Marks Obt","Total Marks","Percentage","Place","Arts/Com/Sci","Education Gap"].map(h => (
                    <td key={h} style={{ border: "1px solid #000", padding: "2px 4px", fontWeight: "bold" }}>{h}</td>
                  ))}
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualCollegeAttended}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualBoard}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualAdmissionYear}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualPassingYear}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualMarksObt}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualTotalMarks}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualPercentage}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualPlace}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualStream}</td>
                  <td style={{ border: "1px solid #000", padding: "2px 4px" }}>{formData.qualEducationGap}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontWeight: "bold", fontSize: "11px", margin: "5px 0 3px 0", textDecoration: "underline", textAlign: "center" }}>Qualifying Exam Subject Details</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", width: "15%" }}>Sr. No.</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>Subject Name</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>Obtained Marks</td>
                </tr>
                {formData.qualSubjects.map((s, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{i + 1}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{s.subjectName}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{s.marksObtained}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Section 9: Subject Details */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>9. Subject Details Section</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", width: "15%" }}>Sr. No.</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", width: "35%" }}>Group Name</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>Subject Name</td>
                </tr>
                {formData.subjectGroups.map((s, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{i + 1}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{s.groupName}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{s.subjectName}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Section 10: Documents */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>10. Attached Documents</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", width: "15%" }}>Sr No.</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold", textAlign: "center" }}>Name of Documenets/Certificate</td>
                </tr>
                {formData.attachedDocuments.map((d, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000", padding: "3px 6px" }}>{i + 1}</td>
                    <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center" }}>{d.documentName}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Section 11: Guardian */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>11. Guardian / Parent Information Section</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ border: "1px solid #000", padding: "3px 6px" }}>Guardian's/Parent's Name : {formData.guardianName}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Occupation of the Guardian/Parent : {formData.guardianOccupation}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Annual Income of the guardian/Parent : {formData.guardianAnnualIncome}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Relationship of Guardian with applicant : {formData.guardianRelationship}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Guardian/Parent Phone No. : {formData.guardianPhone}</td>
                </tr>
              </tbody>
            </table>

            {/* Section 12: Other Info */}
            <div style={{ fontWeight: "bold", fontSize: "12px", margin: "6px 0 3px 0" }}>12. Other Information Section</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Mother Tongue : {formData.motherTongue}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Employment Status : {formData.employmentStatus}</td>
                  <td style={{ border: "1px solid #000", padding: "3px 6px" }}>Do you wish to join NCC / NSS: {formData.nccNss}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 6px" }}>Would you like to apply for Hostel : {formData.applyHostel}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 6px" }}>Hobbies, Proficiency and Other interests : {formData.hobbies}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 6px" }}>Games and sports participation : {formData.sportParticipation}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 6px" }}>Personal Identification Marks : {formData.personalIdentificationMarks}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── PAGE 3: Admission Committee Remarks ── */}
          <div ref={page3Ref} style={{ ...pageStyle, display: "none" }}>
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", textDecoration: "underline", margin: "40px 0 20px 0" }}>
              REMARK OF THE ADMISSION COMMITTEE
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "20px 16px", lineHeight: "2.2", fontSize: "12px" }}>
                    <div>May &nbsp;&nbsp;&nbsp; be &nbsp;&nbsp;&nbsp; admitted &nbsp;&nbsp;&nbsp; to &nbsp;&nbsp;&nbsp; Class___________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                    <div>Section____________________________</div>
                    <div>May &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; be</div>
                    <div>Rejected_______________________</div>
                    <div>Last &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; of &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; payment &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; of</div>
                    <div>fees_______________________</div>
                    <div style={{ marginTop: "8px" }}>Admission may be cancelled if the fees are not paid by this date.</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "60px", fontWeight: "bold" }}>
                      <span>Principal</span>
                      <span>Signature of Admission Committee</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </Box>
      </Box>
    </Container>
  );
};

export default Admissiontemplate1;