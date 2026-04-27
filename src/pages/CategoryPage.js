import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, TextField, Grid } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

export default function CategoryPage() {
  const [rows, setRows] = useState([]);
  const [categoryname, setCategoryname] = useState("");
  const [editId, setEditId] = useState(null);

  const colid = global1.colid;

  // LOAD DATA
  const loadData = async () => {
    const res = await ep1.get(`/indcategory?colid=${colid}`);
    setRows(res.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD / UPDATE
  const saveData = async () => {
    if (!categoryname) return;

    if (editId) {
      await ep1.post(`/indcategory/${editId}`, {
        categoryname,
        colid,
      });
    } else {
      await ep1.post(`/indcategory`, {
        categoryname,
        colid,
      });
    }

    setCategoryname("");
    setEditId(null);
    loadData();
  };

  // DELETE
  const deleteData = async (id) => {
    await ep1.post(`/indcategory/${id}`);
    loadData();
  };

  // EDIT
  const editData = (row) => {
    setCategoryname(row.categoryname);
    setEditId(row._id);
  };

  // GRID COLUMNS
  const columns = [
    { field: "_id", headerName: "ID", width: 220 },
    { field: "categoryname", headerName: "Category Name", width: 250 },

    {
      field: "edit",
      headerName: "Edit",
      width: 120,
      renderCell: (params) => (
        <Button onClick={() => editData(params.row)}>Edit</Button>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 120,
      renderCell: (params) => (
        <Button color="error" onClick={() => deleteData(params.row._id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Grid container spacing={2}>
      
      {/* FORM */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Category Name"
          value={categoryname}
          onChange={(e) => setCategoryname(e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={2}>
        <Button variant="contained" fullWidth onClick={saveData}>
          {editId ? "Update" : "Add"}
        </Button>
      </Grid>

      {/* GRID */}
      <Grid item xs={12} style={{ height: 500 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
          slots={{ toolbar: GridToolbar }}
        />
      </Grid>

    </Grid>
  );
}