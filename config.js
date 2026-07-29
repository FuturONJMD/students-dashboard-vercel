// ============================================
// FuturON Preschool - Configuration
// ============================================

// Google Sheets data source
const SHEET_ID = '1s8hz-qQEOk2UhGe2UAOx5MjVs-sSFs0s99vsgeXPyM0';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxLmJQA7DDGayA24sASh8dzIDu8aTr9tLgtBhQKcP5RHpaxWdngJ432upX5ndnDiVq8cQ/exec';

// Student names (must match Google Sheet tab names exactly)
const STUDENTS = ['VEDANSHI', 'HEMANVITH', 'BHAVYESH', 'ISRA', 'AYRA', 'AARUSH', 'PARNIK'];

// School information
const SCHOOL = {
    name: 'FuturON Preschool Jammalamadugu',
    address: 'Near SBI Bank, Tadipatri Road, Jammalamadugu Town, Kadapa District, Andhra Pradesh - 516434',
    class: 'UKG CLASS',
    month: 'July 2026'
};

// WHO/IOM Health Standards - Daily Water Intake by Age Group
// Reference: WHO/IOM (Institute of Medicine) Dietary Reference Intakes
// School hours: 9:00 AM to 3:30 PM (6.5 hours = ~50% of waking hours)
// Children are awake ~13 hours/day, school accounts for 50% of hydration needs
const WHO_WATER_STANDARDS = {
    PLAYGROUP: { ageRange: '2-3 years', dailyLitres: 1.3, schoolLitres: 0.65, schoolBottles: 1.5, schoolHours: '9:00 AM - 3:30 PM', description: 'WHO/IOM recommends ~1.3L/day for ages 2-3. School target (50% of daily): ~650ml (approx. 1.5 bottles of 450ml)' },
    NURSERY:   { ageRange: '3-4 years', dailyLitres: 1.7, schoolLitres: 0.85, schoolBottles: 2,   schoolHours: '9:00 AM - 3:30 PM', description: 'WHO/IOM recommends ~1.7L/day for ages 3-4. School target (50% of daily): ~850ml (approx. 2 bottles of 450ml)' },
    LKG:       { ageRange: '4-5 years', dailyLitres: 1.7, schoolLitres: 0.85, schoolBottles: 2,   schoolHours: '9:00 AM - 3:30 PM', description: 'WHO/IOM recommends ~1.7L/day for ages 4-5. School target (50% of daily): ~850ml (approx. 2 bottles of 450ml)' },
    UKG:       { ageRange: '5-6 years', dailyLitres: 1.7, schoolLitres: 0.85, schoolBottles: 2,   schoolHours: '9:00 AM - 3:30 PM', description: 'WHO/IOM recommends ~1.7L/day for ages 5-6. School target (50% of daily): ~850ml (approx. 2 bottles of 450ml)' }
};

// Current class for this dashboard
const CURRENT_CLASS = 'UKG';

// School schedule
// Saturday = half-day (snacks + water only, no lunch)
// 2nd and 4th Saturdays = holidays (school closed)
// Public holidays = school closed
// Only days with actual data in Google Sheet are counted in calculations

// Parent contact information
const PARENT_INFO = {
    VEDANSHI: { parent: 'Parent of Vedanshi', phone: '', relation: 'Parent' },
    HEMANVITH: { parent: 'Parent of Hemanvith', phone: '', relation: 'Parent' },
    BHAVYESH: { parent: 'Parent of Bhavyesh', phone: '', relation: 'Parent' },
    ISRA: { parent: 'Parent of Isra', phone: '', relation: 'Parent' },
    AYRA: { parent: 'Parent of Ayra', phone: '', relation: 'Parent' },
    AARUSH: { parent: 'Parent of Aarush', phone: '', relation: 'Parent' },
    PARNIK: { parent: 'Parent of Parnik', phone: '', relation: 'Parent' }
};

// App state
let studentsData = {};
