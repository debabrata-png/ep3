import React, { useEffect, useState } from "react";
import { Grid, TextField, Button, MenuItem } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import ep1 from '../api/ep1';
import global1 from './global1';

export default function StockPage() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({
    storeid: "",
    categoryid: "",
    itemname: "",
    quantity: ""
  });

  const colid = global1.colid;

  useEffect(() => {
    loadMasters();
  }, []);

  // LOAD STORE + CATEGORY ONLY
  const loadMasters = async () => {
    const s = await ep1.get(`/indstore?colid=${colid}`);
    const c = await ep1.get(`/indcategory?colid=${colid}`);

    setStores(s.data);
    setCategories(c.data);
  };

  // 🔥 LOAD STOCK BASED ON FILTER
  const loadStock = async (storeid, categoryid) => {
    let url = `/indstock?colid=${colid}`;

    if (storeid) url += `&storeid=${storeid}`;
    if (categoryid) url += `&categoryid=${categoryid}`;

    const res = await ep1.get(url);
    setRows(res.data);
  };

  // 🔥 HANDLE DROPDOWN CHANGE
  const handleChange = (field, value) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    // Trigger filter when both selected
    loadStock(
      field === "storeid" ? value : updatedForm.storeid,
      field === "categoryid" ? value : updatedForm.categoryid
    );
  };

  const addStock = async () => {
    await ep1.post("/indstock", { ...form, colid });
    loadStock(form.storeid, form.categoryid);
  };

  const deleteStock = async (id) => {
    await ep1.post(`/indstock/${id}`);
    loadStock(form.storeid, form.categoryid);
  };

  const columns = [
    { field: "itemname", headerName: "Item", width: 150 },
    { field: "quantity", headerName: "Qty", width: 100 },
    // {
    //   field: "store",
    //   headerName: "Store",
    //   width: 150,
    //   valueGetter: (p) => p.row.storeid?.storename
    // },
    // {
    //   field: "category",
    //   headerName: "Category",
    //   width: 150,
    //   valueGetter: (p) => p.row.categoryid?.categoryname
    // },
    {
      field: "delete",
      headerName: "Delete",
      width: 120,
      renderCell: (params) => (
        <Button color="error" onClick={() => deleteStock(params.row._id)}>
          Delete
        </Button>
      )
    }
  ];

  return (
    <Grid container spacing={2}>
      
      {/* STORE */}
      <Grid item xs={3}>
        <TextField
          select
          label="Store"
          fullWidth
          value={form.storeid}
          onChange={(e) => handleChange("storeid", e.target.value)}
        >
          {stores.map((s) => (
            <MenuItem key={s._id} value={s._id}>
              {s.storename}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* CATEGORY */}
      <Grid item xs={3}>
        <TextField
          select
          label="Category"
          fullWidth
          value={form.categoryid}
          onChange={(e) => handleChange("categoryid", e.target.value)}
        >
          {categories.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.categoryname}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* ITEM */}
      <Grid item xs={3}>
        <TextField
          label="Item"
          fullWidth
          value={form.itemname}
          onChange={(e) =>
            setForm({ ...form, itemname: e.target.value })
          }
        />
      </Grid>

      {/* QTY */}
      <Grid item xs={2}>
        <TextField
          label="Qty"
          fullWidth
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
        />
      </Grid>

      {/* ADD */}
      <Grid item xs={1}>
        <Button variant="contained" onClick={addStock}>
          Add
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