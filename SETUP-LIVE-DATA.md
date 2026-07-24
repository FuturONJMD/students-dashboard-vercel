# Setup Live Data (Fix Stale Data Issue)

The Google Visualization API caches data for ~5 minutes. To get instant updates,
deploy this Google Apps Script as a web app.

## Steps (2 minutes):

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1s8hz-qQEOk2UhGe2UAOx5MjVs-sSFs0s99vsgeXPyM0/

2. Go to **Extensions > Apps Script**

3. Delete any existing code in the editor and paste this entire script:

```javascript
function doGet(e) {
  var ss = SpreadsheetApp.openById('1s8hz-qQEOk2UhGe2UAOx5MjVs-sSFs0s99vsgeXPyM0');
  var sheetName = e.parameter.sheet || 'VEDANSHI';
  
  // If requesting all students
  if (sheetName === 'ALL') {
    var students = ['VEDANSHI', 'HEMANVITH', 'BHAVYESH', 'ISRA', 'AYRA', 'AARUSH', 'PARNIK'];
    var result = {};
    for (var i = 0; i < students.length; i++) {
      var sheet = ss.getSheetByName(students[i]);
      if (sheet) {
        result[students[i]] = getSheetData(sheet);
      }
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Single student
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({error: 'Sheet not found: ' + sheetName}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = getSheetData(sheet);
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheet) {
  var range = sheet.getDataRange();
  var values = range.getDisplayValues(); // Gets formatted values (percentages, times, etc.)
  return values;
}
```

4. Click **Deploy > New deployment**

5. Settings:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**

6. Click **Deploy** and **Authorize access** (approve any permission prompts)

7. Copy the **Web app URL** (looks like: `https://script.google.com/macros/s/AKfyc.../exec`)

8. Open `sheets-fetcher.js` and replace the `APPS_SCRIPT_URL` value on line 3 with your URL.

9. Push to GitHub and Vercel will auto-deploy.

## How it works:
- Parents refresh the page -> Frontend calls YOUR Apps Script -> Script reads the LIVE spreadsheet -> Returns fresh data instantly
- No caching, no delays, no credits consumed
- Works from any browser (CORS is handled by Google Apps Script automatically)
