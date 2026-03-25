const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('https://backend-suman.onrender.com/api/v2/getstudentsandsubjectsformarks11ds', {
      params: {
        colid: 3052,
        semester: 'XI', 
        academicyear: '2025-26', 
        term: 'unit'
      }
    });
    console.log("Marks length:", res.data.marks?.length);
    if(res.data.marks?.length > 0) {
      console.log("MARK SAMPLE:", res.data.marks[0]);
    }
  } catch (e) {
    console.error(e.message);
  }
}
check();
