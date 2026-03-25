const axios = require('axios');

async function getDropdowns() {
  try {
    const res = await axios.get('https://backend-suman.onrender.com/api/v2/getdistinctsemestersandyears9ds', {
      params: { colid: 3052 }
    });
    console.log("Semesters:", res.data.semesters);
    console.log("Years:", res.data.admissionyears);
    console.log("Sections:", res.data.sections);
  } catch (e) {
    console.error(e.message);
  }
}
getDropdowns();
