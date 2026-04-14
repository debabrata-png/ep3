import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Select, MenuItem, Button, Typography
} from '@mui/material';
import ep1 from "../api/ep1.js";
import global1 from "./global1.js";

const SwapClasses = () => {
  const [classes, setClasses] = useState([]);
  const [class1, setClass1] = useState('');
  const [class2, setClass2] = useState('');
  const colid = 30; // dynamic later

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    // const res = await axios.get(`http://localhost:5000/swapGetClasses?colid=${colid}`);
    const res = await ep1.get(`/swapGetClasses?colid=${colid}`);
    setClasses(res.data);
  };

  const handleSwap = async () => {
    // await axios.post('http://localhost:5000/swapClasses', {
        await ep1.post('/swapClasses', {
      class1Id: class1,
      class2Id: class2,
      colid
    });

    alert('Classes swapped!');
    loadClasses();
  };

  return (
    <Container>
      <Typography variant="h4">Swap Classes</Typography>

      <Select
        fullWidth
        value={class1}
        onChange={(e) => setClass1(e.target.value)}
      >
        {classes.map(c => (
          <MenuItem key={c._id} value={c._id}>
            {c.name} - {c.classtime}
          </MenuItem>
        ))}
      </Select>

      <br /><br />

      <Select
        fullWidth
        value={class2}
        onChange={(e) => setClass2(e.target.value)}
      >
        {classes.map(c => (
          <MenuItem key={c._id} value={c._id}>
            {c.name} - {c.classtime}
          </MenuItem>
        ))}
      </Select>

      <br /><br />

      <Button variant="contained" onClick={handleSwap}>
        Swap Classes
      </Button>
    </Container>
  );
};

export default SwapClasses;