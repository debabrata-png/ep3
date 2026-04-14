import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Select, MenuItem, Button, Typography, TextField, Grid
} from '@mui/material';

import ep1 from "../api/ep1.js";
import global1 from "./global1.js";

const SwapClasses = () => {

  const colid = global1.colid;

  // SOURCE filters
  const [sourceDate, setSourceDate] = useState('');
  const [sourceUser, setSourceUser] = useState('');
  const [sourceClasses, setSourceClasses] = useState([]);
  const [class1, setClass1] = useState('');

  const [users, setUsers] = useState([]);

  // TARGET filters
  const [targetDate, setTargetDate] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [targetClasses, setTargetClasses] = useState([]);
  const [class2, setClass2] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = async () => {
    const res = await axios.get('http://localhost:5000/swapGetUsers', {
      params: { colid }
    });
    setUsers(res.data);
  };

  // 🔍 Load source classes
  const loadSourceClasses = async () => {
    // const res = await axios.get('http://localhost:5000/swapGetClasses', {
        const res = await ep1.get('/swapGetClasses', {
      params: {
        colid,
        date: sourceDate,
        user: sourceUser
      }
    });
    setSourceClasses(res.data);
  };

  // 🔍 Load target classes
  const loadTargetClasses = async () => {
    // const res = await axios.get('http://localhost:5000/swapGetClasses', {
        const res = await ep1.get('/swapGetClasses', {
      params: {
        colid,
        date: targetDate,
        user: targetUser
      }
    });
    setTargetClasses(res.data);
  };

  // 🔄 Swap
  const handleSwap = async () => {
    if (class1 === class2) {
      alert("Cannot swap same class");
      return;
    }

    await axios.post('http://localhost:5000/swapClasses', {
      class1Id: class1,
      class2Id: class2,
      colid
    });

    alert('Classes swapped!');
    loadSourceClasses();
    loadTargetClasses();
  };

  return (
    <Container>
      <Typography variant="h4">Swap Classes</Typography>

      <Grid container spacing={4}>

        {/* SOURCE */}
        <Grid item xs={6}>
          <Typography variant="h6">Source Class</Typography>

          <TextField
            type="date"
            fullWidth
            onChange={(e) => setSourceDate(e.target.value)}
          />

          {/* <TextField
            label="Faculty"
            fullWidth
            onChange={(e) => setSourceUser(e.target.value)}
          /> */}
          <Select
  fullWidth
  value={sourceUser}
  onChange={(e) => setSourceUser(e.target.value)}
  displayEmpty
>
  <MenuItem value="">Select Faculty</MenuItem>
  {users.map((u, index) => (
    <MenuItem key={index} value={u}>
      {u}
    </MenuItem>
  ))}
</Select>

          <Button onClick={loadSourceClasses}>Load Source</Button>

          <Select fullWidth value={class1} onChange={(e) => setClass1(e.target.value)}>
            {sourceClasses.map(c => (
              <MenuItem key={c._id} value={c._id}>
                {c.name} - {c.classtime}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* TARGET */}
        <Grid item xs={6}>
          <Typography variant="h6">Target Class</Typography>

          <TextField
            type="date"
            fullWidth
            onChange={(e) => setTargetDate(e.target.value)}
          />

          {/* <TextField
            label="Faculty"
            fullWidth
            onChange={(e) => setTargetUser(e.target.value)}
          /> */}
          <Select
  fullWidth
  value={targetUser}
  onChange={(e) => setTargetUser(e.target.value)}
  displayEmpty
>
  <MenuItem value="">Select Faculty</MenuItem>
  {users.map((u, index) => (
    <MenuItem key={index} value={u}>
      {u}
    </MenuItem>
  ))}
</Select>

          <Button onClick={loadTargetClasses}>Load Target</Button>

          <Select fullWidth value={class2} onChange={(e) => setClass2(e.target.value)}>
            {targetClasses.map(c => (
              <MenuItem key={c._id} value={c._id}>
                {c.name} - {c.classtime}
              </MenuItem>
            ))}
          </Select>
        </Grid>

      </Grid>

      <br />

      <Button variant="contained" onClick={handleSwap}>
        Swap Classes
      </Button>
    </Container>
  );
};

export default SwapClasses;