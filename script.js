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
    checkAndResetStrategies(result);
    updatePredictions();
    updateChart();
}

function checkAndResetStrategies(result) {
    if (result === 'P' || result === 'B') {
        // Reset the position for all strategies if there's a win
        for (const strategy in strategies) {
            if (strategies[strategy].sequence[strategies[strategy].position] === result) {
                strategies[strategy].position = 0; // Reset the sequence to start
            }
        }
    } else if (result === 'T') {
        // If it's a Tie, just increment the position without resetting
        for (const strategy in strategies) {
            strategies[strategy].position = (strategies[strategy].position + 1) % strategies[strategy].sequence.length;
        }
    }
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

// Dark Mode Toggle
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
