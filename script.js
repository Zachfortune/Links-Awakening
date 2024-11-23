class Strategy {
    constructor(name, sequence, isConditional = false) {
        this.name = name;
        this.sequence = sequence;
        this.isConditional = isConditional; // Whether the strategy has a conditional start
        this.isReady = !isConditional; // Default to ready unless conditional
        this.resetStats();
    }

    predict() {
        if (this.isConditional && !this.isReady) {
            return "WAIT"; // Show "WAIT" if the strategy is not ready
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
            this.isReady = true; // Non-conditional strategies should always be ready
        } else {
            this.isReady = false; // Conditional strategies start in "WAIT"
        }
    }

    update(result) {
        if (result === "T") return; // Ignore ties

        if (this.isReady && this.predict() === result) {
            this.wins++;
            this.currentWinStreak++;
            this.currentLossStreak = 0;
            if (this.currentWinStreak > this.maxWinStreak) {
                this.maxWinStreak = this.currentWinStreak;
            }
            this.position = 0; // Reset sequence position after a win
        } else if (this.isReady) {
            this.losses++;
            this.currentLossStreak++;
            this.currentWinStreak = 0;
            if (this.currentLossStreak > this.maxLossStreak) {
                this.maxLossStreak = this.currentLossStreak;
            }
            this.position = (this.position + 1) % this.sequence.length; // Move to the next prediction
        }
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

class SlicedBread extends Strategy {
    constructor() {
        super("Sliced Bread 🥖", [], true); // Conditional start with WAIT state
        this.phase = 1; // Start in Phase 1
        this.waitingHands = [];
        this.predictions = [];
        this.sequence = [];
    }

    predict() {
        if (!this.isReady) {
            return "WAIT"; // Still in the WAIT state
        }

        if (this.phase === 1) {
            const lastHand = this.waitingHands[this.waitingHands.length - 1];
            if (this.predictions.length < 3) {
                return lastHand; // Predict the last outcome
            } else {
                return lastHand === "P" ? "B" : "P"; // Opposite for the fourth prediction
            }
        } else if (this.phase === 2) {
            return this.sequence[this.position]; // Predict based on the current sequence
        }
        return "WAIT";
    }

    update(result) {
        if (result === "T") return; // Ignore ties

        // Handle WAIT state
        if (!this.isReady) {
            this.waitingHands.push(result);

            if (this.phase === 1 && this.waitingHands.length >= 3) {
                this.isReady = true; // Ready after observing 3 hands in Phase 1
            } else if (this.phase === 2 && this.waitingHands.length >= 2) {
                const sequenceMap = {
                    "PP": ["P", "B", "B", "B"],
                    "BB": ["B", "P", "P", "P"],
                    "PB": ["P", "P", "B", "P"],
                    "BP": ["B", "B", "P", "B"],
                };
                const key = this.waitingHands.slice(-2).join("");
                this.sequence = sequenceMap[key] || [];
                this.position = 0; // Reset sequence position
                this.isReady = true; // Ready after observing 2 hands in Phase 2
            }
            return;
        }

        // Phase 1 Logic
        if (this.phase === 1) {
            this.waitingHands.push(result); // Always track the most recent input
            if (this.waitingHands.length > 3) {
                this.waitingHands.shift(); // Maintain sliding window of 3
            }

            if (this.predict() === result) {
                // Correct prediction
                this.predictions = [];
                this.waitingHands = [result];
                this.isReady = false; // Wait for 1 hand before predicting again
            } else {
                this.predictions.push(result);
                if (this.predictions.length >= 4) {
                    // Transition to Phase 2 after 4 failed predictions
                    this.phase = 2;
                    this.waitingHands = [];
                    this.isReady = false; // Wait for 2 hands in Phase 2
                }
            }
        }

        // Phase 2 Logic
        else if (this.phase === 2) {
            this.waitingHands.push(result); // Always track the most recent input
            if (this.waitingHands.length > 2) {
                this.waitingHands.shift(); // Maintain sliding window of 2
            }

            if (this.predict() === result) {
                // Win in Phase 2
                this.phase = 1;
                this.waitingHands = [result];
                this.predictions = [];
                this.isReady = false; // Wait for 3 hands in Phase 1
            } else {
                this.position = (this.position + 1) % this.sequence.length;
                if (this.position === 0) {
                    // Sequence exhausted, reset to Phase 1
                    this.phase = 1;
                    this.waitingHands = [];
                    this.predictions = [];
                    this.isReady = false; // Wait for 3 hands in Phase 1
                }
            }
        }
    }

    resetStats() {
        super.resetStats();
        this.phase = 1;
        this.waitingHands = [];
        this.predictions = [];
        this.sequence = [];
    }
}

const strategies = {
    'The Gentleman': new Strategy('The Gentleman', ['B', 'P', 'B', 'P']),
    'Mr. Miyagi': new Strategy('Mr. Miyagi', ['P', 'P', 'P', 'B', 'B', 'P', 'P', 'P']),
    'Animal Style': new Strategy('Animal Style', ['B', 'B', 'B', 'B', 'P', 'P', 'P', 'P']),
    'Karate Chop': new Strategy('Karate Chop', ['B', 'P', 'B', 'P', 'B', 'P', 'B', 'P']),
    'Snoop Dogg': new Strategy('Snoop Dogg', ['P', 'P', 'B', 'P', 'P', 'B', 'P', 'B', 'B']),
    'The Safe Bet': new Strategy('The Safe Bet', ['P', 'P', 'B', 'B']),
    'The Trend Follower': new Strategy('The Trend Follower', ['P', 'P', 'P', 'B', 'B']),
    'The Reversal': new Strategy('The Reversal', ['B', 'P', 'P', 'B']),
    'The Pincer': new Strategy('The Pincer', ['B', 'P', 'P', 'B', 'B', 'P']),
    'The Edge Case': new Strategy('The Edge Case', ['P', 'B', 'P', 'P', 'B', 'P', 'B']),
    'Grand Theft Auto': new Strategy('Grand Theft Auto', ['B', 'B', 'P'], true), // Conditional strategy
    'Sliced Bread 🥖': new SlicedBread()
};

let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;

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
    playerCount = 0;
    bankerCount = 0;
    tieCount = 0;

    for (const strategy in strategies) {
        strategies[strategy].resetStats();
    }

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
}

function updateHistory() {
    const handResults = document.getElementById('hand-results');
    handResults.innerHTML = '';

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
                <p>Next Prediction: ${stats.prediction}</p>
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
}

document.getElementById('toggle-dark-mode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
