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
            this.position = 0; // Reset if correct prediction
        } else {
            this.losses++;
            this.currentLossStreak++;
            this.currentWinStreak = 0;
            if (this.currentLossStreak > this.maxLossStreak) {
                this.maxLossStreak = this.currentLossStreak;
            }
            this.position = (this.position + 1) % this.sequence.length;
        }

        // Debugging logs
        console.log(`${this.name} updated - Position: ${this.position}, Wins: ${this.wins}, Losses: ${this.losses}, Win Streak: ${this.currentWinStreak}, Loss Streak: ${this.currentLossStreak}`);
    }

    getStats() {
        return {
            wins: this.wins,
            losses: this.losses,
            maxWinStreak: this.maxWinStreak,
            maxLossStreak: this.maxLossStreak
        };
    }
}

const strategies = {
    'The Cake': new Strategy('The Cake', ['B', 'B', 'P', 'B', 'B', 'P', 'P', 'B']),
    'ZachFortune': new Strategy('ZachFortune', ['B', 'B', 'P', 'P', 'B', 'P', 'B']),
    'Mr. Toad': new Strategy('Mr. Toad', ['P', 'B', 'P', 'B', 'P', 'B', 'P', 'B']),
    'The Marcos': new Strategy('The Marcos', ['P', 'B', 'P', 'P', 'B', 'B'])
};

let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;

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

function updateCounts(result) {
    if (result === 'P') playerCount++;
    if (result === 'B') bankerCount++;
    if (result === 'T') tieCount++;
    console.log(`Counts updated - Player: ${playerCount}, Banker: ${bankerCount}, Tie: ${tieCount}`);
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
        const stats = strategies[strategy].getStats();
        statsHTML += `
            <div>
                <h3>${strategies[strategy].name}</h3>
                <p>Wins: ${stats.wins}</p>
                <p>Losses: ${stats.losses}</p>
                <p>Max Win Streak: ${stats.maxWinStreak}</p>
                <p>Max Loss Streak: ${stats.maxLossStreak}</p>
            </div>
        `;
    }

    strategyStats.innerHTML = statsHTML;
}

// Dark Mode Toggle
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
