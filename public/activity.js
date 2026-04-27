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
        // kjører en funksjon
        loadActivities();

        // kjører en funksjon
        // oppdaterer chart-et slik at den viser info om treningen din
        updateChart(); // Update the chart when new activity is added

        // tømmer input-feltene slik at de er klare for å li lagt til ny data
        document.getElementById("activity").value = "";
        document.getElementById("date").value = "";
        document.getElementById("duration").value = "";
    } catch (error) {
        console.error("AddActivityToList error:", error);
        alert("Feil: " + error.message);
    }
}

// viser aktivitetene dine
async function loadActivities() {
    try {
        // gjør et api-kall i app.js
        const response = await fetch("/showYourActivity");
        // konverterer svaret til json
        const activities = await response.json();
        
        // lager html-en
        let html = "<h2>Your Activities</h2>";
        // hvis ingen aktiviteter, vil den vise ingen ting
        if (activities.length === 0) {
            html += "<p>No activities yet</p>";
        // for hver aktivitet vil den lage en "ul" og "li", den henter deretter info fra json-filen
        } else {
            html += "<ul>";
            activities.forEach(act => {
                html += `<li>${act.activity} - ${act.date} (${act.duration} min)</li>`;
            });
            html += "</ul>";
        }
        // finner en id og setter deretter infoen du har laget i html-filen
        const div = document.getElementById("activities-list");
        if (div) {
            div.innerHTML = html;
        }
    } catch (error) {
        console.error("Error loading activities:", error);
    }
}

// Get the start and end date of a specific week
// Finner start (mandag) og slutt (søndag) for en gitt uke
function getWeekDateRange(offset = 0) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
    
    // Calculate Monday of current week
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));

    // new*
    monday.setHours(0, 0, 0, 0);
    
    // Apply week offset
    monday.setDate(monday.getDate() + offset * 7);
    
    // Create Sunday of same week
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    // new*
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
}

// Update the week display text
// Oppdaterer teksten som viser hvilken uke som er valgt
function updateWeekDisplay() {
    const { monday, sunday } = getWeekDateRange(currentWeekOffset);
    const mondayStr = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const sundayStr = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById("weekDisplay").textContent = `${mondayStr} - ${sundayStr}`;
}

// Navigate to previous week
// Går til forrige uke og oppdaterer visning og graf
function previousWeek() {
    currentWeekOffset--;
    updateWeekDisplay();
    updateChart();
}

// Navigate to next week
// Går til neste uke og oppdaterer visning og graf
function nextWeek() {
    currentWeekOffset++;
    updateWeekDisplay();
    updateChart();
}

// Update the chart with activities for the selected week
// Oppdaterer grafen med aktiviteter for valgt uke
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
            // new*
            const actDate = new Date(act.date);
            // const actDate = new Date(act.date + 'T00:00:00');
            
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

// Kjøres når siden lastes inn: viser uke, aktiviteter og graf
window.addEventListener("load", () => {
    updateWeekDisplay();
    loadActivities();
    updateChart();
});