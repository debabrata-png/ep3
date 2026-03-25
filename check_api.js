const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('https://backend-suman.onrender.com/api/v2/getstudentsandsubjectsformarks11ds', {
      params: {
        colid: 3052,
        semester: 'XI', 
        academicyear: '2025-26', 
        section: 'Science', 
        term: 'unit'
      }
    });
    console.log("Students:", res.data.students?.length);
    console.log("Subjects:", res.data.subjects?.length);
    console.log("Marks:", res.data.marks?.length);
  } catch (e) {
    console.error(e.message);
  }
}
check();
