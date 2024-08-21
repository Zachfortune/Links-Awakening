class Strategy {
    constructor(name, sequence) {
        this.name = name;
        this.sequence = sequence;
        this.position = 0;
        this.wins = 0;
        this.losses = 0;
        this.currentWinStreak = 0;
        this.currentLossStreak = 0;
        this.maxWinStreak = 0;
        this.maxLossStreak = 0;
    }

    predict() {
        return this.sequence[this.position];
    }

    update(result) {
        if (result === 'T') return;

        if (this.predict() === result) {
            this.wins++;
            this.currentWinStreak++;
            this.currentLossStreak = 0;
            if (this.currentWinStreak > this.maxWinStreak) {
                this.maxWinStreak = this.currentWinStreak;
            }
            this.position = 0;
        } else {
            this.losses++;
            this.currentLossStreak++;
            this.currentWinStreak = 0;
            if (this.currentLossStreak > this.maxLossStreak) {
                this.maxLossStreak = this.currentLossStreak;
            }
            this.position = (this.position + 1) % this.sequence.length;
        }
    }

    reverseUpdate(result) {
        if (result === 'T') return;

        if (this.position === 0) {
            this.position = this.sequence.length - 1;
        } else {
            this.position = (this.position - 1 + this.sequence.length) % this.sequence.length;
        }

        if (this.predict() === result) {
            this.wins--;
            this.currentWinStreak = Math.max(0, this.currentWinStreak - 1);
        } else {
            this.losses--;
            this.currentLossStreak = Math.max(0, this.currentLossStreak - 1);
        }
    }

    resetStats() {
        this.position = 0;
        this.wins = 0;
        this.losses = 0;
        this.currentWinStreak = 0;
        this.currentLossStreak = 0;
        this.maxWinStreak = 0;
        this.maxLossStreak = 0;
    }

    fullReset() {
        this.resetStats();
    }

    getStats() {
        const totalGames = this.wins + this.losses;
        const winRate = totalGames > 0 ? (this.wins / totalGames * 100).toFixed(2) : 0;
        const lossRate = totalGames > 0 ? (this.losses / totalGames * 100).toFixed(2) : 0;

        return {
            wins: this.wins,
            losses: this.losses,
            maxWinStreak: this.maxWinStreak,
            maxLossStreak: this.maxLossStreak,
            currentWinStreak: this.currentWinStreak,
            currentLossStreak: this.currentLossStreak,
            winRate: winRate,
            lossRate: lossRate
        };
    }
}

const strategies = {
    'The Cake': new Strategy('The Cake', ['B', 'B', 'P', 'B', 'B', 'P', 'P', 'B']),
    'ZachFortune': new Strategy('ZachFortune', ['B', 'B', 'P', 'P', 'B', 'P', 'B']),
    'Mr. Toad': new Strategy('Mr. Toad', ['P', 'B', 'P', 'B', 'P', 'B', 'P', 'B']),
    'The Marcos': new Strategy('The Marcos', ['P', 'B', 'P', 'P', 'B', 'B']),
    'Double Trouble': new Strategy('Double Trouble', ['B', 'B', 'P', 'P', 'B', 'B']),
    'The Gentleman': new Strategy('The Gentleman', ['B', 'P', 'B', 'P', 'P', 'B', 'B', 'P']),
    'Mr. Miyagi': new Strategy('Mr. Miyagi', ['P', 'P', 'P', 'B', 'B', 'P', 'P', 'P']),
    'Animal Style': new Strategy('Animal Style', ['B', 'B', 'B', 'B', 'P', 'P', 'P', 'P'])
};

let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;
let myChart = null;

function recordResult(result) {
    history.push(result);
    updateCounts(result);
    updateHistoryTable();
    updateStrategies(result);
    updatePredictions();
    updateChart();
    updateStrategyStats();
    updateCountBoxes(); // Update the count boxes
}

function deleteLastHand() {
    if (history.length === 0) return;

    const lastResult = history.pop();
    reverseUpdateCounts(lastResult);
    reverseUpdateStrategies(lastResult);
    updateHistoryTable();
    updatePredictions();
    updateChart();
    updateStrategyStats();
    updateCountBoxes();

    // Recheck the predictions after deletion
    updatePredictions();

    if (history.length === 0) {
        fullResetAllStrategies();
        playerCount = 0;
        bankerCount = 0;
        tieCount = 0;
        updateChart();
        updateStrategyStats();
        updatePredictions();
        updateCountBoxes();
    }
}

function fullResetAllStrategies() {
    for (const strategy in strategies) {
        strategies[strategy].fullReset();
    }
}

function updateCounts(result) {
    if (result === 'P') playerCount++;
    if (result === 'B') bankerCount++;
    if (result === 'T') tieCount++;
}

function reverseUpdateCounts(result) {
    if (result === 'P') playerCount--;
    if (result === 'B') bankerCount--;
    if (result === 'T') tieCount--;
}

function updateHistoryTable() {
    const tableBody = document.getElementById('history-table-body');
    tableBody.innerHTML = '';
    history.forEach((result, index) => {
        const row = `<tr><td>${index + 1}</td><td>${result}</td></tr>`;
        tableBody.innerHTML += row;
    });
}

function updateStrategies(result) {
    for (const strategy in strategies) {
        strategies[strategy].update(result);
    }
}

function reverseUpdateStrategies(result) {
    for (const strategy in strategies) {
        strategies[strategy].reverseUpdate(result);
    }
}

function updatePredictions() {
    const predictionResults = document.getElementById('prediction-results');
    let predictionsHTML = '';

    for (const strategy in strategies) {
        const stats = strategies[strategy].getStats();
        const strategyColor = stats.currentLossStreak >= 4 ? 'darkred' : 'black'; // Default to bold black, change to dark red if loss streak is 4 or more

        predictionsHTML += `<p><strong style="color: ${strategyColor}; font-weight: bold;">${strategies[strategy].name}:</strong> ${strategies[strategy].predict()}</p>`;
    }

    predictionResults.innerHTML = predictionsHTML;
}

function updateChart() {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
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
        const stats = strategies[strategy].getStats();
        statsHTML += `
            <div>
                <h3>${strategies[strategy].name}</h3>
                <p>Wins: ${stats.wins}</p>
                <p>Losses: ${stats.losses}</p>
                <p>Win Rate: ${stats.winRate}%</p>
                <p>Loss Rate: ${stats.lossRate}%</p>
                <p>Max Win Streak: ${stats.maxWinStreak}</p>
                <p>Max Loss Streak: ${stats.maxLossStreak}</p>
                <p>Current Win Streak: ${stats.currentWinStreak}</p>
                <p>Current Loss Streak: ${stats.currentLossStreak}</p>
            </div>
        `;
    }

    strategyStats.innerHTML = statsHTML;
}

function updateCountBoxes() {
    document.getElementById('banker-count-box').innerText = bankerCount;
    document.getElementById('player-count-box').innerText = playerCount;
    document.getElementById('tie-count-box').innerText = tieCount;
}

// Dark Mode Ttoggle
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
