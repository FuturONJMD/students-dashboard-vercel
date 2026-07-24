// ============================================
// AI Intelligence Engine - FuturON Preschool
// Pattern Recognition, Trend Analysis, Contextual Insights
// ============================================

const AIEngine = {

    // === HELPERS ===
    getActive(weekData) {
        const allDays = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
        const days = allDays.map(dayName => {
            const found = weekData.days.find(d => d.day === dayName);
            return found || { day: dayName, arrival_time: 'N/A', snacks: 'N/A', snack_completion: 0, lunch: 'N/A', lunch_completion: 0, interested_in: 'N/A', water_completion: 0, bottle_refill: 0, uniform: 'N/A' };
        });
        return days.filter(d => !((d.snacks === 'N/A' && d.lunch === 'N/A') || (d.snack_completion === 0 && d.lunch_completion === 0 && d.water_completion === 0)));
    },

    pct(val) { return Math.min(Math.round(val * 100), 100); },

    avg(activeDays, metric) {
        if (!activeDays.length) return 0;
        return activeDays.reduce((s, d) => s + this.pct(d[metric]), 0) / activeDays.length;
    },

    // === PATTERN RECOGNITION ===
    detectFoodPreferences(studentName) {
        const weeks = studentsData[studentName];
        const snackCounts = {};
        const lunchCounts = {};
        const highCompletionSnacks = {};
        const lowCompletionSnacks = {};

        weeks.forEach(w => {
            this.getActive(w).forEach(d => {
                const snack = (d.snacks || '').toUpperCase().trim();
                const lunch = (d.lunch || '').toUpperCase().trim();
                if (snack && snack !== 'N/A') {
                    snackCounts[snack] = (snackCounts[snack] || 0) + 1;
                    if (this.pct(d.snack_completion) >= 90) highCompletionSnacks[snack] = (highCompletionSnacks[snack] || 0) + 1;
                    if (this.pct(d.snack_completion) < 50) lowCompletionSnacks[snack] = (lowCompletionSnacks[snack] || 0) + 1;
                }
                if (lunch && lunch !== 'N/A') lunchCounts[lunch] = (lunchCounts[lunch] || 0) + 1;
            });
        });

        const topSnacks = Object.entries(highCompletionSnacks).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
        const avoidSnacks = Object.entries(lowCompletionSnacks).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
        const mostFrequentSnack = Object.entries(snackCounts).sort((a, b) => b[1] - a[1])[0];

        return { topSnacks, avoidSnacks, mostFrequentSnack: mostFrequentSnack ? mostFrequentSnack[0] : null, snackCounts, lunchCounts };
    },

    // === CONSISTENCY SCORING (0-100) ===
    calculateConsistencyScore(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        if (!active.length) return { score: 0, grade: 'N/A', factors: [] };

        const factors = [];
        let score = 0;

        // Attendance consistency (max 25 points)
        const attendancePct = (active.length / 6) * 100;
        const attendanceScore = Math.min(25, Math.round(attendancePct / 4));
        score += attendanceScore;
        factors.push({ label: 'Attendance', value: attendanceScore, max: 25 });

        // Meal consistency (max 25 points) - low variance = high consistency
        const snackValues = active.map(d => this.pct(d.snack_completion));
        const lunchValues = active.map(d => this.pct(d.lunch_completion));
        const snackVariance = this.variance(snackValues);
        const lunchVariance = this.variance(lunchValues);
        const mealConsistency = Math.max(0, 25 - Math.round((snackVariance + lunchVariance) / 80));
        score += mealConsistency;
        factors.push({ label: 'Meal Regularity', value: mealConsistency, max: 25 });

        // Hydration consistency (max 25 points)
        const waterValues = active.map(d => this.pct(d.water_completion));
        const waterAvg = waterValues.reduce((s, v) => s + v, 0) / waterValues.length;
        const hydrationScore = Math.min(25, Math.round(waterAvg / 4));
        score += hydrationScore;
        factors.push({ label: 'Hydration', value: hydrationScore, max: 25 });

        // Punctuality (max 25 points) - based on arrival times
        const arrivalMinutes = active.map(d => this.parseTimeToMinutes(d.arrival_time)).filter(m => m > 0);
        let punctualityScore = 25;
        if (arrivalMinutes.length) {
            const lateArrivals = arrivalMinutes.filter(m => m > 570); // After 9:30 AM
            punctualityScore = Math.max(0, 25 - (lateArrivals.length * 5));
        }
        score += punctualityScore;
        factors.push({ label: 'Punctuality', value: punctualityScore, max: 25 });

        const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C' : 'D';
        return { score, grade, factors };
    },

    variance(arr) {
        if (!arr.length) return 0;
        const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
        return arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length;
    },

    parseTimeToMinutes(timeStr) {
        if (!timeStr || timeStr === 'N/A') return 0;
        const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
        if (!match) return 0;
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        if (timeStr.includes('PM') && h < 12) h += 12;
        return h * 60 + m;
    },

    // === TREND FORECASTING ===
    forecastNextWeek(studentName) {
        const weeks = studentsData[studentName];
        if (weeks.length < 2) return null;

        const metrics = ['snack_completion', 'lunch_completion', 'water_completion'];
        const forecast = {};

        metrics.forEach(metric => {
            const values = weeks.map(w => {
                const active = this.getActive(w);
                return active.length ? Math.round(this.avg(active, metric)) : null;
            }).filter(v => v !== null);

            if (values.length < 2) { forecast[metric] = { predicted: values[0] || 0, direction: 'stable', confidence: 'low' }; return; }

            // Simple linear regression for trend
            const n = values.length;
            const xMean = (n - 1) / 2;
            const yMean = values.reduce((s, v) => s + v, 0) / n;
            let num = 0, den = 0;
            values.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) * (x - xMean); });
            const slope = den ? num / den : 0;
            const predicted = Math.max(0, Math.min(100, Math.round(yMean + slope * (n - xMean))));

            const direction = slope > 3 ? 'improving' : slope < -3 ? 'declining' : 'stable';
            const confidence = n >= 3 ? 'high' : 'medium';
            forecast[metric] = { predicted, direction, confidence, slope: Math.round(slope * 10) / 10 };
        });

        // Attendance forecast
        const attendanceValues = weeks.map(w => this.getActive(w).length);
        const avgAttendance = attendanceValues.reduce((s, v) => s + v, 0) / attendanceValues.length;
        forecast.attendance = { predicted: Math.round(avgAttendance), direction: 'stable', confidence: 'medium' };

        return forecast;
    },

    // === ARRIVAL TIME ANALYSIS ===
    analyzeArrivalPattern(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        const times = active.map(d => this.parseTimeToMinutes(d.arrival_time)).filter(m => m > 0);

        if (!times.length) return null;

        const avgTime = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
        const earliestTime = Math.min(...times);
        const latestTime = Math.max(...times);
        const lateCount = times.filter(t => t > 570).length; // After 9:30

        const formatTime = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
            return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
        };

        return {
            average: formatTime(avgTime),
            earliest: formatTime(earliestTime),
            latest: formatTime(latestTime),
            lateCount,
            onTimePercentage: Math.round(((times.length - lateCount) / times.length) * 100)
        };
    },

    // ============================
    // 1. PERSONALIZED TIPS (Enhanced)
    // ============================
    generateTips(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        const tips = [];
        const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();

        if (!active.length) {
            tips.push({ icon: '⚠️', text: `${name} was not present this week. Regular attendance helps children feel connected and build routines.`, severity: 'critical' });
            return tips;
        }

        const snackAvg = Math.round(this.avg(active, 'snack_completion'));
        const lunchAvg = Math.round(this.avg(active, 'lunch_completion'));
        const waterAvg = Math.round(this.avg(active, 'water_completion'));
        const attendance = active.length;
        const absentDays = 6 - attendance;
        const bottleRefills = active.reduce((s, d) => s + d.bottle_refill, 0);
        const weekBottles = bottleRefills + attendance;

        // Monthly cumulative
        let monthlyBottles = 0, monthlyDaysPresent = 0;
        for (let w = 0; w <= weekIdx; w++) {
            const wActive = this.getActive(weeks[w]);
            monthlyBottles += wActive.reduce((s, d) => s + d.bottle_refill, 0) + wActive.length;
            monthlyDaysPresent += wActive.length;
        }

        // Consistency score insight
        const consistency = this.calculateConsistencyScore(studentName, weekIdx);
        tips.push({ icon: '📊', text: `${name}'s weekly consistency score: ${consistency.score}/100 (Grade: ${consistency.grade}). ${consistency.score >= 80 ? 'Excellent routine!' : consistency.score >= 60 ? 'Good routine with room for improvement.' : 'Small routine changes at home can make a big difference.'}`, severity: consistency.score >= 80 ? 'positive' : consistency.score >= 60 ? 'info' : 'warning' });

        // Snack tips
        if (snackAvg >= 90) tips.push({ icon: '⭐', text: `${name} is eating snacks very well (${snackAvg}%). Keep sending the same type of snacks!`, severity: 'positive' });
        else if (snackAvg >= 70) tips.push({ icon: '🍎', text: `${name} eats ${snackAvg}% of snacks. Try adding their favourite fruits to improve further.`, severity: 'info' });
        else if (snackAvg >= 50) tips.push({ icon: '🍎', text: `${name} only finishes ${snackAvg}% of snacks. Consider smaller portions or different items.`, severity: 'warning' });
        else tips.push({ icon: '🍎', text: `${name} is eating very less snacks (${snackAvg}%). Please try favourite foods or check if portion is too large.`, severity: 'critical' });

        // Lunch tips
        if (lunchAvg >= 90) tips.push({ icon: '⭐', text: `${name} is finishing lunch very well (${lunchAvg}%). Great appetite at school!`, severity: 'positive' });
        else if (lunchAvg >= 70) tips.push({ icon: '🍽️', text: `${name} eats ${lunchAvg}% of lunch. Good, but can improve with preferred menu items.`, severity: 'info' });
        else if (lunchAvg >= 50) tips.push({ icon: '🍽️', text: `${name} only finishes ${lunchAvg}% of lunch. Try sending lighter or favourite meals.`, severity: 'warning' });
        else tips.push({ icon: '🍽️', text: `${name} is eating very less lunch (${lunchAvg}%). You might want to try different meal options or smaller portions.`, severity: 'critical' });

        // Water tips with monthly context
        if (waterAvg >= 90) tips.push({ icon: '💧', text: `${name} drinks water very well (${waterAvg}%). This week: ${Math.round(weekBottles)} bottles. Monthly total: ${Math.round(monthlyBottles)} bottles across ${monthlyDaysPresent} days. Keep it up!`, severity: 'positive' });
        else if (waterAvg >= 70) tips.push({ icon: '💧', text: `${name} drinks ${waterAvg}% of required water. This week: ${Math.round(weekBottles)} bottles (monthly: ${Math.round(monthlyBottles)}). Remind to drink more often.`, severity: 'info' });
        else if (waterAvg >= 50) tips.push({ icon: '💧', text: `${name} water intake is moderate (${waterAvg}%). This week: ${Math.round(weekBottles)} bottles. Send a bigger bottle or add flavoured water.`, severity: 'warning' });
        else tips.push({ icon: '💧', text: `${name} is not drinking enough water (${waterAvg}%). Only ${Math.round(weekBottles)} bottles this week. Encouraging water breaks at home can help build the habit.`, severity: 'critical' });

        // Attendance
        if (attendance === 6) tips.push({ icon: '🏆', text: `Perfect attendance! ${name} came all 6 days. Consistency builds great habits.`, severity: 'positive' });
        else if (absentDays === 1) tips.push({ icon: '📅', text: `${name} missed 1 day this week. ${attendance} out of 6 days present.`, severity: 'info' });
        else if (absentDays >= 2) tips.push({ icon: '📅', text: `${name} was away for ${absentDays} days this week. Consistent attendance helps them stay in rhythm with friends and activities.`, severity: 'warning' });

        // Arrival time insight
        const arrivalPattern = this.analyzeArrivalPattern(studentName, weekIdx);
        if (arrivalPattern) {
            if (arrivalPattern.onTimePercentage === 100) {
                tips.push({ icon: '⏰', text: `${name} arrived on time every day (average: ${arrivalPattern.average}). Excellent punctuality!`, severity: 'positive' });
            } else if (arrivalPattern.lateCount >= 2) {
                tips.push({ icon: '⏰', text: `${name} arrived late ${arrivalPattern.lateCount} times this week (latest: ${arrivalPattern.latest}). Aim for arrival before 9:30 AM.`, severity: 'warning' });
            }
        }

        // Food preference insight (only if multiple weeks available)
        if (weekIdx >= 1) {
            const prefs = this.detectFoodPreferences(studentName);
            if (prefs.topSnacks.length > 0) {
                tips.push({ icon: '🧠', text: `Pattern detected: ${name} eats best when given ${prefs.topSnacks.slice(0, 2).join(' or ')}. Consider sending these more often.`, severity: 'info' });
            }
        }



        // Uniform compliance
        const nonUniformDays = active.filter(d => d.uniform === 'NO').length;
        if (nonUniformDays > 0) {
            tips.push({ icon: '👕', text: `${name} missed uniform on ${nonUniformDays} day(s). Please check the school calendar for uniform/colour dress days.`, severity: 'warning' });
        }

        return tips;
    },

    // ============================
    // 2. WEEKLY SUMMARY (Enhanced)
    // ============================
    generateWeeklySummary(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();

        if (!active.length) {
            return `${name} was not present during ${currentWeek.label}. No activity data is available for this week. Once ${name} returns, daily updates will resume here.`;
        }

        const snackAvg = Math.round(this.avg(active, 'snack_completion'));
        const lunchAvg = Math.round(this.avg(active, 'lunch_completion'));
        const waterAvg = Math.round(this.avg(active, 'water_completion'));
        const overall = Math.round((snackAvg + lunchAvg + waterAvg) / 3);
        const attendance = active.length;
        const bottleRefills = active.reduce((s, d) => s + d.bottle_refill, 0);
        const weekBottles = bottleRefills + attendance;

        // Monthly cumulative
        let monthlyBottles = 0, monthlyDaysPresent = 0;
        for (let w = 0; w <= weekIdx; w++) {
            const wActive = this.getActive(weeks[w]);
            monthlyBottles += wActive.reduce((s, d) => s + d.bottle_refill, 0) + wActive.length;
            monthlyDaysPresent += wActive.length;
        }

        // Consistency score
        const consistency = this.calculateConsistencyScore(studentName, weekIdx);

        let summary = `${name} attended ${attendance} out of 6 days during ${currentWeek.label}. `;

        if (overall >= 90) summary += `Your child did excellent this week with ${overall}% overall performance. `;
        else if (overall >= 70) summary += `Your child did well this week with ${overall}% overall performance. `;
        else if (overall >= 50) summary += `Performance was moderate at ${overall}% — there is room for improvement. `;
        else summary += `Performance needs attention with only ${overall}% average. Focusing on the areas mentioned below can help improve. `;

        // Consistency grade
        summary += `Consistency Grade: ${consistency.grade} (${consistency.score}/100). `;

        // Strengths
        const strengths = [];
        if (snackAvg >= 90) strengths.push('snack eating');
        if (lunchAvg >= 90) strengths.push('lunch eating');
        if (waterAvg >= 90) strengths.push('water drinking');
        if (strengths.length) summary += `Doing great in: ${strengths.join(', ')}. `;

        // Areas needing work
        const improvements = [];
        if (snackAvg < 60) improvements.push(`snacks (${snackAvg}%)`);
        if (lunchAvg < 60) improvements.push(`lunch (${lunchAvg}%)`);
        if (waterAvg < 60) improvements.push(`water (${waterAvg}%)`);
        if (improvements.length) summary += `Needs improvement in: ${improvements.join(', ')}. `;

        summary += `This week water bottles: ${Math.round(weekBottles)} (${attendance} from home + ${Math.round(bottleRefills)} refilled). Monthly total: ${Math.round(monthlyBottles)} bottles across ${monthlyDaysPresent} school days. `;

        // Trend comparison
        if (weekIdx > 0) {
            const prevActive = this.getActive(weeks[weekIdx - 1]);
            if (prevActive.length) {
                const prevOverall = Math.round((this.avg(prevActive, 'snack_completion') + this.avg(prevActive, 'lunch_completion') + this.avg(prevActive, 'water_completion')) / 3);
                if (overall > prevOverall + 5) summary += `This is an improvement of ${overall - prevOverall}% from the previous week!`;
                else if (prevOverall > overall + 5) summary += `This is a ${prevOverall - overall}% decline from the previous week. The areas flagged below can help focus improvement.`;
                else summary += `Performance is consistent with the previous week.`;
            }
        }

        return summary;
    },

    // ============================
    // 3. ANOMALY DETECTION (Enhanced)
    // ============================
    detectAnomalies(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        const anomalies = [];
        const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();
        const allDays = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].map(dayName => {
            const found = currentWeek.days.find(d => d.day === dayName);
            return found || { day: dayName, arrival_time: 'N/A', snacks: 'N/A', snack_completion: 0, lunch: 'N/A', lunch_completion: 0, water_completion: 0 };
        });

        // Consecutive absent days
        let consecutiveAbsent = 0, maxConsecutive = 0;
        allDays.forEach(d => {
            const absent = (d.snacks === 'N/A' && d.lunch === 'N/A') || (d.snack_completion === 0 && d.lunch_completion === 0 && d.water_completion === 0);
            if (absent) { consecutiveAbsent++; maxConsecutive = Math.max(maxConsecutive, consecutiveAbsent); }
            else { consecutiveAbsent = 0; }
        });

        if (maxConsecutive >= 3) anomalies.push({ severity: 'critical', icon: '🔴', text: `${name} was away for ${maxConsecutive} consecutive days this week.`, type: 'attendance' });
        else if (maxConsecutive === 2) anomalies.push({ severity: 'warning', icon: '🟡', text: `${name} was away for 2 days in a row. Consistent attendance helps them stay engaged.`, type: 'attendance' });

        if (!active.length) return anomalies;

        // Sudden daily drops (present but 0%)
        active.forEach(d => {
            if (this.pct(d.snack_completion) === 0 && d.snacks !== 'N/A') anomalies.push({ severity: 'warning', icon: '🟡', text: `${d.day}: ${name} didn't eat any snack even though it was provided. They may not have been in the mood for it.`, type: 'metric' });
            if (this.pct(d.lunch_completion) === 0 && d.lunch !== 'N/A') anomalies.push({ severity: 'warning', icon: '🟡', text: `${d.day}: ${name} didn't eat lunch. Their preferences may be changing — trying different options could help.`, type: 'metric' });
            if (this.pct(d.water_completion) === 0) anomalies.push({ severity: 'critical', icon: '🔴', text: `${d.day}: ${name} didn't drink any water. Encouraging water breaks at home can help build this habit.`, type: 'health' });
        });

        // Late arrival pattern
        const arrivalPattern = this.analyzeArrivalPattern(studentName, weekIdx);
        if (arrivalPattern && arrivalPattern.lateCount >= 3) {
            anomalies.push({ severity: 'warning', icon: '🟠', text: `Late arrival pattern: ${arrivalPattern.lateCount} out of ${active.length} days arrived after 9:30 AM. Average arrival: ${arrivalPattern.average}.`, type: 'punctuality' });
        }

        // Week-over-week drops
        if (weekIdx > 0) {
            const prevActive = this.getActive(weeks[weekIdx - 1]);
            if (prevActive.length && active.length) {
                const metrics = ['snack_completion', 'lunch_completion', 'water_completion'];
                const labels = ['Snack', 'Lunch', 'Water'];
                metrics.forEach((m, i) => {
                    const curr = this.avg(active, m);
                    const prev = this.avg(prevActive, m);
                    if (prev - curr > 30) anomalies.push({ severity: 'critical', icon: '🔴', text: `${labels[i]} went down significantly — ${Math.round(prev - curr)}% lower than last week (${Math.round(prev)}% → ${Math.round(curr)}%).`, type: 'trend' });
                    else if (prev - curr > 20) anomalies.push({ severity: 'warning', icon: '🟡', text: `${labels[i]} completion dropped ${Math.round(prev - curr)}% from last week.`, type: 'trend' });
                });

                const prevAttendance = prevActive.length;
                if (prevAttendance - active.length >= 2) anomalies.push({ severity: 'warning', icon: '🟡', text: `Attendance dropped by ${prevAttendance - active.length} days compared to last week.`, type: 'attendance' });
            }
        }

        // Low streak detection (3+ days below 50%)
        const checkStreak = (metric, label) => {
            let lowStreak = 0;
            active.forEach(d => { if (this.pct(d[metric]) < 50 && this.pct(d[metric]) > 0) lowStreak++; });
            if (lowStreak >= 3) anomalies.push({ severity: 'warning', icon: '🟠', text: `${label} has been below 50% for ${lowStreak} days this week — this might be worth looking into.`, type: 'pattern' });
        };
        checkStreak('snack_completion', 'Snacks');
        checkStreak('lunch_completion', 'Lunch');
        checkStreak('water_completion', 'Water');

        // Variance anomaly (wildly inconsistent within the week)
        const snackValues = active.map(d => this.pct(d.snack_completion));
        if (snackValues.length >= 3 && this.variance(snackValues) > 1500) {
            anomalies.push({ severity: 'info', icon: '📊', text: `Snack eating varied a lot this week (from ${Math.min(...snackValues)}% to ${Math.max(...snackValues)}%). Some days were much better than others.`, type: 'pattern' });
        }

        return anomalies;
    },

    // ============================
    // 4. TEACHER RECOMMENDATIONS (Enhanced)
    // ============================
    generateRecommendations(weekIdx) {
        const recs = [];
        const weekLabel = studentsData[Object.keys(studentsData)[0]][weekIdx]?.label;

        Object.keys(studentsData).forEach(studentName => {
            const weeks = studentsData[studentName];
            const week = weeks.find(w => w.label === weekLabel);
            if (!week) return;
            const active = this.getActive(week);
            const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();

            if (active.length === 0) {
                recs.push({ priority: 'urgent', icon: '🚨', text: `${name} was absent the entire week. Contact family immediately.`, student: studentName });
                return;
            }
            if (active.length <= 2) {
                recs.push({ priority: 'urgent', icon: '⚠️', text: `${name} attended only ${active.length}/6 days. Follow up on absences.`, student: studentName });
            }

            const snackAvg = this.avg(active, 'snack_completion');
            const lunchAvg = this.avg(active, 'lunch_completion');
            const waterAvg = this.avg(active, 'water_completion');
            const overall = (snackAvg + lunchAvg + waterAvg) / 3;

            if (waterAvg < 50) recs.push({ priority: 'urgent', icon: '💧', text: `${name}: Water intake critically low (${Math.round(waterAvg)}%). Ensure frequent water reminders.`, student: studentName });
            else if (waterAvg < 70) recs.push({ priority: 'important', icon: '💧', text: `${name}: Water intake below target (${Math.round(waterAvg)}%). Encourage more hydration.`, student: studentName });

            if (lunchAvg < 50) recs.push({ priority: 'urgent', icon: '🍽️', text: `${name}: Lunch completion very low (${Math.round(lunchAvg)}%). Check food preferences or portion size.`, student: studentName });
            else if (lunchAvg < 70) recs.push({ priority: 'important', icon: '🍽️', text: `${name}: Lunch completion needs attention (${Math.round(lunchAvg)}%).`, student: studentName });

            if (snackAvg < 50) recs.push({ priority: 'important', icon: '🍎', text: `${name}: Snack completion low (${Math.round(snackAvg)}%). Offer favourite fruits or alternatives.`, student: studentName });

            // Consistency-based recommendation
            const consistency = this.calculateConsistencyScore(studentName, weekIdx);
            if (consistency.score < 50) {
                recs.push({ priority: 'important', icon: '📊', text: `${name}: Low consistency score (${consistency.score}/100). Needs structured routine support.`, student: studentName });
            }

            // Celebrations
            if (overall >= 95) recs.push({ priority: 'celebrate', icon: '🏆', text: `${name} achieved ${Math.round(overall)}% overall — outstanding! Acknowledge in class.`, student: studentName });
            else if (overall >= 85 && active.length >= 5) recs.push({ priority: 'celebrate', icon: '⭐', text: `${name}: Great attendance with ${Math.round(overall)}% completion. Consistency star!`, student: studentName });

            // Week-over-week decline
            if (weekIdx > 0) {
                const prevWeek = weeks[weekIdx - 1];
                if (prevWeek) {
                    const prevActive = this.getActive(prevWeek);
                    if (prevActive.length) {
                        const prevOverall = (this.avg(prevActive, 'snack_completion') + this.avg(prevActive, 'lunch_completion') + this.avg(prevActive, 'water_completion')) / 3;
                        if (prevOverall - overall > 25) recs.push({ priority: 'important', icon: '📉', text: `${name}: Performance dropped ${Math.round(prevOverall - overall)}% from last week. Check if everything is okay.`, student: studentName });
                    }
                }
            }
        });

        const priority = { urgent: 0, important: 1, celebrate: 2 };
        recs.sort((a, b) => priority[a.priority] - priority[b.priority]);
        return recs;
    }
};
