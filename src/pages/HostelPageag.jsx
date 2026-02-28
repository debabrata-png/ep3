import React, { useEffect, useState, useRef } from "react"; // added useRef
import {
  Box, Card, CardContent, Typography, Button, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  Pagination, Chip, Fade, Tooltip, LinearProgress, Divider, Menu,
  MenuItem, ListItemIcon, ListItemText, InputAdornment
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import HotelIcon from "@mui/icons-material/Hotel";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DescriptionIcon from "@mui/icons-material/Description";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BusinessIcon from "@mui/icons-material/Business";
import LayersIcon from "@mui/icons-material/Layers";

import ep1 from "../api/ep1";
import global1 from "./global1";
import * as XLSX from "xlsx";

const HostelMasterPage = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState({});
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);


  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 450);
  };

  const fetchData = async (page = 1, searchTerm = debouncedSearch) => {
    try {
      setLoading(true);
      const searchParam = searchTerm.trim()
        ? `&search=${encodeURIComponent(searchTerm.trim())}`
        : "";
      const res = await ep1.get(
        `/api/v2/hostel?page=${page}&colid=${global1.colid}&role=${global1.role}${searchParam}`
      );
      setData(res.data.data || []);
      setPagination(res.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      showMessage("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };


  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await ep1.get(
        `/api/v2/hostel?colid=${global1.colid}&role=${global1.role}`
      );
      const all = res.data.data || [];
      setAllData(all);
      return all;
    } catch (err) {
      console.error("Error fetching all data:", err);
      showMessage("Failed to fetch report data", "error");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);


  useEffect(() => {
    fetchData(1, debouncedSearch);
  }, [debouncedSearch]);


  const showMessage = (message, type = "success") => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

  const handlePageChange = (event, value) => {
    fetchData(value);
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "HOSTEL_NAME", "HOSTEL_ADDRESS", "HOSTEL_TYPE",
      "BLOCK_CODE", "BLOCK_NAME",
      "FLOOR_CODE", "FLOOR_NAME",
      "ROOM_NAME", "ROOM_TYPE", "ROOM_CAPACITY", "RESIDENT_TYPE"
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Hostel_Upload_Template.xlsx");
    showMessage("Template downloaded successfully", "success");
  };

  const handleUpload = () => {
    if (!file) {
      showMessage("Please select a file first", "warning");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const dataWithColid = jsonData.map(row => ({
        colid: global1.colid,
        HOSTEL_NAME: row.HOSTEL_NAME || "",
        HOSTEL_ADDRESS: row.HOSTEL_ADDRESS || "",
        HOSTEL_TYPE: row.HOSTEL_TYPE || "",
        BLOCK_CODE: row.BLOCK_CODE || "",
        BLOCK_NAME: row.BLOCK_NAME || "",
        FLOOR_CODE: row.FLOOR_CODE || "",
        FLOOR_NAME: row.FLOOR_NAME || "",
        ROOM_NAME: row.ROOM_NAME || "",
        ROOM_TYPE: row.ROOM_TYPE || "",
        ROOM_CAPACITY: row.ROOM_CAPACITY || 0,
        RESIDENT_TYPE: row.RESIDENT_TYPE || ""
      }));

      ep1.post("/api/v2/hostel/bulk-upload", dataWithColid)
        .then(() => {
          showMessage(`Successfully uploaded ${jsonData.length} records`, "success");
          fetchData(1);
          setFile(null);
        })
        .catch((err) => {
          console.error(err);
          showMessage("Error uploading data", "error");
        })
        .finally(() => setLoading(false));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadIndividualReport = async (row) => {
    try {
      setLoading(true);
      handleMenuClose();
      const hostelDetails = [{
        Hostel_Name: row.hostelName,
        Hostel_Address: row.hostelAddress,
        Hostel_Type: row.hostelType,
        Block_Code: row.blockCode,
        Block_Name: row.blockName,
        Floor_Code: row.floorCode,
        Floor_Name: row.floorName,
        Room_Name: row.roomName,
        Room_Type: row.roomType,
        Room_Capacity: row.roomCapacity,
        Resident_Type: row.residentType,
      }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(hostelDetails), "Record Details");
      const sanitizedName = (row.roomName || "Record").replace(/[^a-z0-9]/gi, '_');
      XLSX.writeFile(workbook, `${sanitizedName}_Report.xlsx`);
      showMessage(`Report for ${row.roomName} downloaded successfully`, "success");
    } catch (error) {
      console.error("INDIVIDUAL REPORT ERROR:", error);
      showMessage("Error generating individual report", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBlockReport = async (row) => {
    try {
      setLoading(true);
      handleMenuClose();
      const reportData = await fetchAllData();
      const blockData = reportData.filter(
        d => d.hostelName === row.hostelName && d.blockName === row.blockName
      );
      if (!blockData.length) { showMessage("No data found for this block", "warning"); return; }
      const blockDetails = blockData.map((d) => ({
        Hostel_Name: d.hostelName, Block_Name: d.blockName, Floor_Name: d.floorName,
        Room_Name: d.roomName, Room_Type: d.roomType,
        Room_Capacity: d.roomCapacity, Resident_Type: d.residentType,
      }));
      const totalRooms = blockData.length;
      const totalBeds = blockData.reduce((sum, d) => sum + Number(d.roomCapacity || 0), 0);
      const summary = [{ Block: row.blockName, Total_Rooms: totalRooms, Total_Beds: totalBeds }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summary), "Block Summary");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(blockDetails), "Block Details");
      const sanitizedName = (row.blockName || "Block").replace(/[^a-z0-9]/gi, '_');
      XLSX.writeFile(workbook, `${sanitizedName}_Block_Report.xlsx`);
      showMessage(`Block report for ${row.blockName} downloaded successfully`, "success");
    } catch (error) {
      console.error("BLOCK REPORT ERROR:", error);
      showMessage("Error generating block report", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFloorReport = async (row) => {
    try {
      setLoading(true);
      handleMenuClose();
      const reportData = await fetchAllData();
      const floorData = reportData.filter(
        d => d.hostelName === row.hostelName &&
          d.blockName === row.blockName &&
          d.floorName === row.floorName
      );
      if (!floorData.length) { showMessage("No data found for this floor", "warning"); return; }
      const floorDetails = floorData.map((d) => ({
        Hostel_Name: d.hostelName, Block_Name: d.blockName, Floor_Name: d.floorName,
        Room_Name: d.roomName, Room_Type: d.roomType,
        Room_Capacity: d.roomCapacity, Resident_Type: d.residentType,
      }));
      const totalRooms = floorData.length;
      const totalBeds = floorData.reduce((sum, d) => sum + Number(d.roomCapacity || 0), 0);
      const summary = [{ Floor: row.floorName, Block: row.blockName, Total_Rooms: totalRooms, Total_Beds: totalBeds }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summary), "Floor Summary");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(floorDetails), "Floor Details");
      const sanitizedName = (row.floorName || "Floor").replace(/[^a-z0-9]/gi, '_');
      XLSX.writeFile(workbook, `${sanitizedName}_Floor_Report.xlsx`);
      showMessage(`Floor report for ${row.floorName} downloaded successfully`, "success");
    } catch (error) {
      console.error("FLOOR REPORT ERROR:", error);
      showMessage("Error generating floor report", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHostelReport = async (row) => {
    try {
      setLoading(true);
      handleMenuClose();
      const reportData = await fetchAllData();
      const hostelData = reportData.filter(d => d.hostelName === row.hostelName);
      if (!hostelData.length) { showMessage("No data found for this hostel", "warning"); return; }
      const hostelDetails = hostelData.map((d) => ({
        Hostel_Name: d.hostelName, Block_Name: d.blockName, Floor_Name: d.floorName,
        Room_Name: d.roomName, Room_Type: d.roomType,
        Room_Capacity: d.roomCapacity, Resident_Type: d.residentType,
      }));
      const totalRooms = hostelData.length;
      const totalBeds = hostelData.reduce((sum, d) => sum + Number(d.roomCapacity || 0), 0);
      const summary = [{ Hostel: row.hostelName, Total_Rooms: totalRooms, Total_Beds: totalBeds }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summary), "Hostel Summary");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(hostelDetails), "Hostel Details");
      const sanitizedName = (row.hostelName || "Hostel").replace(/[^a-z0-9]/gi, '_');
      XLSX.writeFile(workbook, `${sanitizedName}_Hostel_Report.xlsx`);
      showMessage(`Hostel report for ${row.hostelName} downloaded successfully`, "success");
    } catch (error) {
      console.error("HOSTEL REPORT ERROR:", error);
      showMessage("Error generating hostel report", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const reportData = await fetchAllData();
      if (!reportData.length) { showMessage("No data to download", "warning"); return; }
      const roomWise = reportData.map((d) => ({
        Hostel: d.hostelName, Block: d.blockName, Floor: d.floorName,
        Room: d.roomName, Room_Type: d.roomType, Capacity: d.roomCapacity, Resident: d.residentType,
      }));
      const floorMap = {};
      reportData.forEach((d) => {
        const key = `${d.hostelName}-${d.blockName}-${d.floorName}`;
        if (!floorMap[key]) floorMap[key] = { Hostel: d.hostelName, Block: d.blockName, Floor: d.floorName, Total_Rooms: 0, Total_Beds: 0 };
        floorMap[key].Total_Rooms += 1;
        floorMap[key].Total_Beds += Number(d.roomCapacity || 0);
      });
      const blockMap = {};
      reportData.forEach((d) => {
        const key = `${d.hostelName}-${d.blockName}`;
        if (!blockMap[key]) blockMap[key] = { Hostel: d.hostelName, Block: d.blockName, Total_Rooms: 0, Total_Beds: 0 };
        blockMap[key].Total_Rooms += 1;
        blockMap[key].Total_Beds += Number(d.roomCapacity || 0);
      });
      const hostelMap = {};
      reportData.forEach((d) => {
        if (!hostelMap[d.hostelName]) hostelMap[d.hostelName] = { Hostel: d.hostelName, Total_Rooms: 0, Total_Beds: 0 };
        hostelMap[d.hostelName].Total_Rooms += 1;
        hostelMap[d.hostelName].Total_Beds += Number(d.roomCapacity || 0);
      });
      const bedWise = reportData.map((d) => ({
        Hostel: d.hostelName, Block: d.blockName, Floor: d.floorName, Room: d.roomName, Total_Beds: d.roomCapacity,
      }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(roomWise), "Room Wise Report");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(Object.values(floorMap)), "Floor Wise Report");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(Object.values(blockMap)), "Building Wise Report");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(bedWise), "Bed Availability");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(Object.values(hostelMap)), "Hostel Summary");
      XLSX.writeFile(workbook, "Hostel_Reports.xlsx");
      showMessage("Report downloaded successfully", "success");
    } catch (error) {
      console.error("REPORT ERROR:", error);
      showMessage("Error generating report", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setLoading(true);
        await ep1.get(`/api/v2/hostel/delete/${id}`);
        showMessage("Record deleted successfully", "success");
        fetchData(pagination.currentPage);
      } catch (error) {
        showMessage("Delete failed", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (current._id) {
        const { _id, ...updateData } = current;
        await ep1.post(`/api/v2/hostel/update/${_id}`, { ...updateData, colid: global1.colid });
        showMessage("Record updated successfully", "success");
      } else {
        await ep1.post(`/api/v2/hostel`, { ...current, colid: global1.colid });
        showMessage("Record created successfully", "success");
      }
      setOpen(false);
      fetchData(pagination.currentPage);
    } catch (err) {
      console.error("Error saving record:", err);
      showMessage("Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: "hostelName", label: "Hostel Name" },
    { name: "hostelAddress", label: "Hostel Address" },
    { name: "hostelType", label: "Hostel Type" },
    { name: "blockCode", label: "Block Code" },
    { name: "blockName", label: "Block Name" },
    { name: "floorCode", label: "Floor Code" },
    { name: "floorName", label: "Floor Name" },
    { name: "roomName", label: "Room Name" },
    { name: "roomType", label: "Room Type" },
    { name: "roomCapacity", label: "Room Capacity" },
    { name: "residentType", label: "Resident Type" }
  ];



  return (
    <Box sx={{ p: 4, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <HotelIcon sx={{ fontSize: 48, color: "#1976d2" }} />
            <Box>
              <Typography variant="h3" fontWeight="bold" color="primary">
                Hostel  Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage hostel records, rooms, and generate reports
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>

      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
            <Tooltip title="Add new hostel record">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setCurrent({}); setOpen(true); }}
                sx={{
                  background: "#1037d6ff",
                  boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)"
                }}
              >
                Add New
              </Button>
            </Tooltip>
            <Tooltip title="Download Excel template">
              <Button variant="outlined" color="info" onClick={handleDownloadTemplate}>
                Download Template
              </Button>
            </Tooltip>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              {file ? file.name : "Select Excel"}
              <input hidden type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} />
            </Button>
            <Button variant="contained" onClick={handleUpload} disabled={!file || loading} color="success">
              Upload Excel
            </Button>
            <Button variant="contained" color="success" startIcon={<DownloadIcon />}
              onClick={handleDownloadReport} disabled={loading}>
              Download Full Report
            </Button>
            <Tooltip title="Refresh data">
              <IconButton onClick={() => fetchData(pagination.currentPage)} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth size="small"
            label="Search Hostel / Block / Floor / Room"
            value={search}
            onChange={handleSearchChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />

          {msg && (
            <Alert severity={msgType} sx={{ mt: 2 }} onClose={() => setMsg("")}>
              {msg}
            </Alert>
          )}
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Hostel Records</Typography>

          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {["Hostel Name", "Hostel Address", "Hostel Type", "Block Code", "Block Name", "Floor Code", "Floor Name", "Room Name", "Room Type", "Capacity", "Resident Type", "Actions"].map((col) => (
                    <TableCell key={col} sx={{ fontWeight: "bold", bgcolor: "#1976d2", color: "white", whiteSpace: "nowrap" }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>

                {data.length > 0 ? (
                  data.map((row, index) => (
                    <TableRow
                      key={row._id}
                      hover
                      sx={{ "&:hover": { bgcolor: "#f5f5f5" }, bgcolor: index % 2 === 0 ? "white" : "#fafafa" }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ApartmentIcon fontSize="small" color="primary" />
                          <Typography variant="body2" fontWeight="500">{row.hostelName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.hostelAddress}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.hostelType} size="small" color="success" variant="filled" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.blockCode}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.blockName} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.floorCode}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.floorName} size="small" color="secondary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">{row.roomName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.roomType}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.roomCapacity} size="small" color="info" sx={{ fontWeight: "bold" }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.residentType}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary"
                              onClick={() => { setCurrent(row); setOpen(true); }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Reports">
                            <IconButton size="small" color="success" onClick={(e) => handleMenuOpen(e, row)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                        {debouncedSearch ? `No records found for "${debouncedSearch}"` : "No records found"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}{" "}
            of {pagination.totalItems} records
          </Typography>
        </CardContent>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ sx: { boxShadow: 3 } }}>
        <MenuItem onClick={() => selectedRow && handleDownloadIndividualReport(selectedRow)}>
          <ListItemIcon><DescriptionIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Download Record</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedRow && handleDownloadBlockReport(selectedRow)}>
          <ListItemIcon><BusinessIcon fontSize="small" color="secondary" /></ListItemIcon>
          <ListItemText>Download Block Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedRow && handleDownloadFloorReport(selectedRow)}>
          <ListItemIcon><LayersIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Download Floor Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedRow && handleDownloadHostelReport(selectedRow)}>
          <ListItemIcon><HotelIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Download Hostel Report</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" TransitionComponent={Fade}>
        <DialogTitle sx={{
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          color: "white", fontWeight: "bold"
        }}>
          {current._id ? "✏️ Edit Hostel Record" : "➕ Add Hostel Record"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {formFields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                type={field.name === "roomCapacity" ? "number" : "text"}
                value={current[field.name] || ""}
                onChange={(e) => setCurrent({ ...current, [field.name]: e.target.value })}
                fullWidth variant="outlined" size="small"
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{ background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)" }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HostelMasterPage;