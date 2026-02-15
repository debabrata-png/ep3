import React, { useState } from "react";
// import axios from "axios"; // Replaced with ep1
import ep1 from '../api/ep1'; // Correct path confirmed from DownloadAdmitCard.jsx
import {
    Container,
    Box,
    Typography,
    Button,
    Alert,
    Divider,
    CircularProgress,
    TextField, // Use TextField instead of custom InputField for simplicity/consistency if needed, or stick to InputField
} from "@mui/material";
// import InputField from "../components/InputField"; // Keeping consistency if it exists
import { generateAdmitCardPDF } from "../utils/generateAdmitCardPDF";

import global1 from './global1'; // Import global1

const DownloadAdmitCardds = () => {
    const [regno, setRegno] = useState("");
    const [loading, setLoading] = useState(false);
    const [admitCardData, setAdmitCardData] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const handleFetch = async () => {
        setLoading(true);
        setErrorMsg("");
        setAdmitCardData(null);

        try {
            // Changed endpoint to new controller
            // Using /api/v2/examadmitcontrollerds/:regno?colid=...
            const colid = global1.colid;
            const res = await ep1.get(`/api/v2/examadmitcontrollerds/${regno.trim()}?colid=${colid}`);
            setAdmitCardData(res.data);
        } catch (err) {
            console.error(err);
            setErrorMsg("❌ Admit card not released yet or invalid registration number.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!admitCardData) return;

        const {
            studentname,
            regno,
            program,
            semester,
            examdate,
            subjects,
            examCenter,
            template
        } = admitCardData;

        const mappedSubjects = subjects.map((sub) => ({
            subjectcode: sub.subjectcode,
            subjectname: sub.subjectname,
            examtime: sub.examtime || "TBD",
        }));

        generateAdmitCardPDF({
            studentname,
            regno,
            program,
            semester,
            examdate,
            examCenter,
            subjects: mappedSubjects,
            template,
            photo: "" // Optional: attach if available
        });
    };

    return (
        <Container maxWidth="sm">
            <Box mt={5} p={4} boxShadow={3} borderRadius={2} bgcolor="background.paper">
                <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
                    Download Admit Card
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <TextField
                    fullWidth
                    label="Registration Number"
                    name="regno"
                    value={regno}
                    onChange={(e) => setRegno(e.target.value)}
                    margin="normal"
                />

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleFetch}
                    disabled={loading || !regno.trim()}
                    sx={{ mt: 2, mb: 2, py: 1.5 }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Check & Fetch Admit Card"}
                </Button>

                {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}

                {admitCardData && (
                    <Box mt={3} textAlign="center">
                        <Alert severity="success" sx={{ mb: 2 }}>
                            ✅ Admit card is available for <strong>{admitCardData.studentname}</strong>
                        </Alert>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleDownload}
                            size="large"
                        >
                            Download Admit Card PDF
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default DownloadAdmitCardds;
