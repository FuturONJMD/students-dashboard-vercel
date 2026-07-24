const SHEET_ID = '1s8hz-qQEOk2UhGe2UAOx5MjVs-sSFs0s99vsgeXPyM0';
const STUDENTS = ['VEDANSHI', 'HEMANVITH', 'BHAVYESH', 'ISRA', 'AYRA', 'AARUSH', 'PARNIK'];

function parsePercentage(val) {
    if (!val || val === 'N/A' || val === '' || val === null) return 0;
    const s = String(val).replace('%', '').trim();
    const num = parseFloat(s);
    if (isNaN(num)) return 0;
    // Formatted values come as "100" (from "100%"), raw as 1.0
    return num > 1 ? num / 100 : num;
}

function parseBottle(val) {
    if (!val || val === 'N/A' || val === '' || val === null) return 0;
    const s = String(val).trim();
    // Handle fractions like "1/2"
    if (s.includes('/')) {
        const parts = s.split('/');
        return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
}

function formatArrivalTime(val) {
    if (!val || val === '' || val === 'N/A') return 'N/A';
    // Value comes as "9:23" or "11:00" from Google's formatted output
    const s = String(val).trim();
    const match = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return s;
    let h = parseInt(match[1]);
    const m = match[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
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
                if (!cell || cell.v == null) {
                    cells.push('');
                } else if (cell.f) {
                    // Use formatted value (handles dates, percentages, fractions)
                    cells.push(String(cell.f));
                } else {
                    cells.push(String(cell.v));
                }
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
        const rowText = (rows[i] || []).join(' ').toUpperCase().trim();
        // Detect week header: contains "WEEK" but NOT day data or column headers
        const hasWeek = rowText.includes('WEEK');
        const hasArrival = rowText.includes('ARRIVAL');
        const isDayRow = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].some(d => rowText.startsWith(d));
        
        if (hasWeek && !hasArrival && !isDayRow) {
            // Week title row - extract label
            const weekMatch = rowText.match(/(\d+\w*\s*WEEK)/i);
            let label = weekMatch ? 'July ' + weekMatch[1] : rowText;
            // Remove student names
            for (const s of STUDENTS) {
                label = label.replace(new RegExp(s, 'gi'), '').trim();
            }
            // Remove leftover "JULY" duplicates and clean up
            label = label.replace(/\s+/g, ' ').trim();
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
                    arrival_time: formatArrivalTime(r[1]),
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
