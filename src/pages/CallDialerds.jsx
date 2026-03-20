import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box, Typography, Button, TextField, Paper, Grid, IconButton, 
    Avatar, Chip, Tooltip, CircularProgress, Snackbar, Alert
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import PhonePausedIcon from "@mui/icons-material/PhonePaused";
import BackspaceIcon from "@mui/icons-material/Backspace";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import ep1 from "../api/ep1.js";
import global1 from "./global1.js";

const CallDialerds = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedLead, setSelectedLead] = useState(null);
    const [isCalling, setIsCalling] = useState(false);
    const [callStatus, setCallStatus] = useState("Idle");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    const showMessage = (message, severity = "info") => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        if (location.state && location.state.lead) {
            const lead = location.state.lead;
            setSelectedLead(lead);
            setPhoneNumber(lead.phone || "");
        }
    }, [location.state]);

    const handleNumberClick = (num) => {
        if (phoneNumber.length < 15) {
            setPhoneNumber(prev => prev + num);
        }
    };

    const handleBackspace = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
    };

    const initiateCall = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            showMessage("Please enter a valid phone number", "error");
            return;
        }

        let agentNo = global1.phone || "";
        if (!agentNo) {
            agentNo = window.prompt("Please enter your mobile number (Agent Number) to initiate the call:");
            if (!agentNo) return;
            global1.phone = agentNo;
        }

        setIsCalling(true);
        setCallStatus("Initiating...");
        
        try {
            const res = await ep1.post("/api/v2/initiatekommunocallds", {
                lead_id: selectedLead ? selectedLead._id : null,
                customerNumber: selectedLead ? null : phoneNumber, 
                colid: global1.colid,
                agentNumber: agentNo
            });

            if (res.data.success) {
                showMessage("Call initiation requested successfully!", "success");
                setCallStatus("Ringing Agent...");
                setTimeout(() => setCallStatus("Call in Progress"), 5000);
            } else {
                showMessage(res.data.message || "Failed to initiate call", "error");
                setCallStatus("Failed");
                setIsCalling(false);
            }
        } catch (err) {
            console.error("Call error:", err);
            showMessage("Error connecting to call service", "error");
            setCallStatus("Error");
            setIsCalling(false);
        }
    };

    const handleEndCall = () => {
        setIsCalling(false);
        setCallStatus("Idle");
        showMessage("Call ended", "info");
    };

    const keypad = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"];

    return (
        <Box sx={{ 
            p: { xs: 2, md: 4 }, 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            
            <Paper elevation={10} sx={{ 
                width: 400, 
                borderRadius: 6, 
                overflow: 'hidden',
                background: '#fff',
                position: 'relative'
            }}>
                {/* ... existing UI ... */}
                {/* Header Section */}
                <Box sx={{ 
                    bgcolor: isCalling ? '#10b981' : '#1e293b', 
                    p: 4, 
                    color: 'white', 
                    textAlign: 'center',
                    transition: 'all 0.3s'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.8, mb: 1 }}>
                        {isCalling ? 'Active Call' : 'New Call'}
                    </Typography>
                    
                    {selectedLead ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ width: 64, height: 64, mb: 1, bgcolor: '#3b82f6' }}>
                                <PersonIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                {selectedLead.name}
                            </Typography>
                            <Chip 
                                label={callStatus} 
                                size="small" 
                                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} 
                            />
                        </Box>
                    ) : (
                        <Box sx={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: 2 }}>
                                {phoneNumber || "Dial..."}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Status Bar */}
                {isCalling && (
                    <Box sx={{ bgcolor: '#ecfdf5', p: 1, textAlign: 'center' }}>
                        <CircularProgress size={20} sx={{ verticalAlign: 'middle', mr: 1, color: '#10b981' }} />
                        <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 600 }}>
                            Connecting via Kommuno Cloud
                        </Typography>
                    </Box>
                )}

                {/* Dialpad Section */}
                <Box sx={{ p: 4 }}>
                    {!isCalling ? (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <TextField
                                    fullWidth
                                    variant="standard"
                                    placeholder="Enter Number"
                                    value={phoneNumber}
                                    InputProps={{
                                        disableUnderline: true,
                                        sx: { fontSize: '1.5rem', fontWeight: 700, textAlign: 'center' }
                                    }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9*#+]/g, ""))}
                                />
                                {phoneNumber && (
                                    <IconButton onClick={handleBackspace} sx={{ color: '#ef4444' }}>
                                        <BackspaceIcon />
                                    </IconButton>
                                )}
                            </Box>

                            <Grid container spacing={2}>
                                {keypad.map((num) => (
                                    <Grid item xs={4} key={num}>
                                        <Button
                                            fullWidth
                                            variant="text"
                                            onClick={() => handleNumberClick(num.toString())}
                                            sx={{ 
                                                height: 64, 
                                                fontSize: '1.5rem', 
                                                fontWeight: 600,
                                                borderRadius: 4,
                                                color: '#1e293b',
                                                '&:hover': { bgcolor: '#f1f5f9' }
                                            }}
                                        >
                                            {num}
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                                <IconButton 
                                    onClick={initiateCall}
                                    sx={{ 
                                        width: 72, 
                                        height: 72, 
                                        bgcolor: '#10b981', 
                                        color: 'white',
                                        boxShadow: '0 8px 20px -5px rgba(16, 185, 129, 0.5)',
                                        '&:hover': { bgcolor: '#059669', transform: 'scale(1.05)' },
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <PhoneIcon sx={{ fontSize: 32 }} />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, height: 300, alignItems: 'center' }}>
                           <Button
                                variant="contained"
                                color="error"
                                startIcon={<PhonePausedIcon />}
                                onClick={handleEndCall}
                                sx={{ 
                                    borderRadius: 10, 
                                    px: 6, 
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    boxShadow: '0 8px 15px -3px rgba(239, 68, 68, 0.4)'
                                }}
                            >
                                End Call
                           </Button>
                        </Box>
                    )}
                </Box>
                
                {/* Footer Info */}
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Agent: {global1.name} | {global1.phone || "No Mobile Set"}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default CallDialerds;
