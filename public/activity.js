let currentWeekOffset = 0; // 0 = this week, -1 = last week, +1 = next week
let trainingChart = null;

// funksjon for å legge til aktivitet
async function addActivity(event) {
    event.preventDefault();

    const activity = document.getElementById("activity").value;
    const date = document.getElementById("date").value;
    const duration = document.getElementById("duration").value;

    try {
        const response = await fetch("/addActivity", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                activity,
                date,
                duration
            })
        })
        const result = await response.json();
        alert(result.message);
        loadActivities();
        // oppdaterer chart-et slik at den viser info om treningen din
        updateChart(); // Update the chart when new activity is added
        document.getElementById("activity").value = "";
        document.getElementById("date").value = "";
        document.getElementById("duration").value = "";
    } catch (error) {
        console.error("AddActivityToList error:", error);
        alert("Feil: " + error.message);
    }
}

async function loadActivities() {
    try {
        const response = await fetch("/showYourActivity");
        const activities = await response.json();
        
        let html = "<h2>Your Activities</h2>";
        if (activities.length === 0) {
            html += "<p>No activities yet</p>";
        } else {
            html += "<ul>";
            activities.forEach(act => {
                html += `<li>${act.activity} - ${act.date} (${act.duration} min)</li>`;
            });
            html += "</ul>";
        }
        
        const div = document.getElementById("activities-list");
        if (div) {
            div.innerHTML = html;
        }
    } catch (error) {
        console.error("Error loading activities:", error);
    }
}

// Get the start and end date of a specific week
function getWeekDateRange(offset = 0) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
    
    // Calculate Monday of current week
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    
    // Apply week offset
    monday.setDate(monday.getDate() + offset * 7);
    
    // Create Sunday of same week
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    
    return { monday, sunday };
}

// Update the week display text
function updateWeekDisplay() {
    const { monday, sunday } = getWeekDateRange(currentWeekOffset);
    const mondayStr = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const sundayStr = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById("weekDisplay").textContent = `${mondayStr} - ${sundayStr}`;
}

// Navigate to previous week
function previousWeek() {
    currentWeekOffset--;
    updateWeekDisplay();
    updateChart();
}

// Navigate to next week
function nextWeek() {
    currentWeekOffset++;
    updateWeekDisplay();
    updateChart();
}

// Update the chart with activities for the selected week
async function updateChart() {
    try {
        const response = await fetch("/showYourActivity");
        const activities = await response.json();
        
        // Get week date range
        const { monday, sunday } = getWeekDateRange(currentWeekOffset);
        
        // Initialize day counts (Monday to Sunday)
        const dayCounts = {
            'Monday': 0,
            'Tuesday': 0,
            'Wednesday': 0,
            'Thursday': 0,
            'Friday': 0,
            'Saturday': 0,
            'Sunday': 0
        };
        
        // Count activities for each day of the week
        activities.forEach(act => {
            const actDate = new Date(act.date);
            
            // Check if activity is in the selected week
            if (actDate >= monday && actDate <= sunday) {
                const dayName = actDate.toLocaleDateString('en-US', { weekday: 'long' });
                if (dayCounts.hasOwnProperty(dayName)) {
                    dayCounts[dayName]++;
                }
            }
        });
        
        const labels = Object.keys(dayCounts);
        const data = Object.values(dayCounts);
        
        // Destroy existing chart if it exists
        if (trainingChart) {
            trainingChart.destroy();
        }
        
        // Create new chart
        const ctx = document.getElementById('myChart');
        trainingChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Workouts per Day',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error updating chart:", error);
    }
}

window.addEventListener("load", () => {
    updateWeekDisplay();
    loadActivities();
    updateChart();
});