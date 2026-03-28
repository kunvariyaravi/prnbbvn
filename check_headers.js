const XLSX = require('xlsx');
const wb = XLSX.readFile('01-Tender 2025-26.xlsm');
console.log('Sheets:', wb.SheetNames);

wb.SheetNames.forEach(name => {
    const s = wb.Sheets[name];
    const headers = XLSX.utils.sheet_to_json(s, { header: 1 })[0];
    console.log(`\nHeaders for ${name}:`, headers);
});
