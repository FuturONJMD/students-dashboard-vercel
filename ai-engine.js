// AI Insights Engine for FuturON Preschool Dashboard
const AIEngine = {

    // Helper: get active days for a student in a given week
    getActive(weekData) {
        const days = weekData.days.filter(d => d.day !== 'SATURDAY' || d.snacks !== 'N/A');
        return days.filter(d => !((d.snacks === 'N/A' && d.lunch === 'N/A') || (d.snack_completion === 0 && d.lunch_completion === 0 && d.water_completion === 0)));
    },

    // Helper: cap percentage at 100
    pct(val) { return Math.min(Math.round(val * 100), 100); },

    // Helper: average of a metric across active days
    avg(activeDays, metric) {
        if (!activeDays.length) return 0;
        return activeDays.reduce((s, d) => s + this.pct(d[metric]), 0) / activeDays.length;
    },

    // ============================
    // 1. PERSONALIZED TIPS
    // ============================
    generateTips(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        const tips = [];

        if (!active.length) {
            tips.push({ icon: '⚠️', text: `${studentName} was absent the entire week. Please check with the family.`, severity: 'critical' });
            return tips;
        }

        const snackAvg = this.avg(active, 'snack_completion');
        const lunchAvg = this.avg(active, 'lunch_completion');
        const waterAvg = this.avg(active, 'water_completion');
        const attendance = active.length;
        const totalDays = currentWeek.days.filter(d => d.day !== 'SATURDAY').length;

        // Compare with previous week if available
        if (weekIdx > 0) {
            const prevActive = this.getActive(weeks[weekIdx - 1]);
            if (prevActive.length) {
                const prevSnack = this.avg(prevActive, 'snack_completion');
                const prevLunch = this.avg(prevActive, 'lunch_completion');
                const prevWater = this.avg(prevActive, 'water_completion');

                if (snackAvg - prevSnack >= 15) tips.push({ icon: '🎉', text: `Snack completion improved by ${Math.round(snackAvg - prevSnack)}% from last week! Great progress.`, severity: 'positive' });
                if (prevSnack - snackAvg >= 20) tips.push({ icon: '📉', text: `Snack completion dropped ${Math.round(prevSnack - snackAvg)}% from last week. Consider offering preferred foods.`, severity: 'warning' });
                if (lunchAvg - prevLunch >= 15) tips.push({ icon: '🎉', text: `Lunch completion improved by ${Math.round(lunchAvg - prevLunch)}% — keep encouraging!`, severity: 'positive' });
                if (prevLunch - lunchAvg >= 20) tips.push({ icon: '📉', text: `Lunch completion declined ${Math.round(prevLunch - lunchAvg)}%. May need smaller portions or different menu items.`, severity: 'warning' });
                if (waterAvg - prevWater >= 15) tips.push({ icon: '💧', text: `Water intake improved by ${Math.round(waterAvg - prevWater)}% this week!`, severity: 'positive' });
                if (prevWater - waterAvg >= 20) tips.push({ icon: '💧', text: `Water intake dropped ${Math.round(prevWater - waterAvg)}%. Remind to drink more frequently.`, severity: 'warning' });
            }
        }

        // Current week tips
        if (snackAvg >= 95) tips.push({ icon: '⭐', text: 'Excellent snack completion — consistently finishing all snacks!', severity: 'positive' });
        else if (snackAvg < 50) tips.push({ icon: '🍎', text: `Snack completion is low (${Math.round(snackAvg)}%). Try introducing favourite fruits or variety.`, severity: 'warning' });

        if (lunchAvg >= 95) tips.push({ icon: '⭐', text: 'Perfect lunch completion — eating well every day!', severity: 'positive' });
        else if (lunchAvg < 60) tips.push({ icon: '🍽️', text: `Lunch completion needs attention (${Math.round(lunchAvg)}%). Consider smaller portions.`, severity: 'warning' });

        if (waterAvg >= 95) tips.push({ icon: '💧', text: 'Great hydration — drinking enough water throughout the day!', severity: 'positive' });
        else if (waterAvg < 50) tips.push({ icon: '💧', text: `Water intake is low (${Math.round(waterAvg)}%). Set reminders for regular water breaks.`, severity: 'critical' });

        if (attendance < totalDays - 1) tips.push({ icon: '📅', text: `Attended ${attendance}/${totalDays} days this week. Regular attendance helps build routine.`, severity: 'warning' });
        if (attendance === totalDays) tips.push({ icon: '🏆', text: 'Perfect attendance this week! Consistency builds great habits.', severity: 'positive' });

        // Check for uniform compliance
        const uniformDays = active.filter(d => d.uniform === 'YES').length;
        const uniformRequired = active.filter(d => d.uniform !== 'N/A').length;
        if (uniformRequired > 0 && uniformDays < uniformRequired * 0.5) {
            tips.push({ icon: '👕', text: 'Uniform compliance needs improvement. Please ensure proper uniform on school days.', severity: 'warning' });
        }

        return tips.length ? tips : [{ icon: '✅', text: 'Doing well overall! Keep up the good work.', severity: 'positive' }];
    },

    // ============================
    // 2. WEEKLY SUMMARY
    // ============================
    generateWeeklySummary(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const allDays = currentWeek.days.filter(d => d.day !== 'SATURDAY');
        const active = this.getActive(currentWeek);
        const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();

        if (!active.length) {
            return `${name} was absent for the entire week (${currentWeek.label}). No performance data is available. We recommend checking in with the family to ensure everything is okay.`;
        }

        const snackAvg = Math.round(this.avg(active, 'snack_completion'));
        const lunchAvg = Math.round(this.avg(active, 'lunch_completion'));
        const waterAvg = Math.round(this.avg(active, 'water_completion'));
        const overall = Math.round((snackAvg + lunchAvg + waterAvg) / 3);
        const attendance = active.length;
        const totalDays = allDays.length;
        const bottleTotal = active.reduce((s, d) => s + d.bottle_refill, 0);

        let summary = `${name} attended ${attendance} out of ${totalDays} days during ${currentWeek.label}. `;

        if (overall >= 90) {
            summary += `Overall performance was outstanding with ${overall}% completion across meals and hydration. `;
        } else if (overall >= 70) {
            summary += `Overall performance was good at ${overall}% average completion. `;
        } else if (overall >= 50) {
            summary += `Performance was moderate at ${overall}% average — there's room for improvement. `;
        } else {
            summary += `Performance needs attention with only ${overall}% average completion. `;
        }

        // Highlight strengths
        const strengths = [];
        if (snackAvg >= 90) strengths.push('snack completion');
        if (lunchAvg >= 90) strengths.push('lunch completion');
        if (waterAvg >= 90) strengths.push('water intake');
        if (strengths.length) summary += `Key strengths: ${strengths.join(', ')}. `;

        // Highlight areas needing work
        const improvements = [];
        if (snackAvg < 60) improvements.push(`snacks (${snackAvg}%)`);
        if (lunchAvg < 60) improvements.push(`lunch (${lunchAvg}%)`);
        if (waterAvg < 60) improvements.push(`water (${waterAvg}%)`);
        if (improvements.length) summary += `Areas to improve: ${improvements.join(', ')}. `;

        if (bottleTotal >= 5) summary += `Hydration was well-maintained with ${bottleTotal} bottle refills for the week. `;

        // Trend comparison
        if (weekIdx > 0) {
            const prevActive = this.getActive(weeks[weekIdx - 1]);
            if (prevActive.length) {
                const prevOverall = Math.round((this.avg(prevActive, 'snack_completion') + this.avg(prevActive, 'lunch_completion') + this.avg(prevActive, 'water_completion')) / 3);
                if (overall > prevOverall + 5) summary += `This is an improvement of ${overall - prevOverall}% from the previous week!`;
                else if (prevOverall > overall + 5) summary += `This is a ${prevOverall - overall}% decline from the previous week — let's work on getting back on track.`;
                else summary += `Performance is consistent with the previous week.`;
            }
        }

        return summary;
    },

    // ============================
    // 3. PREDICTIONS
    // ============================
    generatePredictions(studentName) {
        const weeks = studentsData[studentName];
        if (weeks.length < 2) {
            return { snack: { trend: 'stable', predicted: null, label: 'Insufficient data' }, lunch: { trend: 'stable', predicted: null, label: 'Insufficient data' }, water: { trend: 'stable', predicted: null, label: 'Insufficient data' }, attendance: { trend: 'stable', predicted: null, label: 'Insufficient data' } };
        }

        const predict = (metric) => {
            const values = weeks.map(w => {
                const active = this.getActive(w);
                return active.length ? Math.round(this.avg(active, metric)) : null;
            }).filter(v => v !== null);

            if (values.length < 2) return { trend: 'stable', predicted: values[0] || 0, label: 'Stable' };

            const recent = values[values.length - 1];
            const prev = values[values.length - 2];
            const diff = recent - prev;
            const predicted = Math.max(0, Math.min(100, recent + diff));

            if (diff > 5) return { trend: 'improving', predicted, label: `Improving (+${diff}%)`, arrow: '↗', color: '#10b981' };
            if (diff < -5) return { trend: 'declining', predicted, label: `Declining (${diff}%)`, arrow: '↘', color: '#ef4444' };
            return { trend: 'stable', predicted: recent, label: `Stable (${recent}%)`, arrow: '→', color: '#f59e0b' };
        };

        const attendanceValues = weeks.map(w => {
            const allDays = w.days.filter(d => d.day !== 'SATURDAY');
            const active = this.getActive(w);
            return Math.round((active.length / allDays.length) * 100);
        });
        const attRecent = attendanceValues[attendanceValues.length - 1];
        const attPrev = attendanceValues.length > 1 ? attendanceValues[attendanceValues.length - 2] : attRecent;
        const attDiff = attRecent - attPrev;

        return {
            snack: predict('snack_completion'),
            lunch: predict('lunch_completion'),
            water: predict('water_completion'),
            attendance: {
                trend: attDiff > 5 ? 'improving' : attDiff < -5 ? 'declining' : 'stable',
                predicted: Math.max(0, Math.min(100, attRecent + attDiff)),
                label: attDiff > 5 ? `Improving (+${attDiff}%)` : attDiff < -5 ? `Declining (${attDiff}%)` : `Stable (${attRecent}%)`,
                arrow: attDiff > 5 ? '↗' : attDiff < -5 ? '↘' : '→',
                color: attDiff > 5 ? '#10b981' : attDiff < -5 ? '#ef4444' : '#f59e0b'
            }
        };
    },

    // ============================
    // 4. TEACHER RECOMMENDATIONS
    // ============================
    generateRecommendations(weekIdx) {
        const recs = [];
        const weekLabel = studentsData[Object.keys(studentsData)[0]][weekIdx]?.label;

        Object.keys(studentsData).forEach(studentName => {
            const week = studentsData[studentName].find(w => w.label === weekLabel);
            if (!week) return;
            const allDays = week.days.filter(d => d.day !== 'SATURDAY');
            const active = this.getActive(week);
            const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();

            // Attendance issues
            if (active.length === 0) {
                recs.push({ priority: 'urgent', icon: '🚨', text: `${name} was absent the entire week. Contact family immediately.`, student: studentName, category: 'attendance' });
            } else if (active.length <= 2) {
                recs.push({ priority: 'urgent', icon: '⚠️', text: `${name} attended only ${active.length}/${allDays.length} days. Follow up on absences.`, student: studentName, category: 'attendance' });
            }

            if (!active.length) return;

            const snackAvg = this.avg(active, 'snack_completion');
            const lunchAvg = this.avg(active, 'lunch_completion');
            const waterAvg = this.avg(active, 'water_completion');

            // Low water — health concern
            if (waterAvg < 50) {
                recs.push({ priority: 'urgent', icon: '💧', text: `${name}: Water intake critically low (${Math.round(waterAvg)}%). Ensure frequent water reminders.`, student: studentName, category: 'health' });
            } else if (waterAvg < 70) {
                recs.push({ priority: 'important', icon: '💧', text: `${name}: Water intake below target (${Math.round(waterAvg)}%). Encourage more hydration.`, student: studentName, category: 'health' });
            }

            // Low lunch — nutrition concern
            if (lunchAvg < 50) {
                recs.push({ priority: 'urgent', icon: '🍽️', text: `${name}: Lunch completion very low (${Math.round(lunchAvg)}%). Check food preferences or portion size.`, student: studentName, category: 'nutrition' });
            } else if (lunchAvg < 70) {
                recs.push({ priority: 'important', icon: '🍽️', text: `${name}: Lunch completion needs attention (${Math.round(lunchAvg)}%).`, student: studentName, category: 'nutrition' });
            }

            // Low snack
            if (snackAvg < 50) {
                recs.push({ priority: 'important', icon: '🍎', text: `${name}: Snack completion low (${Math.round(snackAvg)}%). Offer favourite fruits or alternatives.`, student: studentName, category: 'nutrition' });
            }

            // Celebrations
            const overall = (snackAvg + lunchAvg + waterAvg) / 3;
            if (overall >= 95) {
                recs.push({ priority: 'celebrate', icon: '🏆', text: `${name} achieved ${Math.round(overall)}% overall — outstanding performance! Acknowledge in class.`, student: studentName, category: 'celebration' });
            } else if (overall >= 85 && active.length === allDays.length) {
                recs.push({ priority: 'celebrate', icon: '⭐', text: `${name}: Perfect attendance with ${Math.round(overall)}% completion. Great consistency!`, student: studentName, category: 'celebration' });
            }

            // Week-over-week decline
            if (weekIdx > 0) {
                const prevWeek = studentsData[studentName][weekIdx - 1];
                if (prevWeek) {
                    const prevActive = this.getActive(prevWeek);
                    if (prevActive.length) {
                        const prevOverall = (this.avg(prevActive, 'snack_completion') + this.avg(prevActive, 'lunch_completion') + this.avg(prevActive, 'water_completion')) / 3;
                        if (prevOverall - overall > 25) {
                            recs.push({ priority: 'important', icon: '📉', text: `${name}: Performance dropped ${Math.round(prevOverall - overall)}% from last week. Check if everything is okay.`, student: studentName, category: 'trend' });
                        }
                    }
                }
            }
        });

        // Sort: urgent first, then important, then celebrate
        const priority = { urgent: 0, important: 1, celebrate: 2 };
        recs.sort((a, b) => priority[a.priority] - priority[b.priority]);
        return recs;
    },

    // ============================
    // 5. ANOMALY DETECTION
    // ============================
    detectAnomalies(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const allDays = currentWeek.days.filter(d => d.day !== 'SATURDAY');
        const active = this.getActive(currentWeek);
        const anomalies = [];
        const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();

        // Check consecutive absent days
        let consecutiveAbsent = 0;
        let maxConsecutive = 0;
        allDays.forEach(d => {
            const absent = (d.snacks === 'N/A' && d.lunch === 'N/A') || (d.snack_completion === 0 && d.lunch_completion === 0 && d.water_completion === 0);
            if (absent) { consecutiveAbsent++; maxConsecutive = Math.max(maxConsecutive, consecutiveAbsent); }
            else { consecutiveAbsent = 0; }
        });

        if (maxConsecutive >= 3) {
            anomalies.push({ severity: 'critical', icon: '🔴', text: `${maxConsecutive} consecutive absent days detected. Possible health or family issue.`, type: 'attendance' });
        } else if (maxConsecutive === 2) {
            anomalies.push({ severity: 'warning', icon: '🟡', text: `2 consecutive absent days. Monitor attendance pattern.`, type: 'attendance' });
        }

        if (!active.length) return anomalies;

        // Check for sudden drops within the week (present day with 0% in any metric)
        active.forEach(d => {
            if (this.pct(d.snack_completion) === 0 && d.snacks !== 'N/A') {
                anomalies.push({ severity: 'warning', icon: '🟡', text: `${d.day}: Present but 0% snack completion. Possible refusal or illness.`, type: 'metric' });
            }
            if (this.pct(d.lunch_completion) === 0 && d.lunch !== 'N/A') {
                anomalies.push({ severity: 'warning', icon: '🟡', text: `${d.day}: Present but 0% lunch completion. Check appetite/preferences.`, type: 'metric' });
            }
            if (this.pct(d.water_completion) === 0) {
                anomalies.push({ severity: 'critical', icon: '🔴', text: `${d.day}: Zero water intake while present. Health concern.`, type: 'health' });
            }
        });

        // Week-over-week comparison for sudden drops
        if (weekIdx > 0) {
            const prevActive = this.getActive(weeks[weekIdx - 1]);
            if (prevActive.length && active.length) {
                const metrics = ['snack_completion', 'lunch_completion', 'water_completion'];
                const labels = ['Snack', 'Lunch', 'Water'];
                metrics.forEach((m, i) => {
                    const curr = this.avg(active, m);
                    const prev = this.avg(prevActive, m);
                    if (prev - curr > 30) {
                        anomalies.push({ severity: 'critical', icon: '🔴', text: `${labels[i]} completion crashed ${Math.round(prev - curr)}% from last week (${Math.round(prev)}% → ${Math.round(curr)}%).`, type: 'trend' });
                    } else if (prev - curr > 20) {
                        anomalies.push({ severity: 'warning', icon: '🟡', text: `${labels[i]} completion dropped ${Math.round(prev - curr)}% from last week.`, type: 'trend' });
                    }
                });

                // Attendance anomaly
                const prevAttendance = prevActive.length;
                if (prevAttendance - active.length >= 2) {
                    anomalies.push({ severity: 'warning', icon: '🟡', text: `Attendance dropped by ${prevAttendance - active.length} days compared to last week.`, type: 'attendance' });
                }
            }
        }

        // Low streak detection (3+ days below 50% in any metric)
        const checkStreak = (metric, label) => {
            let lowStreak = 0;
            active.forEach(d => {
                if (this.pct(d[metric]) < 50 && this.pct(d[metric]) > 0) { lowStreak++; }
            });
            if (lowStreak >= 3) {
                anomalies.push({ severity: 'warning', icon: '🟠', text: `${label}: Below 50% for ${lowStreak} days this week — persistent low pattern.`, type: 'pattern' });
            }
        };
        checkStreak('snack_completion', 'Snacks');
        checkStreak('lunch_completion', 'Lunch');
        checkStreak('water_completion', 'Water');

        return anomalies;
    }
};
