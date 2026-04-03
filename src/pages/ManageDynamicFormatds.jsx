import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  AccountTree as TreeIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

// Recursive Node Component for Format Building
const StructureNode = ({ node, onUpdate, onDelete, level = 0 }) => {
  const isLeaf = node.type === 'leaf';

  const handleAddChild = (type) => {
    const newNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      label: type === 'leaf' ? '' : 'Group',
      logic: 'AND',
      minToAttend: 0,
      marks: type === 'leaf' ? 5 : 0,
      children: type === 'leaf' ? null : []
    };
    onUpdate({ ...node, children: [...(node.children || []), newNode] });
  };

  const updateChild = (childId, updatedChild) => {
    onUpdate({
      ...node,
      children: node.children.map(c => c.id === childId ? updatedChild : c)
    });
  };

  const deleteChild = (childId) => {
    onUpdate({
      ...node,
      children: node.children.filter(c => c.id !== childId)
    });
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, ml: level * 3, borderLeft: `4px solid ${isLeaf ? '#4caf50' : '#1976d2'}` }}>
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TreeIcon color={isLeaf ? "success" : "primary"} fontSize="small" />
          
          <TextField
            label="Label"
            size="small"
            variant="standard"
            value={node.label}
            onChange={(e) => onUpdate({ ...node, label: e.target.value })}
            placeholder={isLeaf ? "e.g. a" : "e.g. Q1"}
            sx={{ width: 100 }}
          />

          {!isLeaf && (
            <>
              <FormControl size="small" variant="standard" sx={{ minWidth: 100 }}>
                <InputLabel>Logic</InputLabel>
                <Select
                  value={node.logic || 'AND'}
                  onChange={(e) => onUpdate({ ...node, logic: e.target.value })}
                >
                  <MenuItem value="AND">AND (Mandatory)</MenuItem>
                  <MenuItem value="OR">OR (Optional)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Min to Attend"
                type="number"
                size="small"
                variant="standard"
                value={node.minToAttend || 0}
                onChange={(e) => onUpdate({ ...node, minToAttend: parseInt(e.target.value) || 0 })}
                sx={{ width: 100 }}
              />
            </>
          )}

          {isLeaf && (
            <TextField
              label="Marks"
              type="number"
              size="small"
              variant="standard"
              value={node.marks || 0}
              onChange={(e) => onUpdate({ ...node, marks: parseInt(e.target.value) || 0 })}
              sx={{ width: 80 }}
            />
          )}

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {!isLeaf && (
              <>
                <Tooltip title="Add Sub-Group">
                  <IconButton size="small" color="primary" onClick={() => handleAddChild('group')}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add Leaf Part">
                  <IconButton size="small" color="success" onClick={() => handleAddChild('leaf')}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {level > 0 && (
              <IconButton size="small" color="error" onClick={() => onDelete(node.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {!isLeaf && node.children && node.children.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {node.children.map(child => (
              <StructureNode
                key={child.id}
                node={child}
                onUpdate={(up) => updateChild(child.id, up)}
                onDelete={deleteChild}
                level={level + 1}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ManageDynamicFormatds = () => {
  const { questionbankcode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [format, setFormat] = useState({
    instructions: '1. Attempt all questions. \n2. Make suitable assumptions wherever necessary.',
    totalmarks: 60,
    structure: [
      {
        id: 'root-q1',
        type: 'group',
        label: 'Q1',
        logic: 'AND',
        minToAttend: 0,
        children: []
      }
    ]
  });

  useEffect(() => {
    fetchFormat();
  }, [questionbankcode]);

  const fetchFormat = async () => {
    setLoading(true);
    try {
      const res = await ep1.get('/api/v2/getdynamicformatdsbycode', {
        params: { questionbankcode, colid: global1.colid }
      });
      if (res.data.success) {
        setFormat(res.data.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to fetch format');
      }
    }
    setLoading(false);
  };

  const handleUpdateRoot = (index, updatedNode) => {
    const newStructure = [...format.structure];
    newStructure[index] = updatedNode;
    setFormat({ ...format, structure: newStructure });
  };

  const handleAddQuestion = () => {
    const newQ = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'group',
      label: `Q${format.structure.length + 1}`,
      logic: 'AND',
      minToAttend: 0,
      children: []
    };
    setFormat({ ...format, structure: [...format.structure, newQ] });
  };

  const handleDeleteQuestion = (id) => {
    setFormat({ ...format, structure: format.structure.filter(q => q.id !== id) });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await ep1.post('/api/v2/savedynamicformatds', {
        user: global1.user,
        colid: global1.colid,
        questionbankcode,
        structure: format.structure,
        totalmarks: format.totalmarks,
        instructions: format.instructions
      });
      setSuccess('Format saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save format');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: 'auto', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, bgcolor: 'white', '&:hover': { bgcolor: '#eee' } }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" color="#1a237e">Dynamic Paper Builder</Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: 2, px: 4 }}
          >
            {saving ? 'Saving...' : 'Save Structure'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate(`/managedynamicquestionsds/${questionbankcode}`)}
            sx={{ borderRadius: 2 }}
          >
            Manage Data
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Overall Settings</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={3}>
              <TextField
                label="Total Marks"
                type="number"
                fullWidth
                value={format.totalmarks}
                onChange={(e) => setFormat({ ...format, totalmarks: e.target.value })}
                variant="outlined"
              />
              <TextField
                label="Instructions"
                multiline
                rows={6}
                fullWidth
                value={format.instructions}
                onChange={(e) => setFormat({ ...format, instructions: e.target.value })}
                variant="outlined"
              />
              <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, display: 'flex', gap: 1 }}>
                <HelpIcon color="primary" />
                <Typography variant="caption" color="textSecondary">
                  Define your paper's physical layout here. You can nest groups within groups to handle complex "OR" logic (e.g. Q2.a + Q2.b OR Q2.c).
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold" color="#37474f">Sections & Questions</Typography>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={handleAddQuestion}
              sx={{ borderRadius: 2 }}
            >
              Add New Question
            </Button>
          </Box>

          <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', pr: 1 }}>
            {format.structure && format.structure.map((sq, idx) => (
              <Box key={sq.id} sx={{ mb: 4 }}>
                <StructureNode
                  node={sq}
                  onUpdate={(node) => handleUpdateRoot(idx, node)}
                  onDelete={handleDeleteQuestion}
                  level={0}
                />
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManageDynamicFormatds;
