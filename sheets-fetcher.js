const SHEET_ID = '1s8hz-qQEOk2UhGe2UAOx5MjVs-sSFs0s99vsgeXPyM0';
const STUDENTS = ['VEDANSHI', 'HEMANVITH', 'BHAVYESH', 'ISRA', 'AYRA', 'AARUSH', 'PARNIK'];
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxLmJQA7DDGayA24sASh8dzIDu8aTr9tLgtBhQKcP5RHpaxWdngJ432upX5ndnDiVq8cQ/exec';

function parsePercentage(val) {
    if (!val || val === 'N/A' || val === '' || val === null) return 0;
    const s = String(val).replace('%', '').trim();
    const num = parseFloat(s);
    if (isNaN(num)) return 0;
    return num > 1 ? num / 100 : num;
}

function parseBottle(val) {
    if (!val || val === 'N/A' || val === '' || val === null) return 0;
    const s = String(val).trim();
    if (s.includes('/')) {
        const parts = s.split('/');
        return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
}

function formatArrivalTime(val) {
    if (!val || val === '' || val === 'N/A') return 'N/A';
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

// === Apps Script fetch (NO caching, instant updates) ===
async function fetchViaAppsScript() {
    if (!APPS_SCRIPT_URL) return null;
    const url = APPS_SCRIPT_URL + '?sheet=ALL&_=' + Date.now();
    const response = await fetch(url);
    if (!response.ok) throw new Error('Apps Script error: ' + response.status);
    const allData = await response.json();
    if (allData.error) throw new Error(allData.error);
    
    const result = {};
    for (const [studentName, rows] of Object.entries(allData)) {
        const weeks = parseSheetRows(rows);
        if (weeks.length > 0) {
            result[studentName] = weeks;
        }
    }
    return result;
}

// Parse rows from Apps Script (array of arrays with display values)
function parseSheetRows(rows) {
    const weeks = [];
    let i = 0;
    while (i < rows.length) {
        const rowText = (rows[i] || []).join(' ').toUpperCase().trim();
        const hasWeek = rowText.includes('WEEK');
        const hasArrival = rowText.includes('ARRIVAL');
        const isDayRow = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].some(d => rowText.startsWith(d));
        
        if (hasWeek && !hasArrival && !isDayRow) {
            const weekMatch = rowText.match(/(\d+\w*\s*WEEK)/i);
            let label = weekMatch ? 'July ' + weekMatch[1] : rowText;
            for (const s of STUDENTS) {
                label = label.replace(new RegExp(s, 'gi'), '').trim();
            }
            label = label.replace(/\s+/g, ' ').trim();
            i++;
            if (i >= rows.length) break;
            const headerRow = rows[i] || [];
            const dateRange = headerRow[0] || '';
            i++;
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

// === JSONP fallback (Google Visualization API - may be cached up to 5 min) ===
function fetchSheetJSON(sheetName) {
    return new Promise((resolve, reject) => {
        const callbackName = 'sheetCallback_' + sheetName + '_' + Date.now();
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${callbackName}&sheet=${sheetName}&headers=0&_=${Date.now()}`;
        
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
    return parseSheetRows(rows);
}

async function fetchStudentData(studentName) {
    const table = await fetchSheetJSON(studentName);
    const rows = extractRows(table);
    return parseSheetData(rows);
}

async function fetchAllViaJSONP() {
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
    let source = 'none';
    try {
        // Try Apps Script first (instant, no cache)
        if (APPS_SCRIPT_URL) {
            const appsData = await fetchViaAppsScript();
            if (appsData && Object.keys(appsData).length > 0) {
                studentsData = appsData;
                source = 'apps-script';
                console.log('Live data loaded via Apps Script (no cache):', Object.keys(studentsData).join(', '));
            }
        }
        
        // Fallback to JSONP (may be cached ~5 min by Google)
        if (source === 'none') {
            const jsonpData = await fetchAllViaJSONP();
            if (Object.keys(jsonpData).length > 0) {
                studentsData = jsonpData;
                source = 'jsonp';
                console.log('Live data loaded via JSONP (may be cached):', Object.keys(studentsData).join(', '));
            }
        }
    } catch (err) {
        console.warn('Failed to fetch live data:', err.message);
    }

    // Show status badge
    const badge = document.createElement('div');
    badge.style.cssText = 'position:fixed;bottom:12px;left:12px;padding:6px 14px;border-radius:8px;font-size:0.7rem;font-weight:600;z-index:9999;color:#fff;';
    if (source === 'apps-script') {
        badge.style.background = '#059669';
        badge.textContent = '✓ LIVE (instant)';
    } else if (source === 'jsonp') {
        badge.style.background = '#d97706';
        badge.textContent = '⚠ CACHED (~5min delay)';
    } else {
        badge.style.background = '#dc2626';
        badge.textContent = '✗ OFFLINE (fallback data)';
    }
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 6000);

    renderApp();
}
