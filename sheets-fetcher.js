const SHEET_ID = '1s8hz-qQEOk2UhGe2UAOx5MjVs-sSFs0s99vsgeXPyM0';
const STUDENTS = ['VEDANSHI', 'HEMANVITH', 'BHAVYESH', 'ISRA', 'AYRA', 'AARUSH', 'PARNIK'];

function parseCSV(text) {
    const rows = [];
    const lines = text.split('\n');
    for (const line of lines) {
        if (!line.trim()) { rows.push([]); continue; }
        const row = [];
        let inQuote = false, cell = '';
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { inQuote = !inQuote; }
            else if (ch === ',' && !inQuote) { row.push(cell.trim()); cell = ''; }
            else { cell += ch; }
        }
        row.push(cell.trim());
        rows.push(row);
    }
    return rows;
}

function parsePercentage(val) {
    if (!val || val === 'N/A' || val === '') return 0;
    const num = parseFloat(val.replace('%', ''));
    if (isNaN(num)) return 0;
    return num / 100;
}

function parseBottle(val) {
    if (!val || val === 'N/A' || val === '') return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
}

function parseSheetData(rows) {
    const weeks = [];
    let i = 0;
    while (i < rows.length) {
        // Look for a week header row (contains "WEEK" in one of the first cells)
        const rowText = (rows[i] || []).join(' ').toUpperCase();
        if (rowText.includes('WEEK') && !rowText.includes('ARRIVAL')) {
            // This is the week title row like "JULY  2ND WEEK  VEDANSHI"
            const parts = rowText.replace(/\s+/g, ' ').trim().split(' ');
            const weekIdx = parts.findIndex(p => p === 'WEEK');
            let label = '';
            if (weekIdx >= 0 && weekIdx >= 1) {
                label = parts.slice(0, weekIdx + 1).join(' ');
            } else {
                label = rowText.split(STUDENTS.join('|'))[0].trim() || rowText;
            }
            i++;
            // Next row should be the headers row with date_range
            if (i >= rows.length) break;
            const headerRow = rows[i] || [];
            const dateRange = headerRow[0] || '';
            i++;
            // Next 6 rows are Mon-Sat data
            const days = [];
            for (let d = 0; d < 6 && i < rows.length; d++, i++) {
                const r = rows[i] || [];
                const dayName = (r[0] || '').toUpperCase().trim();
                if (!dayName || !['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].includes(dayName)) {
                    break;
                }
                days.push({
                    day: dayName,
                    arrival_time: r[1] || 'N/A',
                    snacks: r[2] || 'N/A',
                    snack_completion: parsePercentage(r[3]),
                    interested_in: r[4] || 'N/A',
                    lunch_completion: parsePercentage(r[5]),
                    lunch: r[6] || 'N/A',
                    water_completion: parsePercentage(r[7]),
                    bottle_refill: parseBottle(r[8]),
                    uniform: r[9] || 'N/A'
                });
            }
            if (days.length > 0) {
                weeks.push({ label: label, date_range: dateRange, days: days });
            }
        } else {
            i++;
        }
    }
    return weeks;
}

async function fetchStudentData(studentName) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${studentName}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const rows = parseCSV(text);
    return parseSheetData(rows);
}

async function fetchAllStudentsData() {
    const data = {};
    const results = await Promise.allSettled(
        STUDENTS.map(async (name) => {
            const weeks = await fetchStudentData(name);
            return { name, weeks };
        })
    );
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.weeks.length > 0) {
            data[result.value.name] = result.value.weeks;
        }
    }
    return data;
}

async function loadData() {
    try {
        const liveData = await fetchAllStudentsData();
        if (Object.keys(liveData).length > 0) {
            studentsData = liveData;
            console.log('Loaded live data from Google Sheets:', Object.keys(studentsData));
        } else {
            console.warn('No data from Google Sheets, using fallback');
        }
    } catch (err) {
        console.warn('Failed to fetch from Google Sheets, using fallback data:', err.message);
    }
    renderApp();
}
