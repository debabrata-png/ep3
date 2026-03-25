import React, { useState, useEffect } from 'react';
import {
    Button, Container, FormControl, Grid, InputLabel, MenuItem, Select, Typography, Paper, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

const ExamMarksMatrixEntry = () => {
    const colid = global1.colid;
    const user = global1.user;

    const [year, setYear] = useState('');
    const [program, setProgram] = useState('');
    const [exam, setExam] = useState('');
    const [examcode, setExamcode] = useState('');

    const [filterData, setFilterData] = useState({ years: [], programs: [], exams: [], examcodes: [] });

    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [columnGroupingModel, setColumnGroupingModel] = useState([]);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await ep1.get('/api/v2/getexammarksmatrixfilters', {
                    params: { colid, year, program, exam }
                });
                if (res.data && res.data.status === 'success') {
                    setFilterData(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching filters', err);
            }
        };
        if (colid) {
            fetchFilters();
        }
    }, [colid, year, program, exam]);

    const fetchData = async () => {
        if (!examcode) return alert('Please select Exam Code');
        setLoading(true);
        try {
            const res = await ep1.get('/api/v2/getexammarksmatrixdata', {
                params: { colid, year, program, exam, examcode }
            });

            if (res.data && res.data.status === 'success') {
                const { papers: rawPapers, students, marks } = res.data.data;

                // Deduplicate papers by papercode to avoid MUI crash on duplicate groupId
                const uniquePapersMap = new Map();
                rawPapers.forEach(p => {
                    if (!uniquePapersMap.has(p.papercode)) {
                        uniquePapersMap.set(p.papercode, p);
                    }
                });
                const papers = Array.from(uniquePapersMap.values());

                setPapers(papers);

                // Build Columns
                let cols = [
                    { field: 'admitid', headerName: 'Exam Admit ID', width: 240, editable: false }
                ];
                let groupings = [
                    {
                        groupId: 'student_info',
                        headerName: 'Exam Admit Info',
                        headerAlign: 'center',
                        children: [{ field: 'admitid' }]
                    }
                ];

                papers.forEach(p => {
                    const code = p.papercode;
                    let groupChildren = [];

                    const renderInputCell = (params, field, maxMarks) => {
                        const cellValue = params.row[field];
                        const isInvalid = cellValue !== '' && cellValue != null && Number(cellValue) > maxMarks;

                        return (
                            <TextField
                                variant="outlined"
                                size="small"
                                type="number"
                                error={isInvalid}
                                value={cellValue || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setRows((prev) =>
                                        prev.map(r => r.id === params.row.id ? { ...r, [field]: val } : r)
                                    );
                                }}
                                inputProps={{ min: 0, max: maxMarks, style: { textAlign: 'center', padding: '6px' } }}
                                sx={{ width: '80px', backgroundColor: '#fff', borderRadius: 1 }}
                            />
                        );
                    };

                    if (p.thmax > 0) {
                        const thField = `${code}_thobtained`;
                        cols.push({
                            field: thField, headerName: `TH (Max: ${p.thmax})`, width: 120,
                            renderCell: (params) => renderInputCell(params, thField, p.thmax)
                        });
                        groupChildren.push({ field: thField });
                    }

                    if (p.prmax > 0) {
                        const prField = `${code}_probtained`;
                        cols.push({
                            field: prField, headerName: `PR (Max: ${p.prmax})`, width: 120,
                            renderCell: (params) => renderInputCell(params, prField, p.prmax)
                        });
                        groupChildren.push({ field: prField });
                    }

                    if (p.iatmax > 0) {
                        const iatField = `${code}_iatobtained`;
                        cols.push({
                            field: iatField, headerName: `IAT (Max: ${p.iatmax})`, width: 120,
                            renderCell: (params) => renderInputCell(params, iatField, p.iatmax)
                        });
                        groupChildren.push({ field: iatField });
                    }

                    if (p.iapmax > 0) {
                        const iapField = `${code}_iapobtained`;
                        cols.push({
                            field: iapField, headerName: `IAP (Max: ${p.iapmax})`, width: 120,
                            renderCell: (params) => renderInputCell(params, iapField, p.iapmax)
                        });
                        groupChildren.push({ field: iapField });
                    }

                    // Only push group if there are children components
                    if (groupChildren.length > 0) {
                        groupings.push({
                            groupId: code,
                            headerName: `${p.papername} (${code})`,
                            headerAlign: 'center',
                            children: groupChildren
                        });
                    }
                });

                setColumns(cols);
                setColumnGroupingModel(groupings);

                // Build Rows
                const marksMap = {};
                marks.forEach(m => {
                    if (!marksMap[m.regno]) marksMap[m.regno] = {};
                    marksMap[m.regno][m.papercode] = m;
                });

                const newRows = students.map((s, index) => {
                    let row = { id: index, admitid: s.admitid, studentName: s.student, regno: s.regno };
                    papers.forEach(p => {
                        const code = p.papercode;
                        const m = marksMap[s.regno] ? marksMap[s.regno][code] : null;
                        row[`${code}_thobtained`] = m?.thobtained ?? '';
                        row[`${code}_probtained`] = m?.probtained ?? '';
                        row[`${code}_iatobtained`] = m?.iatobtained ?? '';
                        row[`${code}_iapobtained`] = m?.iapobtained ?? '';
                    });
                    return row;
                });

                setRows(newRows);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const processRowUpdate = (newRow) => {
        setRows(rows.map(row => (row.id === newRow.id ? newRow : row)));
        return newRow;
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const marksData = [];
            rows.forEach(r => {
                papers.forEach(p => {
                    const code = p.papercode;
                    // Gather marks and save
                    const mrkRecord = {
                        name: global1.name,
                        user: global1.user,
                        colid: colid,
                        student: r.studentName,
                        regno: r.regno,
                        program: program,
                        examcode: examcode,
                        year: year,
                        status: p.status,
                        papercode: code,
                        papername: p.papername,
                        semester: p.semester,
                        branch: p.branch,
                        regulation: p.regulation,
                        month: p.month,
                        thmax: p.thmax,
                        prmax: p.prmax,
                        iatmax: p.iatmax,
                        iapmax: p.iapmax,
                        thobtained: r[`${code}_thobtained`],
                        probtained: r[`${code}_probtained`],
                        iatobtained: r[`${code}_iatobtained`],
                        iapobtained: r[`${code}_iapobtained`]
                    };
                    marksData.push(mrkRecord);
                });
            });

            const res = await ep1.post('/api/v2/saveexammarksmatrix', { marksData });
            if (res.data.status === 'success') {
                alert('Marks saved successfully!');
            } else {
                alert('Error saving marks');
            }
        } catch (err) {
            console.error('Save error', err);
            alert('Error saving marks');
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h1" variant="h5" color="primary" gutterBottom>
                    Matrix Exam Marks Entry
                </Typography>

                <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select value={year} label="Year" onChange={(e) => { setYear(e.target.value); setProgram(''); setExam(''); setExamcode(''); }}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {filterData.years.map((opt, i) => <MenuItem key={i} value={opt}>{opt}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth disabled={!year}>
                            <InputLabel>Program</InputLabel>
                            <Select value={program} label="Program" onChange={(e) => { setProgram(e.target.value); setExam(''); setExamcode(''); }}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {filterData.programs.map((opt, i) => (
                                    <MenuItem key={i} value={opt.programcode || opt}>
                                        {opt.program ? `${opt.program} (${opt.programcode})` : opt}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth disabled={!program}>
                            <InputLabel>Exam</InputLabel>
                            <Select value={exam} label="Exam" onChange={(e) => { setExam(e.target.value); setExamcode(''); }}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {filterData.exams.map((opt, i) => <MenuItem key={i} value={opt}>{opt}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth disabled={!exam}>
                            <InputLabel>Exam Code</InputLabel>
                            <Select value={examcode} label="Exam Code" onChange={(e) => setExamcode(e.target.value)}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {filterData.examcodes.map((opt, i) => <MenuItem key={i} value={opt}>{opt}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Button variant="contained" color="primary" onClick={fetchData} disabled={loading} sx={{ width: 200, mb: 2 }}>
                    {loading ? 'Processing...' : 'Fetch Matrix'}
                </Button>

                <div style={{ height: 600, width: '100%', mb: 3 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        experimentalFeatures={{ columnGrouping: true }}
                        columnGroupingModel={columnGroupingModel}
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={(error) => console.error(error)}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        hideFooter
                        sx={{
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 'bold',
                            },
                        }}
                    />
                </div>

                {rows.length > 0 && (
                    <Button variant="contained" color="success" onClick={handleSave} disabled={loading} sx={{ mt: 3, width: 200 }}>
                        {loading ? 'Saving...' : 'Save Marks'}
                    </Button>
                )}
            </Paper>
        </Container>
    );
};

export default ExamMarksMatrixEntry;
