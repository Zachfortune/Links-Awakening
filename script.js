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
    updateCountBoxes(); // Update the count boxes

    if (history.length === 0) {
        fullResetAllStrategies();
        playerCount = 0;
        bankerCount = 0;
        tieCount = 0;
        updateChart();
        updateStrategyStats();
        updatePredictions();
        updateCountBoxes(); // Reseet the count boxes
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
    const tableBody = document.getElement
