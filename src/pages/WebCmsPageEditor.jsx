import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    IconButton,
    TextField,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Stack,
    Snackbar,
    Alert,
    Tooltip,
} from "@mui/material";
import {
    Add as AddIcon,
    ArrowBack as BackIcon,
    ArrowUpward as MoveUpIcon,
    ArrowDownward as MoveDownIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    ViewQuilt as LayoutIcon,
    TextFields as TextIcon,
    FilterFrames as HeroIcon,
    GridView as GridIcon,
    PostAdd as NewsIcon,
    DynamicForm as FormIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { Editor, EditorProvider } from 'react-simple-wysiwyg';
import ep1 from "../api/ep1";
import global1 from "./global1";

// Define block metadata for the library
const BLOCK_TYPES = [
    { type: 'hero', name: 'Hero Slider', icon: <HeroIcon />, description: 'Top banner section with multiple sliding images and text' },
    { type: 'image_text', name: 'Image & Text', icon: <LayoutIcon />, description: 'Split layout with rich text on one side and image on other' },
    { type: 'news_list', name: 'News & Notices', icon: <NewsIcon />, description: 'Vertical list of recent updates' },
    { type: 'form_block', name: 'Contact/Inquiry Form', icon: <FormIcon />, description: 'Dynamic form to capture user inquiries' },
    { type: 'sidebar_content', name: 'Sidebar Content', icon: <LayoutIcon />, description: 'Layout with a left sidebar navigation and right rich-text area' },
    { type: 'rich_text', name: 'Rich Text (Full Width)', icon: <TextIcon />, description: 'Standard full-width area for text and formatting' },
    { type: 'news_notices', name: 'News & Notices (Tabbed)', icon: <NewsIcon />, description: 'Dynamic tabbed interface for News, Notices, and Events' },
    { type: 'tabbed_grid', name: 'Programs (Tabbed)', icon: <GridIcon />, description: 'Figma-style tabbed course listing' },
    { type: 'feature_grid', name: 'Facility Grid', icon: <GridIcon />, description: '3 or 4 column grid of features with icons' },
    { type: 'logo_wall', name: 'Recruiters Wall', icon: <LayoutIcon />, description: 'Wall of partner logos' },
];

const WebCmsPageEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [forms, setForms] = useState([]); // Form templates
    const [openAddBlock, setOpenAddBlock] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        fetchPage();
        fetchForms();
    }, [id]);

    const fetchPage = async () => {
        try {
            const res = await ep1.get("/api/v2/cms/pages", {
                params: { colid: global1.colid }
            });
            const currentPage = res.data.data.find(p => p._id === id);
            if (currentPage) {
                setPage(currentPage);
                setBlocks(currentPage.blocks || []);
            }
        } catch (err) {
            showSnackbar("Failed to fetch page details", "error");
        }
    };

    const fetchForms = async () => {
        try {
            const res = await ep1.get("/api/v2/cms/forms", {
                params: { colid: global1.colid }
            });
            setForms(res.data);
        } catch (err) {
            console.error("Error fetching forms:", err);
        }
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleAddBlock = (type) => {
        const newBlock = {
            type,
            data: {},
            order: blocks.length,
            is_active: true
        };
        // Set default data based on type
        if (type === 'hero') {
            newBlock.data = {
                slides: [{ title: "Welcome to IET-DAVV", subtitle: "Building future leaders since 1996", buttonText: "Apply Now", imageUrl: "img/banner/banner.png" }],
                quickActions: [
                    { label: "Admissions", link: "/admissions", color: "#f59e0b" },
                    { label: "Placements", link: "/placements", color: "#002147" },
                    { label: "Notices", link: "/notices", color: "#00cfd1" }
                ]
            };
        } else if (type === 'image_text') {
            newBlock.data = { heading: "About Us", text: "Write something amazing...", imageUrl: "" };
        } else if (type === 'form_block') {
            newBlock.data = { title: "Get in Touch", formId: "" };
        } else if (type === 'sidebar_content') {
            newBlock.data = {
                sidebarTitle: "About Us",
                links: [{ label: "Overview", slug: "overview" }],
                content: "<h1>Our Vision</h1><p>Enter content here...</p>"
            };
        } else if (type === 'rich_text') {
            newBlock.data = { content: "<p>Type your content here...</p>" };
        } else if (type === 'tabbed_grid') {
            newBlock.data = {
                title: "Programs Offered",
                tabs: [
                    { title: "Graduate", cards: [{ title: "Computer Science", imageUrl: "img/program/1.png", slug: "cse" }] },
                    { title: "Post Graduate", cards: [{ title: "M.Tech IT", imageUrl: "img/program/2.png", slug: "mtech" }] }
                ]
            };
        } else if (type === 'logo_wall') {
            newBlock.data = { title: "Our Top Recruiters", subtitle: "More than 30 Companies Visit IET-DAVV every year", logos: [{ imageUrl: "img/elements/f1.jpg", link: "" }] };
        } else if (type === 'feature_grid') {
            newBlock.data = { title: "Facilities", items: [{ title: "Library", description: "Modern library with 50k+ books", imageUrl: "" }] };
        } else if (type === 'news_notices') {
            newBlock.data = {
                tabs: [
                    { title: "News", items: [{ title: "New Academic Session Starts", date: new Date().toISOString().split('T')[0], time: "10:00 AM", location: "Campus" }] },
                    { title: "Notices", items: [{ title: "Holiday Notice", date: new Date().toISOString().split('T')[0], time: "All Day", location: "Notice Board" }] }
                ]
            };
        }

        setBlocks([...blocks, newBlock]);
        setOpenAddBlock(false);
    };

    const handleDeleteBlock = (index) => {
        const newBlocks = blocks.filter((_, i) => i !== index);
        setBlocks(newBlocks);
    };

    const handleMoveBlock = (index, direction) => {
        const newBlocks = [...blocks];
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < newBlocks.length) {
            [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
            setBlocks(newBlocks);
        }
    };

    const handleBlockDataChange = (index, field, value) => {
        const newBlocks = [...blocks];
        newBlocks[index].data[field] = value;
        setBlocks(newBlocks);
    };

    // Special handler for hero slides
    const handleSlideChange = (blockIdx, slideIdx, field, value) => {
        const newBlocks = [...blocks];
        const slides = [...(newBlocks[blockIdx].data.slides || [])];
        slides[slideIdx] = { ...slides[slideIdx], [field]: value };
        newBlocks[blockIdx].data.slides = slides;
        setBlocks(newBlocks);
    };

    const addSlide = (blockIdx) => {
        const newBlocks = [...blocks];
        const slides = [...(newBlocks[blockIdx].data.slides || [])];
        slides.push({ title: "New Slide", subtitle: "", buttonText: "Learn More", imageUrl: "" });
        newBlocks[blockIdx].data.slides = slides;
        setBlocks(newBlocks);
    };

    const removeSlide = (blockIdx, slideIdx) => {
        const newBlocks = [...blocks];
        const slides = newBlocks[blockIdx].data.slides.filter((_, i) => i !== slideIdx);
        newBlocks[blockIdx].data.slides = slides;
        setBlocks(newBlocks);
    };

    // Handlers for sidebar links
    const handleSidebarLinkChange = (blockIdx, linkIdx, field, value) => {
        const newBlocks = [...blocks];
        const links = [...(newBlocks[blockIdx].data.links || [])];
        links[linkIdx] = { ...links[linkIdx], [field]: value };
        newBlocks[blockIdx].data.links = links;
        setBlocks(newBlocks);
    };

    const addSidebarLink = (blockIdx) => {
        const newBlocks = [...blocks];
        const links = [...(newBlocks[blockIdx].data.links || [])];
        links.push({ label: "New Link", slug: "" });
        newBlocks[blockIdx].data.links = links;
        setBlocks(newBlocks);
    };

    const removeSidebarLink = (blockIdx, linkIdx) => {
        const newBlocks = [...blocks];
        const links = newBlocks[blockIdx].data.links.filter((_, i) => i !== linkIdx);
        newBlocks[blockIdx].data.links = links;
        setBlocks(newBlocks);
    };

    // --- Tabbed Grid Handlers ---
    const handleTabChange = (blockIdx, tabIdx, field, value) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        tabs[tabIdx] = { ...tabs[tabIdx], [field]: value };
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const addTab = (blockIdx) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        tabs.push({ title: "New Category", cards: [] });
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const removeTab = (blockIdx, tabIdx) => {
        const newBlocks = [...blocks];
        const tabs = newBlocks[blockIdx].data.tabs.filter((_, i) => i !== tabIdx);
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const handleProgramCardChange = (blockIdx, tabIdx, cardIdx, field, value) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        const cards = [...(tabs[tabIdx].cards || [])];
        cards[cardIdx] = { ...cards[cardIdx], [field]: value };
        tabs[tabIdx].cards = cards;
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const addProgramCard = (blockIdx, tabIdx) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        const cards = [...(tabs[tabIdx].cards || [])];
        cards.push({ title: "New Program", imageUrl: "", slug: "" });
        tabs[tabIdx].cards = cards;
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const removeProgramCard = (blockIdx, tabIdx, cardIdx) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        const cards = tabs[tabIdx].cards.filter((_, i) => i !== cardIdx);
        tabs[tabIdx].cards = cards;
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    // --- Logo Wall Handlers ---
    const handleLogoChange = (blockIdx, logoIdx, field, value) => {
        const newBlocks = [...blocks];
        const logos = [...(newBlocks[blockIdx].data.logos || [])];
        logos[logoIdx] = { ...logos[logoIdx], [field]: value };
        newBlocks[blockIdx].data.logos = logos;
        setBlocks(newBlocks);
    };

    const addLogo = (blockIdx) => {
        const newBlocks = [...blocks];
        const logos = [...(newBlocks[blockIdx].data.logos || [])];
        logos.push({ imageUrl: "", link: "" });
        newBlocks[blockIdx].data.logos = logos;
        setBlocks(newBlocks);
    };

    const removeLogo = (blockIdx, logoIdx) => {
        const newBlocks = [...blocks];
        const logos = newBlocks[blockIdx].data.logos.filter((_, i) => i !== logoIdx);
        newBlocks[blockIdx].data.logos = logos;
        setBlocks(newBlocks);
    };

    // --- News & Notices Handlers ---
    const handleNsTabChange = (blockIdx, tabIdx, field, value) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        tabs[tabIdx] = { ...tabs[tabIdx], [field]: value };
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const addNsTab = (blockIdx) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        tabs.push({ title: "New Category", items: [] });
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const removeNsTab = (blockIdx, tabIdx) => {
        const newBlocks = [...blocks];
        const tabs = newBlocks[blockIdx].data.tabs.filter((_, i) => i !== tabIdx);
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const handleNsItemChange = (blockIdx, tabIdx, itemIdx, field, value) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        const items = [...(tabs[tabIdx].items || [])];
        items[itemIdx] = { ...items[itemIdx], [field]: value };
        tabs[tabIdx].items = items;
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const addNsItem = (blockIdx, tabIdx) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        const items = [...(tabs[tabIdx].items || [])];
        items.push({ title: "New Announcement", date: new Date().toISOString().split('T')[0], time: "", location: "" });
        tabs[tabIdx].items = items;
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const removeNsItem = (blockIdx, tabIdx, itemIdx) => {
        const newBlocks = [...blocks];
        const tabs = [...(newBlocks[blockIdx].data.tabs || [])];
        const items = tabs[tabIdx].items.filter((_, i) => i !== itemIdx);
        tabs[tabIdx].items = items;
        newBlocks[blockIdx].data.tabs = tabs;
        setBlocks(newBlocks);
    };

    const handleSavePage = async () => {
        try {
            const res = await ep1.post(`/api/v2/cms/pages/${id}`, {
                blocks: blocks
            });
            if (res.data.success) {
                showSnackbar("Page saved successfully!");
            }
        } catch (err) {
            showSnackbar("Error saving page", "error");
        }
    };

    if (!page) return <Typography>Loading...</Typography>;

    return (
        <EditorProvider>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center">
                        <IconButton onClick={() => navigate("/web-builder")} sx={{ mr: 1 }}>
                            <BackIcon />
                        </IconButton>
                        <Typography variant="h5" component="h1">
                            Editing: <b>{page.title}</b>
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        size="large"
                        onClick={handleSavePage}
                    >
                        Save Changes
                    </Button>
                </Box>

                <Grid container spacing={4}>
                    {/* Left side: Block List / Editor */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Page Structure
                        </Typography>

                        {blocks.map((block, index) => (
                            <Card key={index} sx={{ mb: 3, borderLeft: '5px solid #1976d2' }}>
                                <Box sx={{ p: 1, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', ml: 1 }}>
                                        {block.type.replace('_', ' ')} Block
                                    </Typography>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleMoveBlock(index, -1)} disabled={index === 0}>
                                            <MoveUpIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleMoveBlock(index, 1)} disabled={index === blocks.length - 1}>
                                            <MoveDownIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteBlock(index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <CardContent>
                                    {renderBlockEditor(block, index, handleBlockDataChange, {
                                        handleSlideChange, addSlide, removeSlide,
                                        handleSidebarLinkChange, addSidebarLink, removeSidebarLink,
                                        handleTabChange, addTab, removeTab,
                                        handleProgramCardChange, addProgramCard, removeProgramCard,
                                        handleLogoChange, addLogo, removeLogo,
                                        handleNsTabChange, addNsTab, removeNsTab, 
                                        handleNsItemChange, addNsItem, removeNsItem,
                                        forms
                                    })}
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            fullWidth
                            variant="soft"
                            sx={{ py: 3, border: '2px dashed #ccc', textTransform: 'none' }}
                            onClick={() => setOpenAddBlock(true)}
                        >
                            <AddIcon sx={{ mr: 1 }} /> Add New Section
                        </Button>
                    </Grid>

                    {/* Right side: Page Settings */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Page Settings</Typography>
                            <TextField
                                fullWidth
                                label="Meta Title"
                                margin="normal"
                                size="small"
                            />
                            <TextField
                                fullWidth
                                label="Meta Description"
                                multiline
                                rows={3}
                                margin="normal"
                                size="small"
                            />
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="caption" color="textSecondary">
                                Status: <b>Published</b><br />
                                Slug: <b>/{page.slug}</b>
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Block Selection Dialog */}
                <Dialog open={openAddBlock} onClose={() => setOpenAddBlock(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Select a Section to Add</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ pt: 1 }}>
                            {BLOCK_TYPES.map((b) => (
                                <Grid item xs={12} sm={6} key={b.type}>
                                    <Card
                                        variant="outlined"
                                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f7ff', borderColor: '#1976d2' } }}
                                        onClick={() => handleAddBlock(b.type)}
                                    >
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            {b.icon}
                                            <Typography variant="subtitle2" fontWeight="bold">{b.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{b.description}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddBlock(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </EditorProvider>
    );
};

// Helper to render specific inputs based on block type
const renderBlockEditor = (block, index, onChange, handlers) => {
    const {
        handleSlideChange, addSlide, removeSlide,
        handleSidebarLinkChange, addSidebarLink, removeSidebarLink,
        handleTabChange, addTab, removeTab,
        handleProgramCardChange, addProgramCard, removeProgramCard,
        handleLogoChange, addLogo, removeLogo,
        handleNsTabChange, addNsTab, removeNsTab,
        handleNsItemChange, addNsItem, removeNsItem,
        forms
    } = handlers;

    switch (block.type) {
        case 'hero':
            const slides = block.data.slides || [];
            const quickActions = block.data.quickActions || [];
            return (
                <Box>
                    <Typography variant="subtitle2" mb={1} color="primary">Hero Slides</Typography>
                    {slides.map((slide, sIdx) => (
                        <Paper key={sIdx} variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: '#fafafa' }}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="caption" fontWeight="bold">Slide #{sIdx + 1}</Typography>
                                <IconButton size="small" color="error" onClick={() => removeSlide(index, sIdx)} disabled={slides.length === 1}>
                                    <DeleteIcon fontSize="inherit" />
                                </IconButton>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Title" size="small" value={slide.title || ""} onChange={(e) => handleSlideChange(index, sIdx, 'title', e.target.value)} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Subtitle" size="small" value={slide.subtitle || ""} onChange={(e) => handleSlideChange(index, sIdx, 'subtitle', e.target.value)} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="Button Text" size="small" value={slide.buttonText || ""} onChange={(e) => handleSlideChange(index, sIdx, 'buttonText', e.target.value)} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="Link URL (Redirect)" size="small" value={slide.link || ""} onChange={(e) => handleSlideChange(index, sIdx, 'link', e.target.value)} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Background Image URL" size="small" value={slide.imageUrl || ""} onChange={(e) => handleSlideChange(index, sIdx, 'imageUrl', e.target.value)} />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                    <Button startIcon={<AddIcon />} size="small" onClick={() => addSlide(index)}>Add Slide</Button>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" mb={1} color="primary">Floating Action Buttons</Typography>
                    <Grid container spacing={2}>
                        {quickActions.map((action, aIdx) => (
                            <Grid item xs={4} key={aIdx}>
                                <TextField
                                    fullWidth label={action.label} size="small"
                                    value={action.link}
                                    onChange={(e) => {
                                        const newActions = [...quickActions];
                                        newActions[aIdx].link = e.target.value;
                                        onChange(index, 'quickActions', newActions);
                                    }}
                                    placeholder="Link URL"
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            );
        case 'image_text':
            return (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Block Heading" size="small" value={block.data.heading || ""} onChange={(e) => onChange(index, 'heading', e.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">Content Text (Rich Text)</Typography>
                        <Editor value={block.data.text || ""} onChange={(e) => onChange(index, 'text', e.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Image URL" size="small" value={block.data.imageUrl || ""} onChange={(e) => onChange(index, 'imageUrl', e.target.value)} />
                    </Grid>
                </Grid>
            );
        case 'sidebar_content':
            const sidebarLinks = block.data.links || [];
            return (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" color="primary" mb={1}>Sidebar Settings</Typography>
                        <TextField fullWidth label="Sidebar Title" size="small" value={block.data.sidebarTitle || ""} onChange={(e) => onChange(index, 'sidebarTitle', e.target.value)} sx={{ mb: 2 }} />
                        <Typography variant="caption" fontWeight="bold">Links</Typography>
                        {sidebarLinks.map((link, lIdx) => (
                            <Box key={lIdx} sx={{ mb: 1, display: 'flex', gap: 1 }}>
                                <TextField size="small" placeholder="Label" value={link.label} onChange={(e) => handleSidebarLinkChange(index, lIdx, 'label', e.target.value)} sx={{ flex: 1 }} />
                                <TextField size="small" placeholder="Slug" value={link.slug} onChange={(e) => handleSidebarLinkChange(index, lIdx, 'slug', e.target.value)} sx={{ flex: 1 }} />
                                <IconButton size="small" color="error" onClick={() => removeSidebarLink(index, lIdx)} disabled={sidebarLinks.length === 1}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                        <Button size="small" startIcon={<AddIcon />} onClick={() => addSidebarLink(index)}>Add Link</Button>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="subtitle2" color="primary" mb={1}>Main Content (Rich Text)</Typography>
                        <Editor value={block.data.content || ""} onChange={(e) => onChange(index, 'content', e.target.value)} />
                    </Grid>
                </Grid>
            );
        case 'news_notices':
            const nsTabs = block.data.tabs || [];
            return (
                <Box>
                    <Typography variant="subtitle2" color="primary" mb={2}>News & Notices Categories (Tabs)</Typography>
                    {nsTabs.map((tab, tIdx) => (
                        <Paper key={tIdx} variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                            <Box display="flex" gap={2} alignItems="center" mb={2}>
                                <TextField label="Category Title" size="small" sx={{ flex: 1 }} value={tab.title} onChange={(e) => handleNsTabChange(index, tIdx, 'title', e.target.value)} />
                                <Button size="small" color="error" onClick={() => removeNsTab(index, tIdx)} disabled={nsTabs.length === 1}>Remove Category</Button>
                            </Box>

                            <Typography variant="caption" fontWeight="bold">Announcements in this Category:</Typography>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                {(tab.items || []).map((item, iIdx) => (
                                    <Card key={iIdx} variant="outlined" sx={{ p: 2 }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} md={6}>
                                                <TextField fullWidth label="Notice Title" size="small" value={item.title} onChange={(e) => handleNsItemChange(index, tIdx, iIdx, 'title', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField fullWidth label="Date" type="date" size="small" value={item.date} onChange={(e) => handleNsItemChange(index, tIdx, iIdx, 'date', e.target.value)} InputLabelProps={{ shrink: true }} />
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <TextField fullWidth label="Time" size="small" value={item.time} onChange={(e) => handleNsItemChange(index, tIdx, iIdx, 'time', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={10} md={10}>
                                                <TextField fullWidth label="Location/Meta Detail" size="small" value={item.location} onChange={(e) => handleNsItemChange(index, tIdx, iIdx, 'location', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={2} md={2} textAlign="right">
                                                <IconButton color="error" onClick={() => removeNsItem(index, tIdx, iIdx)}><DeleteIcon /></IconButton>
                                            </Grid>
                                        </Grid>
                                    </Card>
                                ))}
                            </Stack>
                            <Button startIcon={<AddIcon />} size="small" sx={{ mt: 2 }} onClick={() => addNsItem(index, tIdx)}>Add Announcement</Button>
                        </Paper>
                    ))}
                    <Button variant="contained" size="small" onClick={() => addNsTab(index)}>Add New Category (Tab)</Button>
                </Box>
            );
        case 'tabbed_grid':
            const tabs = block.data.tabs || [];
            return (
                <Box>
                    <TextField fullWidth label="Section Title" size="small" value={block.data.title || ""} onChange={(e) => onChange(index, 'title', e.target.value)} sx={{ mb: 2 }} />
                    {tabs.map((tab, tIdx) => (
                        <Paper key={tIdx} variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: '#fcfcfc', border: '1px solid #ddd' }}>
                            <Box display="flex" gap={2} alignItems="center" mb={2}>
                                <TextField label="Tab Label" size="small" value={tab.title} onChange={(e) => handleTabChange(index, tIdx, 'title', e.target.value)} />
                                <Button size="small" color="error" onClick={() => removeTab(index, tIdx)} disabled={tabs.length === 1}>Remove Tab</Button>
                            </Box>

                            <Typography variant="caption" fontWeight="bold">Program Cards in this Tab:</Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                {(tab.cards || []).map((card, cIdx) => (
                                    <Grid item xs={12} key={cIdx}>
                                        <Card variant="outlined" sx={{ p: 1 }}>
                                            <Grid container spacing={1} alignItems="center">
                                                <Grid item xs={3}>
                                                    <TextField fullWidth label="Title" size="small" value={card.title} onChange={(e) => handleProgramCardChange(index, tIdx, cIdx, 'title', e.target.value)} />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField fullWidth label="Image URL" size="small" value={card.imageUrl} onChange={(e) => handleProgramCardChange(index, tIdx, cIdx, 'imageUrl', e.target.value)} />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField fullWidth label="Page Slug/Link" size="small" value={card.slug} onChange={(e) => handleProgramCardChange(index, tIdx, cIdx, 'slug', e.target.value)} />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton size="small" color="error" onClick={() => removeProgramCard(index, tIdx, cIdx)}><DeleteIcon fontSize="inherit" /></IconButton>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            <Button startIcon={<AddIcon />} size="small" sx={{ mt: 1 }} onClick={() => addProgramCard(index, tIdx)}>Add Card</Button>
                        </Paper>
                    ))}
                    <Button variant="contained" size="small" onClick={() => addTab(index)}>Add New Category (Tab)</Button>
                </Box>
            );
        case 'logo_wall':
            const logos = block.data.logos || [];
            return (
                <Box>
                    <TextField fullWidth label="Section Title" size="small" value={block.data.title || ""} onChange={(e) => onChange(index, 'title', e.target.value)} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Subtitle" size="small" value={block.data.subtitle || ""} onChange={(e) => onChange(index, 'subtitle', e.target.value)} sx={{ mb: 2 }} multiline rows={2} />
                    <Grid container spacing={2}>
                        {logos.map((logo, lIdx) => (
                            <Grid item xs={12} md={6} key={lIdx}>
                                <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextField label="Logo URL" size="small" sx={{ flex: 2 }} value={logo.imageUrl} onChange={(e) => handleLogoChange(index, lIdx, 'imageUrl', e.target.value)} />
                                    <TextField label="Link" size="small" sx={{ flex: 1 }} value={logo.link} onChange={(e) => handleLogoChange(index, lIdx, 'link', e.target.value)} />
                                    <IconButton size="small" color="error" onClick={() => removeLogo(index, lIdx)} disabled={logos.length === 1}><DeleteIcon fontSize="inherit" /></IconButton>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                    <Button startIcon={<AddIcon />} size="small" sx={{ mt: 2 }} onClick={() => addLogo(index)}>Add Logo</Button>
                </Box>
            );
        case 'rich_text':
            return (
                <Box>
                    <Typography variant="subtitle2" color="primary" mb={1}>Content (Full Width)</Typography>
                    <Editor value={block.data.content || ""} onChange={(e) => onChange(index, 'content', e.target.value)} />
                </Box>
            );
        case 'form_block':
            return (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Form Section Title" size="small" value={block.data.title || ""} onChange={(e) => onChange(index, 'title', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            select
                            label="Select Form Template"
                            size="small"
                            value={block.data.formId || ""}
                            onChange={(e) => onChange(index, 'formId', e.target.value)}
                            SelectProps={{ native: true }}
                        >
                            <option value="">-- Choose a Form --</option>
                            {forms.map(f => (
                                <option key={f._id} value={f._id}>{f.title}</option>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            );
        default:
            return <Typography variant="caption">Setting for this block type coming soon...</Typography>;
    }
};

export default WebCmsPageEditor;
