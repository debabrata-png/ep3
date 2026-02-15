import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    TextField,
    Grid,
    Alert,
    Divider,
    Avatar
} from "@mui/material";
import { Save, Person, Download } from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const StaffProfileds = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        phone: "", gender: "", photo: "", category: "", address: "", quota: "", dob: "",
        fathername: "", mothername: "", eligibilityname: "", degree: "", minorsub: "",
        vocationalsub: "", mdcsub: "", othersub: "", merit: "", obtain: "",
        bonus: "", weightage: "", ncctype: "", isdisabled: "", scholarship: "",
        designation: "", adhaarno: "", wpno: "", bloodgroup: "", cbseno: "",
        abcid: "", income: "", joiningdate: ""
    });

    const [readOnlyData, setReadOnlyData] = useState({
        name: "", email: "", regno: "", role: "", department: "",
        programcode: "", semester: "", section: "", admissionyear: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await ep1.get("/api/v2/ds1getstudentprofile", {
                params: { email: global1.user }
            });

            const userData = res.data.data;

            setReadOnlyData({
                name: userData.name,
                email: userData.email,
                regno: userData.regno, // Shown as Employee No
                role: userData.role,
                department: userData.department,
                programcode: userData.programcode,
                semester: userData.semester, // Shown as UUID
                section: userData.section,
                admissionyear: userData.admissionyear // Shown as Joining Year
            });

            setFormData({
                phone: userData.phone || "",
                gender: userData.gender || "",
                photo: userData.photo || "",
                category: userData.category || "",
                address: userData.address || "",
                quota: userData.quota || "",
                dob: userData.dob ? userData.dob.split('T')[0] : "",
                fathername: userData.fathername || "",
                mothername: userData.mothername || "",
                eligibilityname: userData.eligibilityname || "",
                degree: userData.degree || "",
                minorsub: userData.minorsub || "",
                vocationalsub: userData.vocationalsub || "",
                mdcsub: userData.mdcsub || "",
                othersub: userData.othersub || "",
                merit: userData.merit || "",
                obtain: userData.obtain || "",
                bonus: userData.bonus || "",
                weightage: userData.weightage || "",
                ncctype: userData.ncctype || "",
                isdisabled: userData.isdisabled || "",
                scholarship: userData.scholarship || "",

                // Staff specific fields
                designation: userData.designation || "",
                adhaarno: userData.adhaarno || "",
                wpno: userData.wpno || "",
                bloodgroup: userData.bloodgroup || "",
                cbseno: userData.cbseno || "",
                abcid: userData.abcid || "",
                income: userData.income || "",
                joiningdate: userData.joiningdate ? userData.joiningdate.split('T')[0] : ""
            });
        } catch (err) {
            setError("Error fetching profile");
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await ep1.post("/api/v2/ds1updatestudentprofile", formData, {
                params: { email: global1.user }
            });

            setMessage(`Profile updated successfully! ${res.data.changesLogged} changes logged.`);
            setIsEditing(false);
            fetchProfile();

            setTimeout(() => setMessage(""), 5000);
        } catch (err) {
            setError(err.response?.data?.message || "Error updating profile");
        }
        setLoading(false);
    };

    const handleDownload = () => {
        import('jspdf').then(({ default: jsPDF }) => {
            import('jspdf-autotable').then(({ default: autoTable }) => {
                const doc = new jsPDF();

                // Header
                doc.setFontSize(20);
                doc.text(readOnlyData.name || "Staff Profile", 14, 22);
                doc.setFontSize(11);
                doc.setTextColor(100);
                doc.text(`${readOnlyData.regno || ""} | ${readOnlyData.role || ""}`, 14, 30);

                // Add content sections
                let finalY = 40;

                const addSection = (title, data) => {
                    doc.setFontSize(14);
                    doc.setTextColor(0);
                    doc.text(title, 14, finalY + 10);

                    const tableBody = Object.entries(data).map(([key, value]) => [key, value || "-"]);

                    autoTable(doc, {
                        startY: finalY + 15,
                        head: [['Field', 'Value']],
                        body: tableBody,
                        theme: 'striped',
                        headStyles: { fillColor: [66, 66, 66] },
                    });

                    finalY = doc.lastAutoTable.finalY + 15; // Add extra spacing
                };

                // Basic Info
                addSection("Basic Information", {
                    "Email": readOnlyData.email,
                    "Department": readOnlyData.department,
                    "Program Code": readOnlyData.programcode,
                    "UUID": readOnlyData.semester,
                    "Employee No": readOnlyData.regno,
                    "Joining Year": readOnlyData.admissionyear,
                    "Section": readOnlyData.section
                });

                // Personal Info
                addSection("Personal Information", {
                    "Phone": formData.phone,
                    "Gender": formData.gender,
                    "Date of Birth": formData.dob,
                    "Category": formData.category,
                    "Blood Group": formData.bloodgroup,
                    "Address": formData.address
                });

                // Official Info
                addSection("Official & Identity", {
                    "Designation": formData.designation,
                    "Aadhaar No": formData.adhaarno,
                    "WhatsApp No": formData.wpno,
                    "Joining Date": formData.joiningdate
                });

                // Family Info
                addSection("Family Information", {
                    "Father's Name": formData.fathername,
                    "Mother's Name": formData.mothername
                });

                doc.save(`${readOnlyData.name || "Staff"}_Profile.pdf`);
            });
        });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: "primary.main" }}>
                            <Person sx={{ fontSize: 50 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {readOnlyData.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {readOnlyData.regno} | {readOnlyData.role}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleDownload}
                        startIcon={<Download />}
                    >
                        Download Profile
                    </Button>
                </Box>

                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Read-Only Information */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Basic Information (Read Only)
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Email" value={readOnlyData.email} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Department" value={readOnlyData.department} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Program Code" value={readOnlyData.programcode} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="UUID" value={readOnlyData.semester} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Employee No" value={readOnlyData.regno} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Joining Year" value={readOnlyData.admissionyear} InputProps={{ readOnly: true }} />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Editable Form */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">Editable Information</Typography>
                    {!isEditing && (
                        <Button variant="outlined" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    )}
                </Box>

                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
                        Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Date of Birth"
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                disabled={!isEditing}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Blood Group"
                                name="bloodgroup"
                                value={formData.bloodgroup}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Address"
                                multiline
                                rows={2}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                    </Grid>

                    {/* Official / ID Information */}
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
                        Official & Identity
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Aadhaar No"
                                name="adhaarno"
                                value={formData.adhaarno}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="WhatsApp No"
                                name="wpno"
                                value={formData.wpno}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Joining Date"
                                type="date"
                                name="joiningdate"
                                value={formData.joiningdate}
                                onChange={handleChange}
                                disabled={!isEditing}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>

                    {/* Family Information */}
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
                        Family Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Father's Name"
                                name="fathername"
                                value={formData.fathername}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Mother's Name"
                                name="mothername"
                                value={formData.mothername}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                    </Grid>

                    {/* Academic Information */}
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
                        Academic Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Eligibility Name"
                                name="eligibilityname"
                                value={formData.eligibilityname}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Degree"
                                name="degree"
                                value={formData.degree}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Minor Subject"
                                name="minorsub"
                                value={formData.minorsub}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Vocational Subject"
                                name="vocationalsub"
                                value={formData.vocationalsub}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                    </Grid>

                    {/* Merit & Scholarship */}
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: "bold" }}>
                        Merit & Scholarship
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Merit"
                                name="merit"
                                value={formData.merit}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Scholarship"
                                name="scholarship"
                                value={formData.scholarship}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Quota"
                                name="quota"
                                value={formData.quota}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    {isEditing && (
                        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setIsEditing(false);
                                    fetchProfile();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<Save />}
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </Box>
                    )}
                </form>
            </Paper>
        </Container>
    );
};

export default StaffProfileds;
