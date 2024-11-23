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

// Updated "Sliced Bread 🥖" Strategy with Debugging Logs
class SlicedBreadStrategy extends Strategy {
    constructor() {
        super('Sliced Bread 🥖', [], true);
        this.phase = 1; // Start in Phase 1
        this.predictionSequence = []; // Holds the current predictions
        this.waitCount = 0; // Tracks how many hands to wait
        this.previousResults = []; // Tracks the history of results for the strategy
    }

    predict() {
        console.log("Phase:", this.phase, "Wait Count:", this.waitCount, "Previous Results:", this.previousResults);
        if (this.phase === 1) {
            if (this.previousResults.length < 3) {
                console.log("Phase 1: WAIT for 3 results");
                return "WAIT"; // Waiting for the first 3 results
            }
            if (this.waitCount > 0) {
                console.log("Phase 1: WAIT after a win");
                this.waitCount--;
                return "WAIT"; // Wait for 1 hand after a win
            }
            console.log("Phase 1: Predicting last result:", this.previousResults[this.previousResults.length - 1]);
            return this.previousResults[this.previousResults.length - 1]; // Default prediction: repeat last result
        } else if (this.phase === 2) {
            console.log("Phase 2: Generating 4-bet sequence");
            if (this.previousResults.length < 2) {
                console.log("Phase 2: WAIT for 2 results");
                return "WAIT"; // Waiting for 2 results to generate the sequence
            }
            if (this.predictionSequence.length > 0) {
                console.log("Phase 2: Predicting from sequence:", this.predictionSequence[0]);
                return this.predictionSequence[0]; // Use the current prediction
            }

            const [secondLast, last] = this.previousResults.slice(-2);
            console.log("Last two results:", secondLast, last);
            if (secondLast === 'P' && last === 'P') {
                this.predictionSequence = ['P', 'B', 'B', 'B'];
            } else if (secondLast === 'B' && last === 'B') {
                this.predictionSequence = ['B', 'P', 'P', 'P'];
            } else if (secondLast === 'P' && last === 'B') {
                this.predictionSequence = ['P', 'P', 'B', 'P'];
            } else if (secondLast === 'B' && last === 'P') {
                this.predictionSequence = ['B', 'B', 'P', 'B'];
            }
            console.log("Generated sequence:", this.predictionSequence);
            return this.predictionSequence[0];
        }
    }

    update(result) {
        console.log("Updating with result:", result);
        if (result === 'T') {
            console.log("Ignoring tie");
            return; // Ignore ties
        }

        this.previousResults.push(result);
        console.log("Previous results updated:", this.previousResults);

        if (this.previousResults.length > 50) {
            this.previousResults.shift(); // Prevent memory overflow
        }

        const prediction = this.predict();
        console.log("Current prediction:", prediction);

        if (this.phase === 1) {
            if (this.previousResults.length >= 3) {
                if (prediction === result) {
                    console.log("Phase 1: Win detected");
                    this.wins++;
                    this.currentWinStreak++;
                    this.currentLossStreak = 0;
                    this.maxWinStreak = Math.max(this.maxWinStreak, this.currentWinStreak);
                    this.waitCount = 1; // Enter "WAIT" state for 1 hand after a win
                } else if (prediction !== "WAIT") {
                    console.log("Phase 1: Loss detected");
                    this.losses++;
                    this.currentLossStreak++;
                    this.currentWinStreak = 0;
                    this.maxLossStreak = Math.max(this.maxLossStreak, this.currentLossStreak);

                    if (this.predictionSequence.length < 3) {
                        this.predictionSequence.push(result);
                    } else {
                        this.predictionSequence = [result === 'P' ? 'B' : 'P'];
                        this.phase = 2; // Transition to Phase 2
                        console.log("Transitioning to Phase 2");
                    }
                }
            }
        } else if (this.phase === 2) {
            if (prediction === result) {
                console.log("Phase 2: Win detected");
                this.wins++;
                this.currentWinStreak++;
                this.currentLossStreak = 0;
                this.maxWinStreak = Math.max(this.maxWinStreak, this.currentWinStreak);
                this.phase = 1; // Reset to Phase 1 after a win
                this.predictionSequence = [];
            } else if (prediction !== "WAIT") {
                console.log("Phase 2: Loss detected");
                this.losses++;
                this.currentLossStreak++;
                this.currentWinStreak = 0;
                this.maxLossStreak = Math.max(this.maxLossStreak, this.currentLossStreak);
                this.predictionSequence.shift(); // Remove the current prediction

                if (this.predictionSequence.length === 0) {
                    this.phase = 1; // Reset to Phase 1 if sequence is exhausted
                    console.log("Phase 2 sequence exhausted. Resetting to Phase 1");
                }
            }
        }
    }
}

strategies['Sliced Bread 🥖'] = new SlicedBreadStrategy();
let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;

function recordResult(result) {
    console.log("Recording result:", result);
    history.push(result);
    recalculateStats();
    updateDisplay();
}

function deleteLastHand() {
    if (history.length === 0) {
        console.log("No hands to delete");
        return;
    }
    console.log("Deleting last hand:", history[history.length - 1]);
    history.pop();
    recalculateStats();
    updateDisplay();
}

function recalculateStats() {
    console.log("Recalculating stats...");
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
    console.log("Stats recalculated:", {
        playerCount,
        bankerCount,
        tieCount
    });
}

function updateDisplay() {
    console.log("Updating display...");
    updateHistory();
    updatePredictions();
    updateStrategyStats();
    updateCountBoxes();
    updateMobileView();
}

function updateHistory() {
    const handResults = document.getElementById('hand-results');
    handResults.innerHTML = '';

    history.forEach((result, index) => {
        handResults.innerHTML += `<p>Hand ${index + 1}: ${result}</p>`;
    });
    console.log("Hand results updated");
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
    console.log("Predictions updated");
}

function updateStrategyStats() {
    const strategyStats = document.getElementById('strategy-stats');
    let statsHTML = '';

    let highestWinRate = 0;
    let lowestWinRate = 100;
    let highestWinRateStrategy = null;
    let lowestWinRateStrategy = null;

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
    console.log("Strategy stats updated");
}

function updateCountBoxes() {
    document.getElementById('player-count-box').innerText = playerCount;
    document.getElementById('banker-count-box').innerText = bankerCount;
    document.getElementById('tie-count-box').innerText = tieCount;
    console.log("Count boxes updated:", {
        playerCount,
        bankerCount,
        tieCount
    });
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
    console.log("Mobile view toggled");
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
    console.log("Mobile view stats updated");
}

function exportToSpreadsheet() {
    const wb = XLSX.utils.book_new();

    const handResultsData = history.map((result, index) => ({
        'Hand Number': index + 1,
        'Result': result
    }));
    const handResultsSheet = XLSX.utils.json_to_sheet(handResultsData);
    XLSX.utils.book_append_sheet(wb, handResultsSheet, 'Hand Results');

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

    XLSX.writeFile(wb, 'Baccarat_Results_Strategy_Stats.xlsx');
    console.log("Spreadsheet exported");
}

document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    console.log("Dark mode toggled");
});
