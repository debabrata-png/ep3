import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ep1 from '../api/ep1';
import global1 from './global1';

const ApprovalConfigurationds = () => {
    const [steps, setSteps] = useState([]);
    const [newStep, setNewStep] = useState({
        approverEmail: '',
        label: '',
        stepNumber: ''
    });
    const [editStepId, setEditStepId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await ep1.get(`/api/v2/getapprovalconfig?colid=${global1.colid}&module=Purchase Order`);
            setSteps(response.data.data);
            // Auto-set next step number
            const nextStep = response.data.data.length + 1;
            setNewStep(prev => ({ ...prev, stepNumber: nextStep }));
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    };

    const handleAddOrUpdateStep = async () => {
        if (!newStep.approverEmail || !newStep.stepNumber) {
            alert('Please fill Requirement fields');
            return;
        }

        try {
            if (isEditMode && editStepId) {
                await ep1.post('/api/v2/updateapprovalconfig', {
                    id: editStepId,
                    stepNumber: Number(newStep.stepNumber),
                    approverEmail: newStep.approverEmail,
                    label: newStep.label,
                });
                alert('Step Updated Successfully');
            } else {
                await ep1.post('/api/v2/addapprovalconfig', {
                    colid: global1.colid,
                    module: 'Purchase Order',
                    stepNumber: Number(newStep.stepNumber),
                    approverEmail: newStep.approverEmail,
                    label: newStep.label,
                    user: global1.user,
                    name: global1.name
                });
                alert('Step Added Successfully');
            }
            setNewStep({ approverEmail: '', label: '', stepNumber: '' });
            setIsEditMode(false);
            setEditStepId(null);
            fetchConfig();
        } catch (error) {
            console.error('Error saving step:', error);
            alert('Failed to save step');
        }
    };

    const handleEdit = (stepRow) => {
        setNewStep({
            approverEmail: stepRow.approverEmail || '',
            label: stepRow.label || '',
            stepNumber: stepRow.stepNumber || ''
        });
        setEditStepId(stepRow._id);
        setIsEditMode(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this step?")) return;
        try {
            await ep1.get(`/api/v2/deleteapprovalconfig?id=${id}`);
            alert('Step Deleted Successfully');
            fetchConfig();
        } catch (error) {
            console.error('Error deleting step:', error);
            alert('Failed to delete step');
        }
    };

    const handleCancelEdit = () => {
        setNewStep({ approverEmail: '', label: '', stepNumber: '' });
        setIsEditMode(false);
        setEditStepId(null);
        fetchConfig(); // resets auto step Number
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Purchase Order Approval Configuration</Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>{isEditMode ? "Edit Approval Step" : "Add New Approval Step"}</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={2}>
                        <TextField
                            label="Step Number"
                            type="number"
                            fullWidth
                            value={newStep.stepNumber}
                            onChange={(e) => setNewStep({ ...newStep, stepNumber: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            label="Approver Email"
                            fullWidth
                            value={newStep.approverEmail}
                            onChange={(e) => setNewStep({ ...newStep, approverEmail: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            label="Label (e.g. Manager)"
                            fullWidth
                            value={newStep.label}
                            onChange={(e) => setNewStep({ ...newStep, label: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button variant="contained" onClick={handleAddOrUpdateStep} fullWidth sx={{ mb: isEditMode ? 1 : 0 }}>
                            {isEditMode ? "Save Changes" : "Add Step"}
                        </Button>
                        {isEditMode && (
                            <Button variant="outlined" color="error" onClick={handleCancelEdit} fullWidth>
                                Cancel
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={steps.map(s => ({ ...s, id: s._id }))}
                    columns={[
                        { field: 'stepNumber', headerName: 'Step #', width: 100 },
                        { field: 'approverEmail', headerName: 'Approver Email', width: 300 },
                        { field: 'label', headerName: 'Label', width: 250 },
                        {
                            field: 'active',
                            headerName: 'Active',
                            width: 100,
                            valueGetter: (params) => params.row?.active ? 'Yes' : 'No'
                        },
                        { field: 'user', headerName: 'Created By', width: 200 },
                        {
                            field: 'actions',
                            headerName: 'Actions',
                            width: 150,
                            renderCell: (params) => (
                                <Box>
                                    <IconButton color="primary" onClick={() => handleEdit(params.row)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(params.row._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            )
                        }
                    ]}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                />
            </Paper>
        </Box>
    );
};

export default ApprovalConfigurationds;
