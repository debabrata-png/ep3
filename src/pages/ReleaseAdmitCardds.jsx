import React, { useState } from "react";
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    TextField,
} from "@mui/material";

import ep1 from "../api/ep1"; 

import global1 from "./global1";

const ReleaseAdmitCardds = () => {
    // Removed templates state
    const [formData, setFormData] = useState({
        examCenter: "",
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });

    // Removed fetchTemplates useEffect

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { examCenter } = formData;

        if (!examCenter) {
            return setFeedback({ type: "error", message: "Exam Center is required." });
        }

        setLoading(true);
        setFeedback({ type: "", message: "" });

        try {
            // Changed endpoint to new controller
            const colid = global1.colid;
            const res = await ep1.post("/api/v2/examadmitcontrollerds/release", {
                examCenter,
                colid // Pass colid
            });

            setFeedback({ type: "success", message: res.data.message });
        } catch (err) {
            setFeedback({
                type: "error",
                message: err.response?.data?.message || "Failed to release admit cards",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
                    Release Admit Cards
                </Typography>

                {feedback.message && (
                    <Alert severity={feedback.type} sx={{ mb: 2 }}>
                        {feedback.message}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>

                    {/* Removed Template Select */}

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Exam Center Name"
                        name="examCenter"
                        value={formData.examCenter}
                        onChange={handleChange}
                        placeholder="e.g. Main Campus Hall A"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Release Admit Cards"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ReleaseAdmitCardds;
