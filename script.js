let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;

const strategies = {
    'The Cake': { sequence: ['B', 'B', 'P', 'B', 'B', 'P', 'P', 'B'], position: 0 },
    'ZachFortune': { sequence: ['B', 'B', 'P', 'P', 'B', 'P', 'B'], position: 0 },
    'Mr. Toad': { sequence: ['P', 'B', 'P', 'B', 'P', 'B', 'P', 'B'], position: 0 },
    'The Marcos': { sequence: ['P', 'B', 'P', 'P', 'B', 'B'], position: 0 }
};

function recordResult(result) {
    history.push(result);
    updateCounts(result);
    updateHistoryTable();
    updateStrategyPositions(result);
    updatePredictions();
    updateChart();
    updateBaccaratChart();
}

function updateCounts(result) {
    if (result === 'P') playerCount++;
    if (result === 'B') bankerCount++;
    if (result === 'T') tieCount++;
}

function updateHistoryTable() {
    const tableBody = document.getElementById('history-table-body');
    tableBody.innerHTML = '';
    history.forEach((result, index) => {
        const row = `<tr><td>${index + 1}</td><td>${result}</td></tr>`;
        tableBody.innerHTML += row;
    });
}

function updateStrategyPositions(result) {
    for (const strategy in strategies) {
        const strategyData = strategies[strategy];
        
        // If the result is Tie, move to the next position without resetting
        if (result === 'T') {
            strategyData.position = (strategyData.position + 1) % strategyData.sequence.length;
        } else {
            // If the result matches the current prediction, reset the position
            if (strategyData.sequence[strategyData.position] === result) {
                strategyData.position = 0;
            } else {
                // Otherwise, move to the next position
                strategyData.position = (strategyData.position + 1) % strategyData.sequence.length;
            }
        }
    }
}

function updatePredictions() {
    const predictionResults = document.getElementById('prediction-results');
    const predictions = predictNextHand();
    
    predictionResults.innerHTML = `
        <p><strong>The Cake:</strong> ${predictions['The Cake']}</p>
        <p><strong>ZachFortune:</strong> ${predictions['ZachFortune']}</p>
        <p><strong>Mr. Toad:</strong> ${predictions['Mr. Toad']}</p>
        <p><strong>The Marcos:</strong> ${predictions['The Marcos']}</p>
    `;
}

function predictNextHand() {
    let predictions = {};
    for (const strategy in strategies) {
        const { sequence, position } = strategies[strategy];
        predictions[strategy] = sequence[position];
    }
    return predictions;
}

function updateChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Player', 'Banker', 'Tie'],
            datasets: [{
                label: 'Count',
                data: [playerCount, bankerCount, tieCount],
                backgroundColor: ['#4CAF50', '#f44336', '#FFC107'],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// New function to handle Baccarat chart updates
function updateBaccaratChart() {
    // Draw Big Road
    drawBigRoad();
    // You can expand these to implement the other charts
    drawBigEyeBoy();
    drawSmallRoad();
    drawCockroachRoad();
}

function drawBigRoad() {
    const canvas = document.getElementById('big-road');
    const ctx = canvas.getContext('2d');
    const cellSize = 20;
    let x = 0;
    let y = 0;
    let lastResult = '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    history.forEach((result, index) => {
        if (result === 'P' || result === 'B') {
            if (result !== lastResult && lastResult !== '') {
                x += cellSize;
                y = 0;
            }
            ctx.fillStyle = result === 'P' ? '#007BFF' : '#DC3545';
            ctx.beginPath();
            ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 2, 0, 2 * Math.PI);
            ctx.fill();
            y += cellSize;
            if (y + cellSize > canvas.height) {
                x += cellSize;
                y = 0;
            }
            lastResult = result;
        }
    });
}

function drawBigEyeBoy() {
    const canvas = document.getElementById('big-eye-boy');
    const ctx = canvas.getContext('2d');
    // Implement the logic to draw the Big Eye Boy chart
}

function drawSmallRoad() {
    const canvas = document.getElementById('small-road');
    const ctx = canvas.getContext('2d');
    // Implement the logic to draw the Small Road chart
}

function drawCockroachRoad() {
    const canvas = document.getElementById('cockroach-road');
    const ctx = canvas.getContext('2d');
    // Implement the logic to draw the Cockroach Road chart
}

// Dark Mode Toggle
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
