import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ep1 from "../api/ep1";
import FormField from "../components/FormField";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  FormLabel,
  MenuItem,
  TextField,
  Divider,
} from "@mui/material";

const Admissiontemplate3 = () => {
  const navigate = useNavigate();
  const { colId } = useParams();
  const printRef = useRef();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    colId: colId || "",
    programAppliedFor: "",
    disciplineSpecificCore: "",
    languagesChosen: [],
    otherLanguagesSpecify: "",
    name: "",
    dateOfBirth: "",
    ageInYears: "",
    motherName: "",
    fatherName: "",
    parentresidentialAddress: "",
    studentEmail: "",
    parentEmail: "",
    studentMobile: "",
    parentMobile: "",
    aadharNo: "",
    nationality: "Indian",
    foreignNationalCountry: "",
    villageTown: "",
    taluk: "",
    district: "",
    state: "",
    gender: "Male",
    bloodGroup: "",
    areaType: "Urban",
    religion: "",
    caste: "",
    subCaste: "",
    category: "",
    isDivyangan: "No",
    studentVehicleNo: "",
    twelfthSchoolName: "",
    twelfthRegNo: "",
    twelfthYearOfPassing: "",
    twelfthMarks: "",
    qualifyingPercentage: "",
    qualifyingClass: "",
    languagesStudiedPrevious: ["", ""],
    optionalSubjectsStudied: ["", "", "", "", "", ""],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLanguageChange = (lang) => {
    const current = [...formData.languagesChosen];
    if (current.includes(lang)) {
      setFormData({
        ...formData,
        languagesChosen: current.filter((l) => l !== lang),
      });
    } else if (current.length < 2) {
      setFormData({ ...formData, languagesChosen: [...current, lang] });
    }
  };

  const handleNestedListChange = (index, value, field) => {
    const newList = [...formData[field]];
    newList[index] = value;
    setFormData({ ...formData, [field]: newList });
  };

  const generatePDF = async () => {
    const element = printRef.current;
    element.style.display = "block";
    try {
      const canvas = await html2canvas(element, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Admission_${formData.nameOfApplicant}.pdf`);
      return true;
    } catch (error) {
      console.error("PDF Error:", error);
      return false;
    } finally {
      element.style.display = "none";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      ageInYears: Number(formData.ageInYears) || 0,
      emailId: {
        student: formData.studentEmail,
        parents: formData.parentEmail,
      },
      mobileNo: {
        student: formData.studentMobile,
        parents: formData.parentMobile,
      },
      placeOfBirth: {
        villageTown: formData.villageTown,
        taluk: formData.taluk,
        district: formData.district,
        state: formData.state,
      },
      qualifyingExamDetails: {
        regNo: formData.twelfthRegNo,
        monthYearOfPassing: formData.twelfthYearOfPassing,
        totalMarksObtained: Number(formData.twelfthMarks) || 0,
        percentage: formData.qualifyingPercentage,
        classDivision: formData.qualifyingClass,
      },
    };

    try {
      const res = await ep1.post("/api/v2/createApplicationFormann", payload);
      if (res.status === 201 || res.status === 200) {
        await generatePDF();
        navigate("/success");
      }
    } catch (err) {
      alert(
        "Submission Failed: " + (err.response?.data?.message || "Server Error"),
      );
    }
  };

  // PDF Table Styling
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid black",
    marginTop: "5px",
  };
  const cellStyle = {
    border: "1px solid black",
    padding: "4px",
    fontSize: "10px",
    verticalAlign: "top",
  };
  const labelStyle = {
    ...cellStyle,
    fontWeight: "bold",
    backgroundColor: "#f2f2f2",
    width: "150px",
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <Paper ref={printRef}
        elevation={4}
        sx={{ maxWidth: 950, mx: "auto", p: { xs: 2, md: 5 }, borderRadius: 3 }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: "800", mb: 1, color: "#1a237e" }}
        >
          ADMISSION FORM
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ mb: 4, color: "text.secondary" }}
        >
          SBRR Mahajana First Grade College (Autonomous)
        </Typography>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#1a237e", mb: 2, fontWeight: "bold" }}
              >
                1. Academic & Language Preference
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormLabel
                sx={{
                  fontWeight: "bold",
                  color: "black",
                  display: "block",
                  mb: 1,
                }}
              >
                Program Applied For *
              </FormLabel>
              <RadioGroup
                row
                name="programAppliedFor"
                value={formData.programAppliedFor}
                onChange={handleChange}
              >
                {["B.A.", "B.Com.", "BBA", "B.Sc.", "BCA", "BCA (AI)"].map(
                  (p) => (
                    <FormControlLabel
                      key={p}
                      value={p}
                      control={<Radio required />}
                      label={p}
                    />
                  ),
                )}
              </RadioGroup>

              <TextField
                select
                fullWidth
                label="Discipline Specific Core (DSC) (Tick any one group of Subjects) *"
                name="disciplineSpecificCore"
                value={formData.disciplineSpecificCore}
                onChange={handleChange}
                sx={{ mt: 3 }}
                required
              >
                <MenuItem value="HEG">History, Economics, Geography</MenuItem>
                <MenuItem value="HES">History, Economics, Sociology</MenuItem>
                <MenuItem value="JEE">Journalism, Economics, English</MenuItem>
                <MenuItem value="PMCs">Physics, Math, Comp Science</MenuItem>
                <MenuItem value="BtBM">Biotech, Botany, Microbiology</MenuItem>
                <MenuItem value="PCM">Physics, Chemistry, Math</MenuItem>
                <MenuItem value="CPB">
                  Criminology, Psychology, Biochem
                </MenuItem>
              </TextField>

              <Box sx={{ mt: 3 }}>
                <FormLabel
                  sx={{
                    fontWeight: "bold",
                    color: "black",
                    mb: 1,
                    display: "block",
                  }}
                >
                  Languages (Choose any two languages) *
                </FormLabel>
                <FormGroup row>
                  {[
                    "Kannada",
                    "Hindi",
                    "Sanskrit",
                    "English",
                    "French",
                    "Malayalam",
                    "Tamil",
                    "Urdu",
                  ].map((l) => (
                    <FormControlLabel
                      key={l}
                      control={
                        <Checkbox
                          checked={formData.languagesChosen.includes(l)}
                          onChange={() => handleLanguageChange(l)}
                        />
                      }
                      label={l}
                    />
                  ))}
                </FormGroup>
                <FormField
                  label="Other Languages (Specify)"
                  name="otherLanguagesSpecify"
                  value={formData.otherLanguagesSpecify}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#1a237e", mb: 2, fontWeight: "bold" }}
              >
                2. Applicant Details
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", mb: 2, fontStyle: "italic" }}
              >
                Note: Fill the form Legibly in Capital Letters
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormField
                    label="Full Name (CAPITALS) *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="DOB *"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="Age in years"
                    name="ageInYears"
                    type="number"
                    value={formData.ageInYears}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="TG">TG</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <FormField
                    label="Blood Group"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    select
                    label="Area"
                    name="areaType"
                    value={formData.areaType}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="Urban">Urban</MenuItem>
                    <MenuItem value="Rural">Rural</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <FormField
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormField
                    label="If Foreign, Mention the Country"
                    name="foreignNationalCountry"
                    value={formData.foreignNationalCountry}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormField
                    label="Aadhar No *"
                    name="aadharNo"
                    value={formData.aadharNo}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, fontWeight: "bold" }}
                  >
                    Place of Birth
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <FormField
                    label="Village/Town"
                    name="villageTown"
                    value={formData.villageTown}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormField
                    label="Taluk"
                    name="taluk"
                    value={formData.taluk}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormField
                    label="District"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button variant="outlined" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="contained" onClick={() => setStep(3)}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {step === 3 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#1a237e", mb: 2, fontWeight: "bold" }}
              >
                3. Social Status & Contact
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <FormField
                    label="Religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormField
                    label="Caste"
                    name="caste"
                    value={formData.caste}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="Sub-Caste"
                    name="subCaste"
                    value={formData.subCaste}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Divyangan (PwD)"
                    name="isDivyangan"
                    value={formData.isDivyangan}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <FormField
                    label="Student Email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="Student Mobile"
                    name="studentMobile"
                    value={formData.studentMobile}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormField
                    label="Vehicle Number (if any)"
                    name="studentVehicleNo"
                    value={formData.studentVehicleNo}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Parent Details
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="Mother Name"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="Father/Guardian Name"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="Parent Email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="Parent Mobile"
                    name="parentMobile"
                    value={formData.parentMobile}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormField
                    label="Full Residential Address"
                    name="parentresidentialAddress"
                    multiline
                    rows={2}
                    value={formData.parentresidentialAddress}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button variant="outlined" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button variant="contained" onClick={() => setStep(4)}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {step === 4 && (
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#1a237e", mb: 2, fontWeight: "bold" }}
              >
                4. Academic History
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormField
                    label="Previous Institution"
                    name="twelfthSchoolName"
                    value={formData.twelfthSchoolName}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormField
                    label="PUC Reg No"
                    name=" twelfthRegNo"
                    value={formData.twelfthRegNo}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormField
                    label="Year of Passing"
                    name="twelfthYearOfPassing"
                    value={formData.twelfthYearOfPassing}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormField
                    label="Total Marks"
                    name="twelfthMarks"
                    type="number"
                    value={formData.twelfthMarks}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="Percentage %"
                    name="qualifyingPercentage"
                    value={formData.qualifyingPercentage}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormField
                    label="Class/Division"
                    name="qualifyingClass"
                    value={formData.qualifyingClass}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, fontWeight: "bold" }}
                  >
                    Previous Languages & Optionals
                  </Typography>
                </Grid>
                {formData.languagesStudiedPrevious.map((val, i) => (
                  <Grid item xs={6} key={`lang-${i}`}>
                    <TextField
                      label={`Language ${i + 1}`}
                      fullWidth
                      value={val}
                      onChange={(e) =>
                        handleNestedListChange(
                          i,
                          e.target.value,
                          "languagesStudiedPrevious",
                        )
                      }
                    />
                  </Grid>
                ))}
                {formData.optionalSubjectsStudied.map((val, i) => (
                  <Grid item xs={4} key={`opt-${i}`}>
                    <TextField
                      label={`Optional ${i + 1}`}
                      fullWidth
                      value={val}
                      onChange={(e) =>
                        handleNestedListChange(
                          i,
                          e.target.value,
                          "optionalSubjectsStudied",
                        )
                      }
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button variant="outlined" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  type="submit"
                  size="large"
                >
                  Final Submit
                </Button>
              </Box>
            </Box>
          )}
        </form>
      </Paper>

      {/* --- PDF TEMPLATE (HIDDEN) --- */}
      <Box sx={{ position: "absolute", left: "-10000px" }}>
        <div
          ref={printRef}
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "10mm",
            background: "#fff",
            color: "#000",
          }}
        >
          {/* Header with Photo Space */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid black",
              paddingBottom: "10px",
            }}
          >
            <div style={{ width: "70%" }}>
              <Typography style={{ fontSize: "16px", fontWeight: "bold" }}>
                SBRR MAHAJANA FIRST GRADE COLLEGE (Autonomous)
              </Typography>
              <Typography style={{ fontSize: "11px" }}>
                Jayalakshmipuram, Mysuru - 570 012
              </Typography>
              <Typography
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                APPLICATION FORM FOR ADMISSION TO FIRST YEAR DEGREE PROGRAM
              </Typography>
            </div>

            <div
              style={{
                width: "35mm",
                height: "45mm",
                border: "1px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: "9px",
                padding: "5px",
              }}
            >
              Affix Passport Size <br /> Photograph Here
            </div>
          </div>

          <table style={{ ...tableStyle, marginTop: "15px" }}>
            <tbody>
              <tr>
                <td style={labelStyle}>Program Applied:</td>
                <td style={cellStyle}>{formData.programAppliedFor}</td>
                <td style={labelStyle}>Discipline Specific core:</td>
                <td style={cellStyle}>{formData.disciplineSpecificCore}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Languages:</td>
                <td style={cellStyle}>{formData.languagesChosen.join(", ")}</td>
                <td style={labelStyle}>Other Languages:</td>
                <td style={cellStyle}>{formData.otherLanguagesSpecify}</td>
              </tr>
            </tbody>
          </table>

          <div
            style={{ marginTop: "10px", fontWeight: "bold", fontSize: "11px" }}
          >
            PERSONAL DETAILS (CAPITAL LETTERS)
          </div>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={labelStyle}> Name of Applicant:</td>
                <td style={cellStyle} colSpan="3">
                  <b>{formData.nameOfApplicant}</b>
                </td>
              </tr>
              <tr>
                <td style={labelStyle}> Date of Birth:</td>
                <td style={cellStyle}>{formData.dateOfBirth}</td>
                <td style={labelStyle}>Age in Years:</td>
                <td style={cellStyle}>{formData.ageInYears}</td>
              </tr>
              <tr>
                <td style={labelStyle}> Mother's Name:</td>
                <td style={cellStyle} colSpan="3">
                  {formData.motherName}
                </td>
              </tr>
              <tr>
                <td style={labelStyle}> Father's Name:</td>
                <td style={cellStyle} colSpan="3">
                  {formData.fatherName}
                </td>
              </tr>
              <tr>
                <td style={labelStyle}> Residential Address:</td>
                <td style={cellStyle} colSpan="3">
                  {formData.parentresidentialAddress}
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Student Email:</td>
                <td style={cellStyle}>{formData.studentEmail}</td>
                <td style={labelStyle}>Student Mobile:</td>
                <td style={cellStyle}>{formData.studentMobile}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Parent Email:</td>
                <td style={cellStyle}>{formData.parentEmail}</td>
                <td style={labelStyle}>Parent Mobile:</td>
                <td style={cellStyle}>{formData.parentMobile}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Aadhar No:</td>
                <td style={cellStyle}>{formData.aadharNo}</td>
                <td style={labelStyle}>Nationality:</td>
                <td style={cellStyle}>{formData.nationality}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Place of Birth:</td>
                <td style={cellStyle} colSpan="3">
                  {[
                    formData.villageTown,
                    formData.taluk,
                    formData.district,
                    formData.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Gender:</td>
                <td style={cellStyle}>{formData.gender}</td>
                <td style={labelStyle}>Blood Group:</td>
                <td style={cellStyle}>{formData.bloodGroup}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Religion:</td>
                <td style={cellStyle}>{formData.religion}</td>
                <td style={labelStyle}>Caste / Category:</td>
                <td style={cellStyle}>
                  {formData.caste} ({formData.category})
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{ marginTop: "10px", fontWeight: "bold", fontSize: "11px" }}
          >
            ACADEMIC RECORD (PUC / EQUIVALENT)
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <td style={cellStyle}>Reg. No.</td>
                <td style={cellStyle}>Passing Year</td>
                <td style={cellStyle}>Total Marks</td>
                <td style={cellStyle}>Percentage</td>
                <td style={cellStyle}>Class</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellStyle}>{formData.twelfthRegNo}</td>
                <td style={cellStyle}>{formData.twelfthYearOfPassing}</td>
                <td style={cellStyle}>{formData.twelfthMarks}</td>
                <td style={cellStyle}>{formData.qualifyingPercentage}%</td>
                <td style={cellStyle}>{formData.qualifyingClass}</td>
              </tr>
            </tbody>
          </table>
          <div
            style={{ marginTop: "10px", fontWeight: "bold", fontSize: "12px" }}
          >
            Languages & Optionals Studied
          </div>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <td style={labelStyle}>Languages Studied:</td>
                <td style={cellStyle} colSpan="3">
                  {formData.languagesStudiedPrevious.join(", ")}
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Optional Subjects Studied:</td>
                <td style={cellStyle} colSpan="3">
                  {formData.optionalSubjectsStudied.filter(Boolean).join(", ")}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              marginTop: "60px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: "200px",
                borderTop: "1px solid black",
                textAlign: "center",
                fontSize: "10px",
              }}
            >
              Signature of Parent/Guardian
            </div>
            <div
              style={{
                width: "200px",
                borderTop: "1px solid black",
                textAlign: "center",
                fontSize: "10px",
              }}
            >
              Signature of Student
            </div>
          </div>

          {/* --- CATEGORY BOX AT THE END --- */}
          <div
            style={{
              marginTop: "30px",
              padding: "8px",
              border: "1px solid black",
              fontSize: "9px",
              lineHeight: "1.4",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
              * Category :
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <span>1.</span>
              <span>
                <strong>FN (ವಿದೇಶಿಗರು)</strong> – Foreign National
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
              <span>2.</span>
              <div>
                ಮೀಸಲಾತಿ ಅಡಿಯಲ್ಲಿ ಪ್ರವೇಶಾತಿಯನ್ನು ಬಯಸುವ ಅಭ್ಯರ್ಥಿಗಳು ಗೆಜೆಟೆಡ್
                ಅಧಿಕಾರಿಯಿಂದ ದೃಢೀಕರಿಸಿದ ಜಾತಿ / ಆದಾಯ ಪ್ರಮಾಣಪತ್ರದ ನಕಲು ಪ್ರತಿಯನ್ನು
                ಅರ್ಜಿಯೊಂದಿಗೆ ಲಗತ್ತಿಸಬೇಕು. ಸಲ್ಲಿಸದ ಅಭ್ಯರ್ಥಿಗಳನ್ನು ಸಾಮಾನ್ಯ ವರ್ಗದ
                ಅಭ್ಯರ್ಥಿಗಳೆಂದು ಪರಿಗಣಿಸಲಾಗುವುದು. <br />
                <em>
                  Candidates seeking admission under reservation should enclose
                  photocopies of valid caste /income certificate duly attested
                  by a Gazetted Officer, failing which they will be considered
                  under GM Category.
                </em>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default Admissiontemplate3;
