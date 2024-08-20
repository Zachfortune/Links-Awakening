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
        if (result === 'T') return; // Ignore ties for strategy update

        if (this.predict() === result) {
            this.wins++;
            this.currentWinStreak++;
            this.currentLossStreak = 0;
            if (this.currentWinStreak > this.maxWinStreak) {
                this.maxWinStreak = this.currentWinStreak;
            }
            this.position = 0; // Reset to beginning of sequence after a win
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
        if (result === 'T') return; // Ignore ties for strategy update

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

        // Recalculate max streaks
        if (this.currentWinStreak < this.maxWinStreak) {
            this.maxWinStreak = this.currentWinStreak;
        }
        if (this.currentLossStreak < this.maxLossStreak) {
            this.maxLossStreak = this.currentLossStreak;
        }
    }

    resetStats() {
        this.position = 0; // Ensure position is reset to the start of the sequence
        this.wins = 0;
        this.losses = 0;
        this.currentWinStreak = 0;
        this.currentLossStreak = 0;
        this.maxWinStreak = 0;
        this.maxLossStreak = 0;
    }

    fullReset() {
        this.resetStats(); // Reset all stats and sequence position
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
    'Mr. Miyagi': new Strategy('Mr. Miyagi', ['P', 'P', 'P', 'B', 'B', 'P', 'P', 'P'])
};

let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;
let myChart = null; // Variable to hold the chart instance

function recordResult(result) {
    console.log(`Recording result: ${result}`);
    history.push(result);
    updateCounts(result);
    updateHistoryTable();
    updateStrategies(result);
    updatePredictions();
    updateChart();
    updateStrategyStats();
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

    if (history.length === 0) {
        fullResetAllStrategies();
        playerCount = 0;
        bankerCount = 0;
        tieCount = 0;
        updateChart();
        updateStrategyStats();
    }
}

function fullResetAllStrategies() {
    for (const strategy in strategies) {
        strategies[strategy].fullReset(); // Completely reset all strategies to their initial state
    }
}

function updateCounts(result) {
    if (result === 'P') playerCount++;
    if (result === 'B') bankerCount++;
    if (result === 'T') tieCount++;
    console.log(`Counts updated - Player: ${playerCount}, Banker: ${bankerCount}, Tie: ${tieCount}`);
}

function reverseUpdateCounts(result) {
    if (result === 'P') playerCount--;
    if (result === 'B') bankerCount--;
    if (result === 'T') tieCount--;
    console.log(`Counts reversed - Player: ${playerCount}, Banker: ${bankerCount}, Tie: ${tieCount}`);
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
        predictionsHTML += `<p><strong>${strategies[strategy].name}:</strong> ${strategies[strategy].predict()}</p>`;
    }

    predictionResults.innerHTML = predictionsHTML;
}

function updateChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Destroy existing chart instancee if it exists
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

// Dark Mode Toggle
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
