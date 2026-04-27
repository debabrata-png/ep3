import React, { useEffect, useState } from "react";
import { Grid, TextField, Button, MenuItem } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from "./global1";

export default function BudgetPage() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({
    storeid: "",
    categoryid: "",
    itemname: "",
    quantity: "",
    price: ""
  });

  const colid = global1.colid;
  const role = global1.role;

  useEffect(() => {
    loadMasters();
    loadBudgets();
  }, []);

  const loadMasters = async () => {
    const s = await ep1.get(`/indstore?colid=${colid}`);
    const c = await ep1.get(`/indcategory?colid=${colid}`);

    setStores(s.data);
    setCategories(c.data);
  };

  // 🔥 LOAD BASED ON ROLE
  const loadBudgets = async () => {
    let statusFilter = "";

    if (role === "HOD") statusFilter = "HOD_PENDING";
    else if (role === "REGISTRAR") statusFilter = "REGISTRAR_PENDING";
    else if (role === "ACCOUNTS") statusFilter = "ACCOUNTS_PENDING";
    else if (role === "MANAGEMENT") statusFilter = "MANAGEMENT_PENDING";

    const res = await ep1.get(
      `/indbudget?colid=${colid}&status=${statusFilter}`
    );

    setRows(res.data);
  };

  // CREATE
  const saveBudget = async () => {
    await ep1.post("/indbudget", {
      ...form,
      colid,
      department: global1.department,
      institution: global1.institution,
       // 🔥 ADD THESE TWO LINES
       quantityremaining: form.quantity,
       priceremaining: form.price
    });

    loadBudgets();
  };

  // APPROVE
  const approve = async (id) => {
    await ep1.post(`/indbudget/approve/${id}`, { level: role });
    loadBudgets();
  };

  // REJECT
  const reject = async (id) => {
    await ep1.post(`/indbudget/reject/${id}`);
    loadBudgets();
  };

  // 🔥 SHOW BUTTON ONLY IF MATCHES ROLE
  const canApprove = (status) => {
    return (
      (role === "HOD" && status === "HOD_PENDING") ||
      (role === "REGISTRAR" && status === "REGISTRAR_PENDING") ||
      (role === "ACCOUNTS" && status === "ACCOUNTS_PENDING") ||
      (role === "MANAGEMENT" && status === "MANAGEMENT_PENDING")
    );
  };

  const columns = [
    {
      field: "store",
      headerName: "Store",
      width: 140,
      valueGetter: p => p.row.storeid?.storename
    },
    {
      field: "category",
      headerName: "Category",
      width: 140,
      valueGetter: p => p.row.categoryid?.categoryname
    },
    { field: "itemname", headerName: "Item", width: 150 },
    { field: "quantity", headerName: "Qty", width: 90 },
    { field: "price", headerName: "Price", width: 100 },
    { field: "status", headerName: "Status", width: 180 },

    {
      field: "approve",
      headerName: "Approve",
      width: 140,
      renderCell: (params) =>
        canApprove(params.row.status) ? (
          <Button onClick={() => approve(params.row._id)}>
            Approve
          </Button>
        ) : null
    },
    {
      field: "reject",
      headerName: "Reject",
      width: 120,
      renderCell: (params) =>
        canApprove(params.row.status) ? (
          <Button color="error" onClick={() => reject(params.row._id)}>
            Reject
          </Button>
        ) : null
    }
  ];

  return (
    <Grid container spacing={2}>

      {/* STORE */}
      <Grid item xs={2}>
        <TextField select label="Store" fullWidth
          onChange={e => setForm({ ...form, storeid: e.target.value })}
        >
          {stores.map(s => (
            <MenuItem key={s._id} value={s._id}>{s.storename}</MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* CATEGORY */}
      <Grid item xs={2}>
        <TextField select label="Category" fullWidth
          onChange={e => setForm({ ...form, categoryid: e.target.value })}
        >
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>{c.categoryname}</MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ITEM */}
      <Grid item xs={2}>
        <TextField label="Item" fullWidth
          onChange={e => setForm({ ...form, itemname: e.target.value })}
        />
      </Grid>

      {/* QTY */}
      <Grid item xs={2}>
        <TextField label="Qty" fullWidth
          onChange={e => setForm({ ...form, quantity: e.target.value })}
        />
      </Grid>

      {/* PRICE */}
      <Grid item xs={2}>
        <TextField label="Price" fullWidth
          onChange={e => setForm({ ...form, price: e.target.value })}
        />
      </Grid>

      {/* SUBMIT */}
      <Grid item xs={2}>
        <Button variant="contained" fullWidth onClick={saveBudget}>
          Submit
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