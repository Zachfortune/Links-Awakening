class Strategy {
    constructor(name, sequence, isConditional = false) {
        this.name = name;
        this.sequence = sequence;
        this.isConditional = isConditional;
        this.isReady = !isConditional;
        this.resetStats();
    }

    predict() {
        if (this.isConditional && !this.isReady) {
            return "WAIT";
        }
        return this.sequence[this.position];
    }

    resetStats() {
        this.position = 0;
        this.wins = 0;
        this.losses = 0;
        this.currentWinStreak = 0;
        this.currentLossStreak = 0;
        this.maxWinStreak = 0;
        this.maxLossStreak = 0;
        if (!this.isConditional) {
            this.isReady = true;
        } else {
            this.isReady = false;
        }
    }

    handleFirstPlayerInput() {
        if (this.isConditional && !this.isReady) {
            this.isReady = true;
            this.position = 0;
        }
    }

    update(result) {
        if (result === 'T') return;

        if (result === 'P' && this.isConditional && !this.isReady) {
            this.handleFirstPlayerInput();
            return;
        }

        if (this.isReady && this.predict() === result) {
            this.wins++;
            this.currentWinStreak++;
            this.currentLossStreak = 0;
            if (this.currentWinStreak > this.maxWinStreak) {
                this.maxWinStreak = this.currentWinStreak;
            }
            this.position = 0;
            if (this.isConditional) {
                this.resetToWait();
            }
        } else if (this.isReady) {
            this.losses++;
            this.currentLossStreak++;
            this.currentWinStreak = 0;
            if (this.currentLossStreak > this.maxLossStreak) {
                this.maxLossStreak = this.currentLossStreak;
            }
            this.position = (this.position + 1) % this.sequence.length;

            if (this.position === 0 && this.isConditional) {
                this.resetToWait();
            }
        }
    }

    resetToWait() {
        this.position = 0;
        this.isReady = false;
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
    'Animal Style': new Strategy('Animal Style', ['B', 'B', 'B', 'B', 'P', 'P', 'P', 'P']),
    'Karate Chop': new Strategy('Karate Chop', ['B', 'P', 'B', 'P', 'B', 'P', 'B', 'P']),
    'Snoop Dogg': new Strategy('Snoop Dogg', ['P', 'P', 'B', 'P', 'P', 'B', 'P', 'B', 'B']),
    'The Safe Bet': new Strategy('The Safe Bet', ['P', 'P', 'B', 'B']),
    'The Trend Follower': new Strategy('The Trend Follower', ['P', 'P', 'P', 'B', 'B']),
    'The Reversal': new Strategy('The Reversal', ['B', 'P', 'P', 'B']),
    'The Pincer': new Strategy('The Pincer', ['B', 'P', 'P', 'B', 'B', 'P']),
    'The Edge Case': new Strategy('The Edge Case', ['P', 'B', 'P', 'P', 'B', 'P', 'B']),
    'Grand Theft Auto': new Strategy('Grand Theft Auto', ['B', 'B', 'P'], true),
};

class SlicedBreadStrategy extends Strategy {
    constructor() {
        super('Sliced Bread 🥖', [], true);
        this.phase = 1;
        this.predictionSequence = [];
        this.waitCount = 0;
        this.previousResults = [];
    }

    predict() {
        if (this.phase === 1) {
            if (this.previousResults.length < 3) {
                return "WAIT";
            }
            if (this.waitCount > 0) {
                this.waitCount--;
                return "WAIT";
            }
            if (this.predictionSequence.length > 0) {
                return this.predictionSequence.shift();
            }
            return this.previousResults[this.previousResults.length - 1];
        } else if (this.phase === 2) {
            if (this.previousResults.length < 2) {
                return "WAIT";
            }
            if (this.predictionSequence.length > 0) {
                return this.predictionSequence.shift();
            }
            const [secondLast, last] = this.previousResults.slice(-2);
            if (secondLast === 'P' && last === 'P') {
                this.predictionSequence = ['P', 'B', 'B', 'B'];
            } else if (secondLast === 'B' && last === 'B') {
                this.predictionSequence = ['B', 'P', 'P', 'P'];
            } else if (secondLast === 'P' && last === 'B') {
                this.predictionSequence = ['P', 'P', 'B', 'P'];
            } else if (secondLast === 'B' && last === 'P') {
                this.predictionSequence = ['B', 'B', 'P', 'B'];
            }
            return this.predictionSequence.shift();
        }
    }

    update(result) {
        if (result === 'T') return;
        this.previousResults.push(result);
        if (this.previousResults.length > 50) {
            this.previousResults.shift();
        }

        if (this.phase === 1) {
            const prediction = this.predict();
            if (prediction === result) {
                this.phase = 1;
                this.waitCount = 1;
                this.predictionSequence = [];
            } else {
                this.predictionSequence.push(
                    this.predictionSequence.length < 3
                        ? result
                        : result === 'P'
                        ? 'B'
                        : 'P'
                );
                if (this.predictionSequence.length > 4) {
                    this.phase = 2;
                    this.predictionSequence = [];
                }
            }
        } else if (this.phase === 2) {
            const prediction = this.predict();
            if (prediction === result) {
                this.phase = 1;
                this.predictionSequence = [];
            }
        }
    }
}

strategies['Sliced Bread 🥖'] = new SlicedBreadStrategy();

let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;

// Functions to record results, delete hands, recalculate stats, update displays, export, and toggle mobile view
// (continued as full code...)
function recordResult(result) {
    history.push(result);
    recalculateStats();
    updateDisplay();
}

function deleteLastHand() {
    if (history.length === 0) return;

    history.pop();
    recalculateStats();
    updateDisplay();
}

function recalculateStats() {
    // Reset counts and strategies
    playerCount = 0;
    bankerCount = 0;
    tieCount = 0;

    for (const strategy in strategies) {
        strategies[strategy].resetStats();
    }

    // Recalculate stats from history
    for (const result of history) {
        if (result === 'P') playerCount++;
        if (result === 'B') bankerCount++;
        if (result === 'T') tieCount++;

        for (const strategy in strategies) {
            strategies[strategy].update(result);
        }
    }
}

function updateDisplay() {
    updateHistory();
    updatePredictions();
    updateStrategyStats();
    updateCountBoxes();
    updateMobileView(); // Ensure mobile view updates in real-time
}

function updateHistory() {
    const handResults = document.getElementById('hand-results');
    handResults.innerHTML = '';

    // Display all hands
    history.forEach((result, index) => {
        handResults.innerHTML += `<p>Hand ${index + 1}: ${result}</p>`;
    });
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

    let highestWinRate = 0;
    let lowestWinRate = 100;
    let highestWinRateStrategy = null;
    let lowestWinRateStrategy = null;

    // First, find the highest and lowest win rates
    for (const strategy in strategies) {
        const stats = strategies[strategy].getStats();
        const winRate = parseFloat(stats.winRate);

        if (winRate > highestWinRate) {
            highestWinRate = winRate;
            highestWinRateStrategy = strategy;
        }

        if (winRate < lowestWinRate) {
            lowestWinRate = winRate;
            lowestWinRateStrategy = strategy;
        }
    }

    // Apply colors based on win rates
    for (const strategy in strategies) {
        const stats = strategies[strategy].getStats();
        const winRateColor = strategy === highestWinRateStrategy ? 'yellow' : strategy === lowestWinRateStrategy ? 'orange' : 'white';
        const predictionColor = stats.currentWinStreak === Math.max(...Object.values(strategies).map(s => s.getStats().currentWinStreak)) && stats.currentWinStreak > 0 ? 'green' : 'black';

        statsHTML += `
            <div>
                <h3 style="color: ${winRateColor};">${strategies[strategy].name}</h3>
                <p>Wins: ${stats.wins}</p>
                <p>Losses: ${stats.losses}</p>
                <p style="color: ${winRateColor};">Win Rate: ${stats.winRate}%</p>
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
    document.getElementById('player-count-box').innerText = playerCount;
    document.getElementById('banker-count-box').innerText = bankerCount;
    document.getElementById('tie-count-box').innerText = tieCount;
}

function toggleMobileView() {
    const desktopView = document.getElementById('strategy-stats');
    const mobileView = document.getElementById('strategy-stats-mobile');

    if (desktopView.style.display === 'none') {
        desktopView.style.display = 'flex';
        mobileView.style.display = 'none';
    } else {
        desktopView.style.display = 'none';
        mobileView.style.display = 'block';
        updateMobileView();
    }
}

function updateMobileView() {
    const strategyStatsMobile = document.getElementById('strategy-stats-mobile');
    let tableHTML = `<table><thead><tr><th>Strategy</th><th>Wins</th><th>Losses</th><th>Win Rate</th><th>Loss Rate</th><th>Max Win Streak</th><th>Max Loss Streak</th><th>Current Win Streak</th><th>Current Loss Streak</th><th>Next Prediction</th></tr></thead><tbody>`;

    for (const strategy in strategies) {
        const stats = strategies[strategy].getStats();
        tableHTML += `
            <tr>
                <td>${strategies[strategy].name}</td>
                <td>${stats.wins}</td>
                <td>${stats.losses}</td>
                <td>${stats.winRate}%</td>
                <td>${stats.lossRate}%</td>
                <td>${stats.maxWinStreak}</td>
                <td>${stats.maxLossStreak}</td>
                <td>${stats.currentWinStreak}</td>
                <td>${stats.currentLossStreak}</td>
                <td>${stats.prediction}</td>
            </tr>
        `;
    }

    tableHTML += `</tbody></table>`;
    strategyStatsMobile.innerHTML = tableHTML;
}

// Export to Spreadsheet
function exportToSpreadsheet() {
    const wb = XLSX.utils.book_new();

    // Add hand results to the spreadsheet
    const handResultsData = history.map((result, index) => ({
        'Hand Number': index + 1,
        'Result': result
    }));
    const handResultsSheet = XLSX.utils.json_to_sheet(handResultsData);
    XLSX.utils.book_append_sheet(wb, handResultsSheet, 'Hand Results');

    // Add strategy stats to the spreadsheet
    const strategyStatsData = Object.keys(strategies).map(strategy => {
        const stats = strategies[strategy].getStats();
        return {
            'Strategy': strategy,
            'Wins': stats.wins,
            'Losses': stats.losses,
            'Win Rate (%)': stats.winRate,
            'Loss Rate (%)': stats.lossRate,
            'Max Win Streak': stats.maxWinStreak,
            'Max Loss Streak': stats.maxLossStreak,
            'Current Win Streak': stats.currentWinStreak,
            'Current Loss Streak': stats.currentLossStreak
        };
    });
    const strategyStatsSheet = XLSX.utils.json_to_sheet(strategyStatsData);
    XLSX.utils.book_append_sheet(wb, strategyStatsSheet, 'Strategy Stats');

    // Export the workbook
    XLSX.writeFile(wb, 'Baccarat_Results_Strategy_Stats.xlsx');
}

// Dark Mode Toggle
document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
