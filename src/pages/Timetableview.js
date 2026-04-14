import { useEffect, useState } from 'react';
import { 
  Box, Card, CardContent, Typography, Container, Stack, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, CircularProgress, IconButton, Alert, Divider, Grid
} from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ScheduleIcon from '@mui/icons-material/Schedule';

export default function TimetableView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const colid = global1.colid;

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await ep1.get(`/ttGenerateTimetable?colid=${colid}`);
      await load();
    } catch (err) {
      console.error("Error generating timetable:", err);
      setError("Failed to generate timetable. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ep1.get(`/ttGetTimetable?colid=${colid}`);
      // Sort data by day or time if needed
      setData(res.data);
    } catch (err) {
      console.error("Error loading timetable:", err);
      setError("Failed to load timetable data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Group data by day
  const groupedData = data.reduce((acc, curr) => {
    if (!acc[curr.day]) acc[curr.day] = [];
    acc[curr.day].push(curr);
    return acc;
  }, {});

  const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getSubjectColor = (subject) => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1'];
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={4}>
        {/* Header & Generate Section */}
        <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 3, background: 'linear-gradient(90deg, #1976d2 0%, #0d47a1 100%)', color: 'white' }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs>
                <Stack direction="row" spacing={2} alignItems="center">
                  <EventNoteIcon fontSize="large" />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">Academic Timetable</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Manage and view faculty schedules</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={2}>
                  <IconButton onClick={load} sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                  <Button 
                    variant="contained" 
                    onClick={generate} 
                    disabled={generating}
                    startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                    sx={{ 
                      bgcolor: 'white', 
                      color: '#0d47a1',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    {generating ? 'Generating...' : 'Auto-Generate'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '2px dashed #ccc' }}>
            <Typography variant="h6" color="textSecondary">No timetable records found</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>Use the "Auto-Generate" button above to create a new schedule</Typography>
            <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={generate}>Generate Now</Button>
          </Card>
        ) : (
          <Stack spacing={3}>
            {DAYS_ORDER.filter(day => groupedData[day]).map(day => (
              <Card key={day} elevation={2} sx={{ borderRadius: 3 }}>
                <Box sx={{ px: 3, py: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight="bold" color="primary">{day}</Typography>
                </Box>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#fafafa' }}>
                      <TableRow>
                        <TableCell>Time Slot</TableCell>
                        <TableCell>Faculty</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell align="center">Program & Sem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedData[day].map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.starttime} - {row.endtime}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ w: 32, h: 32, borderRadius: '50%', bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', color: '#1976d2', width: 32, height: 32 }}>
                                {row.faculty.charAt(0)}
                              </Box>
                              <Typography variant="body2">{row.faculty}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={row.subject} 
                              size="small" 
                              sx={{ 
                                bgcolor: getSubjectColor(row.subject) + '20', 
                                color: getSubjectColor(row.subject),
                                fontWeight: 'bold',
                                border: `1px solid ${getSubjectColor(row.subject)}40`
                              }} 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="500">{row.program}</Typography>
                            <Typography variant="caption" color="textSecondary">Semester {row.semester}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}