let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;

let strategyPerformance = {
    'The Cake': { wins: 0, losses: 0 },
    'ZachFortune': { wins: 0, losses: 0 },
    'Mr. Toad': { wins: 0, losses: 0 },
    'The Marcos': { wins: 0, losses: 0 }
};

function recordResult(result) {
    const predictions = predictNextHand();
    const winningStrategy = determineWinningStrategy(result, predictions);
    
    history.push({ result, winningStrategy });
    updateCounts(result);
    updateStrategyPerformance(winningStrategy, predictions, result);
    updateHistoryTable();
    updatePredictions(predictions);
    updateChart();
    updatePerformanceTable();
}

function resetGame() {
    history = [];
    playerCount = 0;
    bankerCount = 0;
    tieCount = 0;

    strategyPerformance = {
        'The Cake': { wins: 0, losses: 0 },
        'ZachFortune': { wins: 0, losses: 0 },
        'Mr. Toad': { wins: 0, losses: 0 },
        'The Marcos': { wins: 0, losses: 0 }
    };

    updateHistoryTable();
    updatePredictions(predictNextHand());
    updateChart();
    updatePerformanceTable();
}

function updateCounts(result) {
    if (result === 'P') playerCount++;
    if (result === 'B') bankerCount++;
    if (result === 'T') tieCount++;
}

function updateHistoryTable() {
    const tableBody = document.getElementById('history-table-body');
    tableBody.innerHTML = '';
    history.forEach((entry, index) => {
        const row = `<tr><td>${index + 1}</td><td>${entry.result}</td><td>${entry.winningStrategy || 'None'}</td></tr>`;
        tableBody.innerHTML += row;
    });
}

function updatePredictions(predictions) {
    const predictionResults = document.getElementById('prediction-results');
    predictionResults.innerHTML = `
        <p><strong>The Cake:</strong> ${predictions['The Cake']}</p>
        <p><strong>ZachFortune:</strong> ${predictions['ZachFortune']}</p>
        <p><strong>Mr. Toad:</strong> ${predictions['Mr. Toad']}</p>
        <p><strong>The Marcos:</strong> ${predictions['The Marcos']}</p>
    `;
}

function predictNextHand() {
    const strategies = {
        'The Cake': ['B', 'B', 'P', 'B', 'B', 'P', 'P', 'B'],
        'ZachFortune': ['B', 'B', 'P', 'P', 'B', 'P', 'B'],
        'Mr. Toad': ['P', 'B', 'P', 'B', 'P', 'B', 'P', 'B'],
        'The Marcos': ['P', 'B', 'P', 'P', 'B', 'B']
    };

    let predictions = {};

    for (const strategy in strategies) {
        let sequence = strategies[strategy];
        let sequenceIndex = history.length % sequence.length;
        predictions[strategy] = sequence[sequenceIndex];
    }

    return predictions;
}

function determineWinningStrategy(result, predictions) {
    let winningStrategy = null;

    for (const strategy in predictions) {
        if (predictions[strategy] === result) {
            winningStrategy = strategy;
            break;
        }
    }

    return winningStrategy;
}

function updateStrategyPerformance(winningStrategy, predictions, result) {
    for (const strategy in predictions) {
        if (predictions[strategy] === result) {
            strategyPerformance[strategy].wins++;
        } else {
            strategyPerformance[strategy].losses++;
        }
    }
}

function updatePerformanceTable() {
    const tableBody = document.getElementById('performance-table-body');
    tableBody.innerHTML = '';
    
    const sortedStrategies = Object.keys(strategyPerformance).sort((a, b) => {
        return strategyPerformance[b].wins - strategyPerformance[a].wins;
    });

    sortedStrategies.forEach(strategy => {
        const row = `<tr><td>${strategy}</td><td>${strategyPerformance[strategy].wins}</td><td>${strategyPerformance[strategy].losses}</td></tr>`;
        tableBody.innerHTML += row;
    });
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

// Initialize the game with empty tables and predictions
resetGame();
