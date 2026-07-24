const SHEET_ID = '1s8hz-qQEOk2UhGe2UAOx5MjVs-sSFs0s99vsgeXPyM0';
const STUDENTS = ['VEDANSHI', 'HEMANVITH', 'BHAVYESH', 'ISRA', 'AYRA', 'AARUSH', 'PARNIK'];

function parsePercentage(val) {
    if (!val || val === 'N/A' || val === '' || val === null) return 0;
    const s = String(val).replace('%', '').trim();
    const num = parseFloat(s);
    if (isNaN(num)) return 0;
    return num <= 1 ? num : num / 100;
}

function parseBottle(val) {
    if (!val || val === 'N/A' || val === '' || val === null) return 0;
    const num = parseFloat(String(val));
    return isNaN(num) ? 0 : num;
}

function fetchSheetJSON(sheetName) {
    return new Promise((resolve, reject) => {
        const callbackName = 'sheetCallback_' + sheetName + '_' + Date.now();
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${callbackName}&sheet=${sheetName}`;
        
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout'));
        }, 10000);

        function cleanup() {
            clearTimeout(timeout);
            delete window[callbackName];
            const el = document.getElementById(callbackName);
            if (el) el.remove();
        }

        window[callbackName] = function(response) {
            cleanup();
            if (response && response.table) {
                resolve(response.table);
            } else {
                reject(new Error('No table data'));
            }
        };

        const script = document.createElement('script');
        script.id = callbackName;
        script.src = url;
        script.onerror = function() { cleanup(); reject(new Error('Script load failed')); };
        document.body.appendChild(script);
    });
}

function extractRows(table) {
    const rows = [];
    if (!table || !table.rows) return rows;
    for (const row of table.rows) {
        const cells = [];
        if (row.c) {
            for (const cell of row.c) {
                cells.push(cell && cell.v != null ? String(cell.v) : '');
            }
        }
        rows.push(cells);
    }
    return rows;
}

function parseSheetData(rows) {
    const weeks = [];
    let i = 0;
    while (i < rows.length) {
        const rowText = (rows[i] || []).join(' ').toUpperCase();
        if (rowText.includes('WEEK') && !rowText.includes('ARRIVAL')) {
            // Week title row
            const parts = rowText.replace(/\s+/g, ' ').trim();
            let label = parts;
            // Try to extract just "July XTH WEEK" part
            const weekMatch = parts.match(/(JULY\s+\d+\w*\s+WEEK)/i);
            if (weekMatch) label = weekMatch[1];
            // Remove student name from label
            for (const s of STUDENTS) {
                label = label.replace(s, '').trim();
            }
            i++;
            // Next row: date range + headers
            if (i >= rows.length) break;
            const headerRow = rows[i] || [];
            const dateRange = headerRow[0] || '';
            i++;
            // Next 6 rows: Mon-Sat
            const days = [];
            const validDays = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
            for (let d = 0; d < 6 && i < rows.length; d++, i++) {
                const r = rows[i] || [];
                const dayName = (r[0] || '').toUpperCase().trim();
                if (!validDays.includes(dayName)) break;
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
    const table = await fetchSheetJSON(studentName);
    const rows = extractRows(table);
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
            console.log('Live data loaded from Google Sheets:', Object.keys(studentsData).join(', '));
        } else {
            console.warn('No data from Google Sheets, using fallback');
        }
    } catch (err) {
        console.warn('Failed to fetch from Google Sheets, using fallback data:', err.message);
    }
    renderApp();
}
