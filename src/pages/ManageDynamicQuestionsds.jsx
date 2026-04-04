import React, { useState, useEffect, useCallback } from 'react';
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
  ButtonGroup,
  Chip,
  Tooltip,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  AutoFixHigh as AutoIcon,
  HelpOutline as HelpIcon,
  Assignment as TaskIcon,
  Lightbulb as IdeaIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ep1 from '../api/ep1';
 import global1 from './global1';

const LANGUAGES = [
  { label: 'English', code: 'en' },
  { label: 'Hindi', code: 'hi' },
  { label: 'Bengali', code: 'bn' },
  { label: 'Marathi', code: 'mr' },
  { label: 'Telugu', code: 'te' },
  { label: 'Tamil', code: 'ta' },
  { label: 'Gujarati', code: 'gu' },
  { label: 'Kannada', code: 'kn' },
  { label: 'Odia', code: 'or' },
  { label: 'Malayalam', code: 'ml' },
  { label: 'Punjabi', code: 'pa' },
  { label: 'Assamese', code: 'as' },
  { label: 'Sanskrit', code: 'sa' },
  { label: 'Spanish', code: 'es' },
  { label: 'French', code: 'fr' },
  { label: 'German', code: 'de' },
];

const ManageDynamicQuestionsds = () => {
  const { questionbankcode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [format, setFormat] = useState(null);
  const [leafNodes, setLeafNodes] = useState([]);
  const [questionData, setQuestionData] = useState({});
  const [aiConfig, setAiConfig] = useState({
    difficulty: 'Medium',
    keywords: '',
    targetLanguage: LANGUAGES[0], // Default English
  });

  // Recursive function to extract leaf nodes from the format structure
  const getLeafNodes = (nodes, path = []) => {
    let results = [];
    nodes.forEach((node) => {
      const currentPath = [...path, node.label];
      if (node.type === 'leaf') {
        results.push({ ...node, fullPath: currentPath.join(' > ') });
      } else if (node.children && node.children.length > 0) {
        results = [...results, ...getLeafNodes(node.children, currentPath)];
      }
    });
    return results;
  };

  useEffect(() => {
    fetchData();
  }, [questionbankcode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Format
      const formatRes = await ep1.get('/api/v2/getdynamicformatdsbycode', {
        params: { questionbankcode, colid: global1.colid }
      });
      
      if (!formatRes.data.success) {
        setError('No dynamic format found. Please create a format first.');
        setLoading(false);
        return;
      }

      const formatData = formatRes.data.data;
      setFormat(formatData);
      
      const leaves = getLeafNodes(formatData.structure);
      setLeafNodes(leaves);

      // 2. Fetch existing questions
      const questionsRes = await ep1.get('/api/v2/getdynamicquestionsds', {
        params: { formatid: formatData._id, colid: global1.colid }
      });

      const existing = questionsRes.data.data || [];
      const dataMap = {};
      
      // Initialize or map existing data
      leaves.forEach(leaf => {
        const found = existing.find(ex => ex.nodeId === leaf.id);
        dataMap[leaf.id] = {
          question: found?.question || '',
          translatedQuestion: found?.translatedQuestion || '',
          answer: found?.answer || '',
          translatedAnswer: found?.translatedAnswer || '',
          questiontype: 'Descriptive',
          marks: leaf.marks,
          targetLanguageCode: found?.targetLanguageCode || ''
        };
      });

      setQuestionData(dataMap);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    }
    setLoading(false);
  };

  const handleInputChange = (nodeId, field, value) => {
    setQuestionData(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const questionsToSave = leafNodes.map((leaf, index) => ({
        nodeId: leaf.id,
        partLabel: leaf.label,
        questionNo: index + 1,
        question: questionData[leaf.id]?.question || '',
        translatedQuestion: questionData[leaf.id]?.translatedQuestion || '',
        answer: questionData[leaf.id]?.answer || '',
        translatedAnswer: questionData[leaf.id]?.translatedAnswer || '',
        targetLanguageCode: questionData[leaf.id]?.targetLanguageCode || aiConfig.targetLanguage?.code,
        marks: leaf.marks
      }));

      const res = await ep1.post('/api/v2/savedynamicquestionsds', {
        user: global1.user,
        colid: global1.colid,
        questionbankcode,
        formatid: format._id,
        questions: questionsToSave
      });

      if (res.data.success) {
        setSuccess('Questions saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to save questions properly. Please check all fields.');
    }
    setSaving(false);
  };

  const handleAiGenerate = async () => {
    // SMART AI: Identify only the empty boxes to save quota
    const emptyLeaves = leafNodes.filter(leaf => !questionData[leaf.id]?.question?.trim());
    
    if (emptyLeaves.length === 0) {
      setSuccess('All questions are already filled! Clear a box if you want to re-generate it.');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    if (!aiConfig.keywords) {
      setError('Please provide keywords for AI generation');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess(`AI is filling ${emptyLeaves.length} empty parts... Please wait 30s.`);
    
    try {
      // Create a filtered structure containing only the empty branches
      const filterStructure = (nodes) => {
        return nodes.map(node => {
          if (node.type === 'leaf') {
            return emptyLeaves.find(el => el.id === node.id) ? node : null;
          }
          if (node.children) {
            const filteredChildren = filterStructure(node.children).filter(c => c !== null);
            return filteredChildren.length > 0 ? { ...node, children: filteredChildren } : null;
          }
          return null;
        }).filter(n => n !== null);
      };

      const smartStructure = filterStructure(format.structure);

      const res = await ep1.post('/api/v2/generatequestionsai', {
        questionbankcode,
        format: { ...format, structure: smartStructure },
        difficulty: aiConfig.difficulty,
        keywords: aiConfig.keywords,
        targetLanguage: aiConfig.targetLanguage?.label,
        targetLanguageCode: aiConfig.targetLanguage?.code,
        colid: global1.colid,
        user: global1.user
      });

      if (res.data.success && res.data.questions) {
        setQuestionData(prev => {
          const newData = { ...prev };
          let fillCount = 0;
          
          res.data.questions.forEach(gen => {
            // Case-insensitive ID matching
            const targetId = gen.nodeId || gen.nodeid;
            
            if (newData[targetId]) {
              newData[targetId] = {
                ...newData[targetId],
                question: gen.question,
                translatedQuestion: gen.translatedQuestion,
                answer: gen.answer,
                translatedAnswer: gen.translatedAnswer,
                targetLanguageCode: aiConfig.targetLanguage?.code
              };
              fillCount++;
            } else {
              // Fallback: match by partLabel if ID is mangled by AI
              const leafByLabel = leafNodes.find(leaf => leaf.label === gen.partLabel && !newData[leaf.id]?.question?.trim());
              if (leafByLabel) {
                  newData[leafByLabel.id] = {
                    ...newData[leafByLabel.id],
                    question: gen.question,
                    translatedQuestion: gen.translatedQuestion,
                    answer: gen.answer,
                    translatedAnswer: gen.translatedAnswer,
                    targetLanguageCode: aiConfig.targetLanguage?.code
                  };
                fillCount++;
              }
            }
          });
          
          setSuccess(`Success! ${fillCount} boxes populated.`);
          return newData;
        });
        
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      console.error('Smart AI generation failed', err);
      setError('AI generation had some trouble. Your daily quota might be exhausted.');
    }
    setGenerating(false);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 1. Header with Logo (Defensive handling)
    if (global1.logo) {
      try {
        // We use 'FAST' alias and don't force 'PNG' to avoid signature errors
        doc.addImage(global1.logo, 'JPEG', pageWidth/2 - 15, 10, 30, 30, undefined, 'FAST');
      } catch (imgError) {
        console.warn('Logo could not be added to PDF, skipping...', imgError);
        // Fallback: Just use text if image fails
      }
    }
    
    doc.setFontSize(18);
    doc.text(global1.instname || 'Institution Name', pageWidth/2, 50, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Question Bank: ${questionbankcode}`, pageWidth/2, 60, { align: 'center' });
    doc.text(`Total Marks: ${format?.totalmarks || 0}`, pageWidth/2, 70, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 75, pageWidth - 20, 75);

    // 2. Instructions
    if (format?.instructions) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions:', 20, 85);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(format.instructions, pageWidth - 40);
      doc.text(splitText, 20, 92);
    }

    // 3. Questions Table
    const tableData = [];
    
    // Recursive function to flatten the structure for the PDF table
    const flattenForPDF = (nodes, prefix = '', level = 0) => {
      nodes.forEach((node, idx) => {
        const currentLabel = node.label || `${prefix}${idx + 1}`;
        
        if (node.type === 'leaf') {
          const qText = questionData[node.id]?.question || '__________________________________________________';
          const tText = questionData[node.id]?.translatedQuestion;
          
          // Combine English and Translated version if available
          const cellContent = tText ? `${qText}\n\n(${tText})` : qText;

          tableData.push([
            { content: currentLabel, styles: { fontStyle: 'bold' } },
            cellContent,
            { content: node.marks || '', styles: { halign: 'center' } }
          ]);
        } else {
          // It's a group
          tableData.push([
            { content: currentLabel, colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }
          ]);
          if (node.children) {
            flattenForPDF(node.children, '', level + 1);
          }
        }
      });
    };

    flattenForPDF(format.structure);

    autoTable(doc, {
      startY: format?.instructions ? 110 : 85,
      head: [['Part', 'Question Content', 'Marks']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20 }
      },
      margin: { top: 20 }
    });

    doc.save(`Question_Paper_${questionbankcode}.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: 'auto', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, bgcolor: 'white' }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">Question Content Manager</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/managedynamicformatds/${questionbankcode}`)}
          >
            Edit Format
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            color="success"
            sx={{ px: 4 }}
          >
            {saving ? 'Saving...' : 'Final Save'}
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      {/* AI Assistant Section */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IdeaIcon sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h5" fontWeight="medium">AI Content Assistant</Typography>
        </Box>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>Complexity Level</Typography>
            <ButtonGroup fullWidth variant="contained" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <Button
                  key={diff}
                  onClick={() => setAiConfig({ ...aiConfig, difficulty: diff })}
                  sx={{ 
                    bgcolor: aiConfig.difficulty === diff ? 'white' : 'transparent',
                    color: aiConfig.difficulty === diff ? 'primary.main' : 'white',
                    '&:hover': { bgcolor: aiConfig.difficulty === diff ? 'white' : 'rgba(255,255,255,0.2)' }
                  }}
                >
                  {diff}
                </Button>
              ))}
            </ButtonGroup>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>Context / Keywords</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Python Loops, Error Handling, Decorators"
              value={aiConfig.keywords}
              onChange={(e) => setAiConfig({ ...aiConfig, keywords: e.target.value })}
              sx={{ 
                bgcolor: 'white', 
                borderRadius: 1
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>Target Language</Typography>
            <Autocomplete
              size="small"
              options={LANGUAGES}
              value={aiConfig.targetLanguage}
              onChange={(e, val) => setAiConfig({ ...aiConfig, targetLanguage: val })}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Select Language" 
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ pt: 3 }}>
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main', 
                  height: 40, 
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#f0f0f0' }
                }}
                fullWidth
                startIcon={generating ? <CircularProgress size={18} /> : <AutoIcon />}
                onClick={handleAiGenerate}
                disabled={generating}
              >
                {generating ? 'Working...' : 'Magic Generate'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ mb: 10 }}>
        {leafNodes.length === 0 ? (
          <Alert severity="info">Your paper has no leaf parts. Go back to Format Builder to add some!</Alert>
        ) : (
          <Stack spacing={3}>
            {leafNodes.map((leaf, index) => (
              <Card key={leaf.id} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Box>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                        Location: {leaf.fullPath}
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        Part ({leaf.label}) — {leaf.marks} Marks
                      </Typography>
                   </Box>
                   <Chip icon={<TaskIcon />} label="Descriptive" variant="outlined" size="small" />
                </Box>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={7}>
                      <TextField
                        label="Question Text"
                        multiline
                        rows={5}
                        fullWidth
                        value={questionData[leaf.id]?.question || ''}
                        onChange={(e) => handleInputChange(leaf.id, 'question', e.target.value)}
                        placeholder="Type the question content here..."
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField
                        label="Expected Outline / Answer"
                        multiline
                        rows={5}
                        fullWidth
                        value={questionData[leaf.id]?.answer || ''}
                        onChange={(e) => handleInputChange(leaf.id, 'answer', e.target.value)}
                        sx={{ bgcolor: '#fffde7' }}
                        placeholder="Describe what the student should answer..."
                      />
                    </Grid>

                    {/* Bilingual Options */}
                    { (questionData[leaf.id]?.translatedQuestion || aiConfig.targetLanguage?.code !== 'en') && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }}><Chip label={`${aiConfig.targetLanguage?.label || 'Translated'} Version`} size="small" /></Divider>
                        </Grid>
                        <Grid item xs={12} md={7}>
                          <TextField
                            label={`Question (${aiConfig.targetLanguage?.label || 'Target'})`}
                            multiline
                            rows={3}
                            fullWidth
                            value={questionData[leaf.id]?.translatedQuestion || ''}
                            onChange={(e) => handleInputChange(leaf.id, 'translatedQuestion', e.target.value)}
                            sx={{ bgcolor: '#f0f4f8' }}
                          />
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <TextField
                            label={`Answer (${aiConfig.targetLanguage?.label || 'Target'})`}
                            multiline
                            rows={3}
                            fullWidth
                            value={questionData[leaf.id]?.translatedAnswer || ''}
                            onChange={(e) => handleInputChange(leaf.id, 'translatedAnswer', e.target.value)}
                            sx={{ bgcolor: '#fff9c4' }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Sticky Footer */}
      <Paper 
        elevation={10} 
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '90%', 
          maxWidth: 600, 
          p: 2, 
          borderRadius: 4, 
          display: 'flex', 
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          sx={{ mr: 2, borderRadius: 2, textTransform: 'none' }}
        >
          Download Paper
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ borderRadius: 2, textTransform: 'none', px: 4 }}
        >
          {saving ? 'Saving...' : 'Finalize & Save All'}
        </Button>
      </Paper>
    </Box>
  );
};

export default ManageDynamicQuestionsds;
