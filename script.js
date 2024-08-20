let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;

function recordResult(result) {
    history.push(result);
    updateCounts(result);
    updateHistoryTable();
    updatePredictions();
    updateChart();
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
