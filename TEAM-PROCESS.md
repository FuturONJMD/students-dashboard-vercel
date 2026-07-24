# FuturON Preschool Dashboard - Team Roles & Development Process

## Project Overview
**Application**: FuturON Preschool Student Daily Updates Dashboard  
**Tech Stack**: HTML5, CSS3, JavaScript (ES6+), Google Apps Script, GitHub Pages  
**Data Source**: Google Sheets (live via Apps Script API)  
**Deployment**: GitHub Pages (auto-deploy on push to master)

---

## Team Roles & Responsibilities

### 1. Senior Architect (SA)

**Responsibility**: System design, technology decisions, scalability planning

| Area | Details |
|------|---------|
| Architecture Design | Defines component separation (config.js, sheets-fetcher.js, ai-engine.js, index.html) |
| Technology Selection | Chose JSONP + Apps Script for CORS bypass, GitHub Pages for hosting |
| Performance | Ensures loading time under 3 seconds, optimizes API calls |
| Security | Validates no sensitive data exposed in client-side code |
| Code Review | Final approval on all architectural changes |

**Technical Knowledge Required**:
- Frontend: HTML5, CSS3, JavaScript ES6+, DOM manipulation, responsive design
- Backend: Google Apps Script, REST APIs, JSONP, CORS handling
- Infrastructure: GitHub Pages, CDN caching, DNS, SSL
- Data: Google Sheets API, JSON parsing, data transformation pipelines

---

### 2. Senior Developer Engineer (SDE)

**Responsibility**: Core implementation, code quality, mentoring junior developers

| Area | Details |
|------|---------|
| Core Logic | Implements data fetching (sheets-fetcher.js), parsing, rendering |
| AI Engine | Builds ai-engine.js (tips, summaries, anomaly detection) |
| Code Standards | Enforces consistent naming, modular functions, error handling |
| Performance Tuning | Optimizes DOM updates, reduces API response parsing time |
| Debugging | Diagnoses production issues (stale data, CORS, caching) |

**Technical Knowledge Required**:
- Frontend: Advanced JavaScript, async/await, Promises, event-driven architecture
- API: Fetch API, JSONP injection, redirect handling, timeout management
- CSS: Flexbox, Grid, animations, responsive breakpoints, print stylesheets
- Tools: Git, Chrome DevTools, network analysis, performance profiling

---

### 3. Feature Development Engineer (FDE)

**Responsibility**: Building new features, UI components, user-facing functionality

| Area | Details |
|------|---------|
| UI Components | KPI cards, daily snapshot table, progress bars, badges |
| New Features | Week switching, student filtering, mobile navigation, PDF export |
| Responsive Design | Mobile-first layouts, touch-friendly interactions |
| Accessibility | Readable text contrast, proper font sizes, semantic HTML |
| Integration | Connects UI to data layer (studentsData → rendered HTML) |

**Technical Knowledge Required**:
- Frontend: HTML5 semantics, CSS Grid/Flexbox, JavaScript DOM manipulation
- Design: Color theory, typography (Inter font), spacing systems, card-based UI
- UX: Loading states, error states, empty states, transitions
- Data Binding: Dynamic HTML generation from JSON data

---

### 4. Business Analyst Engineer (BA)

**Responsibility**: Requirements gathering, data modeling, stakeholder communication

| Area | Details |
|------|---------|
| Requirements | Defines what parents need to see (attendance, meals, water, uniform) |
| Data Mapping | Maps Google Sheet columns → application fields (snacks, arrival_time, etc.) |
| User Stories | "As a parent, I want to see my child's weekly lunch completion %" |
| Acceptance Criteria | Defines what "correct" means for each KPI calculation |
| Stakeholder Communication | Translates teacher needs into technical specs |

**Domain Knowledge Required**:
- Education: Preschool daily reporting standards, parent communication norms
- Data: Google Sheets structure, week/day/student hierarchy
- Analytics: KPI definitions (attendance %, completion %, bottle count formulas)
- Process: School calendar, uniform policies, meal schedules

---

### 5. Data Analyst (DA)

**Responsibility**: Data accuracy, formula validation, insights correctness

| Area | Details |
|------|---------|
| Data Validation | Verifies API response matches Google Sheet content |
| Formula Accuracy | Validates percentage calculations, bottle counts, averages |
| Anomaly Logic | Defines thresholds for anomaly detection (>30% drop = critical) |
| Trend Analysis | Week-over-week comparison logic, cumulative calculations |
| Data Quality | Handles edge cases: N/A values, empty cells, fraction formats ("1/2") |

**Technical Knowledge Required**:
- Data: JSON parsing, array reduction, statistical averages
- Google Sheets: Display values vs raw values, date formats, percentage formats
- Analytics: Moving averages, threshold-based alerting, trend direction
- Validation: Cross-referencing source data with displayed data

---

### 6. QA Engineer (QA)

**Responsibility**: Test case design, manual testing, regression testing

| Area | Details |
|------|---------|
| Test Case Design | Writes test scenarios for each feature and data flow |
| Manual Testing | Verifies UI across browsers (Chrome, Safari, Firefox, mobile) |
| Regression Testing | Ensures new changes don't break existing features |
| Cross-Browser | Tests responsive layout on mobile, tablet, desktop |
| Data Integrity | Verifies displayed data matches Google Sheet source |

**Testing Areas**:
- Functional: Each KPI displays correctly, week switching works, student switching works
- Visual: Colors render correctly, text is readable, images load
- Performance: Page loads within 3 seconds, no console errors
- Mobile: Touch interactions work, layout adapts properly

---

### 7. Senior QA Engineer (SQA)

**Responsibility**: Test strategy, automation planning, quality gates

| Area | Details |
|------|---------|
| Test Strategy | Defines testing pyramid (unit → integration → E2E) |
| Quality Gates | Sets pass/fail criteria before production deployment |
| Edge Case Design | Identifies unusual scenarios (empty weeks, all absences, 0% across board) |
| Performance Benchmarks | Sets KPIs for load time, API response time |
| Release Sign-off | Final approval before pushing to production (master branch) |

**Quality Gates for Production**:
1. All data from Google Sheet renders correctly on the dashboard
2. No JavaScript console errors
3. Page loads under 3 seconds on 4G connection
4. Mobile layout renders correctly (320px - 768px)
5. Print/PDF output is readable with correct data
6. AI insights text matches actual calculated values

---

### 8. Tester (Manual)

**Responsibility**: Execute test cases, report bugs, verify fixes

| Area | Details |
|------|---------|
| Test Execution | Runs all test cases from the test suite |
| Bug Reporting | Documents issues with screenshots, steps to reproduce |
| Fix Verification | Confirms bugs are resolved after developer fix |
| Device Testing | Tests on actual phones (Android, iOS), tablets, laptops |
| User Acceptance | Simulates parent experience opening the URL |

---

## Development & Deployment Process

### Workflow (Feature Lifecycle)

```
BA defines requirement
    → SA approves architecture
        → SDE/FDE implements
            → DA validates data accuracy
                → QA writes test cases
                    → Tester executes tests
                        → SQA signs off
                            → Deploy to production (git push master)
```

### Pre-Deployment Checklist

Before any push to `master` branch (which auto-deploys to GitHub Pages):

| # | Check | Owner | Pass/Fail |
|---|-------|-------|-----------|
| 1 | Data loads from Google Sheet (Apps Script primary) | DA | |
| 2 | All weeks display correctly (2nd, 3rd, 4th) | QA | |
| 3 | All students accessible via sidebar/URL param | QA | |
| 4 | KPI calculations match manual spreadsheet count | DA | |
| 5 | Personalized tips reflect actual data values | DA | |
| 6 | Anomaly detection triggers on correct thresholds | SQA | |
| 7 | Mobile responsive (test 375px, 768px widths) | Tester | |
| 8 | No JavaScript errors in console | QA | |
| 9 | Print/PDF output readable | Tester | |
| 10 | Loading state shows "Welcome to FuturON" | QA | |
| 11 | Error state shows correct message (no tech details) | QA | |
| 12 | New data in Google Sheet reflects within 5 seconds on refresh | DA | |

---

## Test Cases

### TC-001: Data Loading
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open https://futuronjmd.github.io/students-dashboard-vercel/ | "Welcome to FuturON Preschool" splash appears |
| 2 | Wait 3 seconds | Dashboard renders with student data |
| 3 | Check sidebar | Shows all student names and week periods |

### TC-002: Week Switching
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "July 2ND WEEK" in sidebar | Week 2 data displays |
| 2 | Click "July 4TH WEEK" in sidebar | Week 4 data displays |
| 3 | Verify KPI values change | Snack %, Lunch %, Water % update to match week |

### TC-003: Student Switching
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click different student in sidebar | Dashboard updates with that student's data |
| 2 | Verify greeting shows correct name | "Good afternoon, [Name]!" |
| 3 | Verify image or initial displays | Student photo or first letter shown |

### TC-004: Parent URL (Isolated View)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open ?student=VEDANSHI | Only Vedanshi's data shows |
| 2 | Check sidebar | No other student names visible |
| 3 | Check for teacher-only sections | "All Students Progress" and "Teacher Recommendations" NOT shown |

### TC-005: KPI Accuracy
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Week 4 for VEDANSHI | KPI cards display |
| 2 | Manually count present days from daily snapshot | Matches "Days Present" KPI |
| 3 | Manually average snack completion % | Matches "Snack Eaten" KPI |
| 4 | Count bottle refills + days present | Matches "Total Water Bottles" KPI |

### TC-006: Real-Time Data Update
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Edit a cell in Google Sheet (e.g., change Monday snacks to "BANANA") | Change saved |
| 2 | Refresh dashboard page | New value "BANANA" appears in Monday row |
| 3 | Verify AI tips update | Personalized tips reflect new data |

### TC-007: Edge Cases
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | All days absent in a week | Shows "Absent" for all rows, 0% attendance |
| 2 | Percentage = 0% | Progress bar shows empty, badge shows "NEEDS ATTENTION" |
| 3 | Bottle value "1/2" | Displays correctly as 0.5 in calculation |
| 4 | Empty arrival time | Shows "N/A" in arrival column |
| 5 | Uniform = "COLOUR DRESS" | Shows purple "Color Day" badge |
| 6 | Network offline | Shows error message, no technical details exposed |

### TC-008: Mobile Responsiveness
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open on phone (375px width) | Sidebar hidden, mobile dropdown shows |
| 2 | Tap week dropdown | Can switch weeks |
| 3 | Scroll through daily snapshot | Cards stack vertically, readable |
| 4 | Tap "Download PDF" | Print dialog opens |

### TC-009: AI Insights Accuracy
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check Weekly Summary bottle count | Matches manual calculation |
| 2 | Check Personalized Tips percentages | Match KPI card values |
| 3 | Verify anomaly triggers | Only shows when actual >20% week-over-week drop |
| 4 | Teacher recommendations | Show correct priority (urgent/important/celebrate) |

### TC-010: Print/PDF Output
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Download PDF" | Print dialog opens |
| 2 | Check print preview | White background, dark text, no sidebar |
| 3 | Verify all sections present | KPIs, daily snapshot, AI insights all visible |
| 4 | Text readable in print | No white-on-white or invisible elements |

---

## File Responsibility Map

| File | Owner Role | Purpose |
|------|-----------|---------|
| `config.js` | SA / SDE | All configuration constants (change here to update students, URLs) |
| `sheets-fetcher.js` | SDE | Data fetching and parsing (Google Sheets → JS objects) |
| `ai-engine.js` | SDE / DA | Intelligence layer (tips, summaries, anomaly detection) |
| `index.html` | FDE | UI rendering, styling, user interactions |
| `images/` | FDE | Student photos and school logo |

---

## Communication Protocol

| From | To | When | Channel |
|------|-----|------|---------|
| BA | SA | New feature request | Requirements document |
| SA | SDE/FDE | Architecture decision | Code review / design doc |
| SDE | QA | Feature ready for testing | Git push + notification |
| QA | SDE | Bug found | Bug report with screenshot + steps |
| SQA | All | Release readiness | Pre-deployment checklist sign-off |
| DA | QA | Data validation complete | Test data verification report |

---

## Version Control Rules

1. **master branch** = production (auto-deploys to GitHub Pages)
2. Never push directly to master without completing the pre-deployment checklist
3. All changes must pass QA verification before merge
4. Keep commit messages descriptive: "Fix KPI calculation for bottle count"
5. One feature per commit — don't bundle unrelated changes
