let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;

const strategies = {
    'The Cake': { sequence: ['B', 'B', 'P', 'B', 'B', 'P', 'P', 'B'], position: 0, wins: 0, losses: 0, winStreak: 0, lossStreak: 0, maxWinStreak: 0, maxLossStreak: 0 },
    'ZachFortune': { sequence: ['B', 'B', 'P', 'P', 'B', 'P', 'B'], position: 0, wins: 0, losses: 0, winStreak: 0, lossStreak: 0, maxWinStreak: 0, maxLossStreak: 0 },
    'Mr. Toad': { sequence: ['P', 'B', 'P', 'B', 'P', 'B', 'P', 'B'], position: 0, wins: 0, losses: 0, winStreak: 0, lossStreak: 0, maxWinStreak: 0, maxLossStreak: 0 },
    'The Marcos': { sequence: ['P', 'B', 'P', 'P', 'B', 'B'], position: 0, wins: 0, losses: 0, winStreak: 0, lossStreak: 0, maxWinStreak: 0, maxLossStreak: 0 }
};

function recordResult(result) {
    history.push(result);
    updateCounts(result);
    updateHistoryTable();
    updateStrategyPositions(result);
    updatePredictions();
    updateChart();
    updateStrategyStats();
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
        
        // If the result is Tie, do not advance the position but still update streaks if necessary
        if (result === 'T') {
            // No position change, no streaks change for a Tie
            continue;  // Move to the next strategy
        }

        // If the result matches the current prediction, it's a win
        if (strategyData.sequence[strategyData.position] === result) {
            strategyData.wins++;
            strategyData.winStreak++;
            strategyData.lossStreak = 0;
            if (strategyData.winStreak > strategyData.maxWinStreak) {
                strategyData.maxWinStreak = strategyData.winStreak;
            }
            strategyData.position = 0;  // Reset if it's a win
        } else {
            // Otherwise, it's a loss
            strategyData.losses++;
            strategyData.lossStreak++;
            strategyData.winStreak = 0;
            if (strategyData.lossStreak > strategyData.maxLossStreak) {
                strategyData.maxLossStreak = strategyData.lossStreak;
            }
            strategyData.position = (strategyData.position + 1) % strategyData.sequence.length;
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

function updateStrategyStats() {
    const strategyStats = document.getElementById('strategy-stats');
    let statsHTML = '';

    for (const strategy in strategies) {
        const strategyData = strategies[strategy];
        statsHTML += `
            <div>
                <h3>${strategy}</h3>
                <p>Wins: ${strategyData.wins}</p>
                <p>Losses: ${strategyData.losses}</p>
                <p>Win Streak: ${strategyData.maxWinStreak}</p>
                <p>Loss Streak: ${strategyData.maxLossStreak}</p>
            </div>
        `;
    }

    strategyStats.innerHTML = statsHTML;
}

// Dark Mode Toggle
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
