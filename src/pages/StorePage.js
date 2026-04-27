import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button, TextField, Grid } from "@mui/material";

import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';

export default function StorePage() {
  const [rows, setRows] = useState([]);
  const [storename, setStorename] = useState("");
  const colid = global1.colid;

  const loadData = async () => {
    const res = await ep1.get(`/indstore?colid=${colid}`);
    setRows(res.data);
  };

  useEffect(() => { loadData(); }, []);

  const addData = async () => {
    await ep1.post("/indstore", { storename, colid });
    loadData();
  };

  const deleteData = async (id) => {
    await ep1.post(`/indstore/${id}`);
    loadData();
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 200 },
    { field: "storename", headerName: "Store", width: 200 },
    {
      field: "action",
      renderCell: (params) => (
        <Button onClick={() => deleteData(params.row._id)}>Delete</Button>
      )
    }
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField value={storename} onChange={e => setStorename(e.target.value)} />
        <Button onClick={addData}>Add</Button>
      </Grid>

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