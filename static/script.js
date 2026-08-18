// ============================================
// EMOTION DETECTION APP - JAVASCRIPT
// ============================================

// DOM Elements
const emotionInput = document.getElementById('emotion-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resultSection = document.getElementById('result-section');
const emptyState = document.getElementById('empty-state');
const errorContainer = document.getElementById('error-message');
const charCurrentSpan = document.getElementById('char-current');
const newAnalysisBtn = document.getElementById('new-analysis-btn');

// Emotion configuration
const emotionConfig = {
    sadness: {
        emoji: '😭',
        color: '#3b82f6'
    },
    joy: {
        emoji: '😁',
        color: '#f59e0b'
    },
    love: {
        emoji: '❤️',
        color: '#ec4899'
    },
    anger: {
        emoji: '😠',
        color: '#ef4444'
    },
    fear: {
        emoji: '😨',
        color: '#8b5cf6'
    },
    surprise: {
        emoji: '😮',
        color: '#06b6d4'
    }
};

// ============================================
// EVENT LISTENERS
// ============================================

emotionInput.addEventListener('input', updateCharCount);
analyzeBtn.addEventListener('click', handleAnalyze);
newAnalysisBtn.addEventListener('click', resetForm);
emotionInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleAnalyze();
    }
});

// ============================================
// CHARACTER COUNT
// ============================================

function updateCharCount() {
    const length = emotionInput.value.length;
    charCurrentSpan.textContent = length;
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleAnalyze() {
    const text = emotionInput.value.trim();

    // Validation
    if (!text) {
        showError('Please enter some text to analyze');
        return;
    }

    if (text.length < 1 || text.length > 2000) {
        showError('Text must be between 1 and 2000 characters');
        return;
    }

    hideError();
    setButtonLoading(true);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            if (response.status === 503) {
                throw new Error('Model is loading. Please try again in a moment.');
            } else if (response.status === 422) {
                throw new Error('Invalid input. Please check your text and try again.');
            } else {
                throw new Error('Failed to analyze emotion. Please try again.');
            }
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showError(error.message || 'An error occurred. Please try again.');
    } finally {
        setButtonLoading(false);
    }
}

// ============================================
// DISPLAY RESULTS
// ============================================

function displayResults(data) {
    // Hide empty state
    emptyState.style.display = 'none';

    // Update main emotion
    const emotionEmoji = document.getElementById('emotion-emoji');
    const emotionName = document.getElementById('emotion-name');
    const confidencePercent = document.getElementById('confidence-percent');
    const confidenceFill = document.getElementById('confidence-fill');
    const analyzedText = document.getElementById('analyzed-text');

    const emotionLower = data.predicted_emotion.toLowerCase();
    const config = emotionConfig[emotionLower];

    emotionEmoji.textContent = config.emoji;
    emotionName.textContent = data.predicted_emotion;
    const confidence = Math.round(data.confidence * 100);
    confidencePercent.textContent = confidence;
    confidenceFill.style.width = confidence + '%';
    analyzedText.textContent = data.text;

    // Display emotion breakdown
    displayEmotionBreakdown(data.all_probabilities);

    // Show result section
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function displayEmotionBreakdown(probabilities) {
    const emotionsList = document.getElementById('emotions-list');
    emotionsList.innerHTML = '';

    // Sort emotions by probability (descending)
    const sortedEmotions = Object.entries(probabilities)
        .sort(([, a], [, b]) => b - a);

    sortedEmotions.forEach(([emotion, probability], index) => {
        const config = emotionConfig[emotion.toLowerCase()];
        const percentage = Math.round(probability * 100);

        const emotionItem = document.createElement('div');
        emotionItem.className = 'emotion-item';
        emotionItem.style.animation = `slideUp 0.3s ease-out ${index * 50}ms both`;

        emotionItem.innerHTML = `
            <div class="emotion-item-emoji">${config.emoji}</div>
            <div class="emotion-item-label">${emotion}</div>
            <div class="emotion-item-bar">
                <div class="emotion-item-fill" 
                     style="background: ${config.color}; width: ${percentage}%;"
                ></div>
            </div>
            <div class="emotion-item-percent">${percentage}%</div>
        `;

        emotionsList.appendChild(emotionItem);
    });
}

// ============================================
// ERROR HANDLING
// ============================================

function showError(message) {
    const errorText = document.getElementById('error-text');
    errorText.textContent = message;
    errorContainer.style.display = 'block';
}

function hideError() {
    errorContainer.style.display = 'none';
}

// ============================================
// BUTTON STATES
// ============================================

function setButtonLoading(isLoading) {
    analyzeBtn.disabled = isLoading;

    if (isLoading) {
        analyzeBtn.classList.add('loading');
    } else {
        analyzeBtn.classList.remove('loading');
    }
}

// ============================================
// RESET FORM
// ============================================

function resetForm() {
    emotionInput.value = '';
    charCurrentSpan.textContent = '0';
    resultSection.style.display = 'none';
    emptyState.style.display = 'flex';
    hideError();
    emotionInput.focus();
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Set initial focus
    emotionInput.focus();

    // Log API health
    checkHealthStatus();
});

async function checkHealthStatus() {
    try {
        const response = await fetch('/health');
        const data = await response.json();

        if (!data.model_loaded) {
            console.warn('Model is not fully loaded yet');
        }
    } catch (error) {
        console.error('Failed to check API health:', error);
    }
}