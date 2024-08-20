console.log("Script is loaded");

let history = [];
let playerCount = 0;
let bankerCount = 0;
let tieCount = 0;

let strategyPerformance = {
    'The Cake': { wins: 0, losses: 0 },
    'ZachFortune': { wins: 0, losses: 0 },
    'Mr. Toad': { wins: 0, losses: 0 },
    'The Marcos': { wins: 0, losses: 0 }
};

function updatePredictions(predictions) {
    console.log("Updating predictions:", predictions);
    const predictionResults = document.getElementById('prediction-results');
    if (!predictionResults) {
        console.error("Element #prediction-results not found");
        return;
    }
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

    console.log("Predictions calculated:", predictions);
    return predictions;
}

// Initial call to ensure predictions show up on page load
updatePredictions(predictNextHand());
