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
    name: 'FuturON Preschool',
    address: 'Near SBI Bank, Tadipatri Road, Jammalamadugu',
    class: 'UKG CLASS',
    month: 'July 2026'
};

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
