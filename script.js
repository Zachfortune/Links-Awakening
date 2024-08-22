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
            lossRate: lossRate,
            prediction: this.predict()
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

function recordResult(result) {
    history.push(result);
    updateCounts(result);
    updateHistory();
    updateStrategies(result);
    updatePredictions();
    updateStrategyStats();
    updateCountBoxes();

    // Automatically scroll to the bottom to show the latest hands
    const handResultsContainer = document.getElementById('hand-results-container');
    handResultsContainer.scrollTop = handResultsContainer.scrollHeight;
}

function deleteLastHand() {
    if (history.length === 0) return;

    const lastResult = history.pop();
    reverseUpdateCounts(lastResult);
    reverseUpdateStrategies(lastResult);
    updateHistory();
    updatePredictions();
    updateStrategyStats();
    updateCountBoxes();

    if (history.length === 0) {
        fullResetAllStrategies();
        playerCount = 0;
        bankerCount = 0;
        tieCount = 0;
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

function updateHistory() {
    const handResults = document.getElementById('hand-results');
    handResults.innerHTML = '';

    // Display all hands
    history.forEach((result, index) => {
        handResults.innerHTML += `<p>Hand ${index + 1}: ${result}</p>`;
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
        const strategyColor = stats.currentLossStreak >= 4 ? 'darkred' : 'black';

        predictionsHTML += `<p><strong style="color: ${strategyColor}; font-weight: bold;">${strategies[strategy].name}:</strong> ${strategies[strategy].predict()}</p>`;
    }

    predictionResults.innerHTML = predictionsHTML;
}

function updateStrategyStats() {
    const strategyStats = document.getElementById('strategy-stats');
    let statsHTML = '';

    let highestWinStreak = 0;

    // First, find the highest win streak
    for (const strategy in strategies) {
        const stats = strategies[strategy].getStats();
        if (stats.currentWinStreak > highestWinStreak) {
            highestWinStreak = stats.currentWinStreak;
        }
    }

    // Now, apply the green color to all strategies with the highest win streak
    for (const strategy in strategies) {
        const stats = strategies[strategy].getStats();
        const predictionColor = stats.currentWinStreak === highestWinStreak && highestWinStreak > 0 ? 'green' : 'black';
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
                <p><strong style="color: ${predictionColor};">Next Prediction:</strong> ${stats.prediction}</p>
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

// Dark Mode Toggle
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
