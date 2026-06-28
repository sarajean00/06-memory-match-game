/* ============================================
   EMOJI MEMORY MATCH GAME - JAVASCRIPT
   Complete game logic with Fisher-Yates
   shuffling, state management, and animations
   ============================================ */

/* ============================================
   1. GAME STATE OBJECT
   Tracks all game variables and data
   ============================================ */

const gameState = {
    // Array of emoji pairs (8 unique pairs = 16 cards total)
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    
    // Game board cards with shuffle
    cards: [],
    
    // Tracks cards currently flipped by the player
    flippedCards: [],
    
    // Tracks cards that have been matched
    matchedPairs: 0,
    
    // Total number of moves made
    moves: 0,
    
    // Elapsed time in seconds
    elapsedTime: 0,
    
    // Game active state (false during match checking)
    isGameActive: true,
    
    // Timer interval ID for cleanup
    timerInterval: null
};

/* ============================================
   2. FISHER-YATES SHUFFLING ALGORITHM
   Shuffles array in-place using modern algorithm
   ============================================ */

function shuffleArray(array) {
    // Create a copy to avoid mutating the original
    const shuffled = array.slice();
    
    // Iterate from end to start
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Generate random index from 0 to current index
        const randomIndex = Math.floor(Math.random() * (i + 1));
        
        // Swap current element with random element
        const temp = shuffled[i];
        shuffled[i] = shuffled[randomIndex];
        shuffled[randomIndex] = temp;
    }
    
    return shuffled;
}

/* ============================================
   3. GAME INITIALIZATION
   Creates the game board and sets up DOM
   ============================================ */

function initializeGame() {
    // Clear previous game state
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.elapsedTime = 0;
    gameState.isGameActive = true;
    
    // Create pairs: duplicate each emoji (8 emojis → 16 cards)
    const cardPairs = [...gameState.emojis, ...gameState.emojis];
    
    // Shuffle the pairs using Fisher-Yates algorithm
    gameState.cards = shuffleArray(cardPairs);
    
    // Update the UI
    updateGameBoard();
    updateMoveCounter();
    resetTimer();
    hideVictoryModal();
}

/* ============================================
   4. CREATE AND RENDER GAME BOARD
   Generates card elements dynamically
   ============================================ */

function updateGameBoard() {
    // Get the game board container
    const gameBoard = document.querySelector('.game-board');
    
    // Clear existing cards
    gameBoard.innerHTML = '';
    
    // Create a card element for each emoji in the shuffled array
    for (let i = 0; i < gameState.cards.length; i++) {
        // Create the card wrapper
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('role', 'gridcell');
        card.setAttribute('data-emoji', gameState.cards[i]);
        card.setAttribute('data-index', i);
        
        // Create the card inner (flip container)
        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');
        
        // Create the card front (question mark side)
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        cardFront.textContent = '?';
        
        // Create the card back (emoji side)
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = gameState.cards[i];
        
        // Assemble the card structure
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        // Add click handler to the card
        card.addEventListener('click', handleCardClick);
        
        // Add card to the game board
        gameBoard.appendChild(card);
    }
}

/* ============================================
   5. CARD CLICK HANDLER
   Manages card selection and flip logic
   ============================================ */

function handleCardClick(event) {
    // Get the clicked card element
    const clickedCard = event.currentTarget;
    
    // Get the card's index
    const cardIndex = parseInt(clickedCard.getAttribute('data-index'));
    
    // Do not allow click if:
    // - Game is not active (match checking in progress)
    // - Card is already flipped
    // - Card is already matched
    // - More than 2 cards are flipped
    if (
        !gameState.isGameActive ||
        clickedCard.classList.contains('flipped') ||
        clickedCard.classList.contains('matched') ||
        gameState.flippedCards.length >= 2
    ) {
        return;
    }
    
    // Add flipped class to flip the card
    clickedCard.classList.add('flipped');
    
    // Track this flipped card
    gameState.flippedCards.push({
        index: cardIndex,
        emoji: clickedCard.getAttribute('data-emoji'),
        element: clickedCard
    });
    
    // If two cards are now flipped, check for a match
    if (gameState.flippedCards.length === 2) {
        // Increment move counter
        gameState.moves++;
        updateMoveCounter();
        
        // Prevent further clicks during match checking
        gameState.isGameActive = false;
        
        // Check if the two flipped cards match
        checkForMatch();
    }
}

/* ============================================
   6. MATCH VERIFICATION LOGIC
   Compares two flipped cards and handles result
   ============================================ */

function checkForMatch() {
    // Get the two flipped cards
    const card1 = gameState.flippedCards[0];
    const card2 = gameState.flippedCards[1];
    
    // Check if emojis match
    const isMatch = card1.emoji === card2.emoji;
    
    if (isMatch) {
        // MATCH FOUND: Lock cards face-up permanently
        
        // Delay animation, then mark as matched
        setTimeout(function() {
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            
            // Remove pointer events to prevent re-clicking
            card1.element.style.pointerEvents = 'none';
            card2.element.style.pointerEvents = 'none';
            
            // Increment matched pairs counter
            gameState.matchedPairs++;
            
            // Reset flipped cards array
            gameState.flippedCards = [];
            
            // Allow game to continue
            gameState.isGameActive = true;
            
            // Check if player won
            if (gameState.matchedPairs === gameState.emojis.length) {
                endGame();
            }
        }, 600);
    } else {
        // NO MATCH: Flip cards back face-down after delay
        
        // Add mismatch animation (shake effect)
        card1.element.classList.add('mismatch');
        card2.element.classList.add('mismatch');
        
        // Delay flip-back animation
        setTimeout(function() {
            // Remove flipped class to flip back
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            
            // Remove mismatch animation class
            card1.element.classList.remove('mismatch');
            card2.element.classList.remove('mismatch');
            
            // Reset flipped cards array
            gameState.flippedCards = [];
            
            // Allow game to continue
            gameState.isGameActive = true;
        }, 1000);
    }
}

/* ============================================
   7. TIMER FUNCTIONALITY
   Manages elapsed time display and updates
   ============================================ */

function startTimer() {
    // Start a timer that ticks every second
    gameState.timerInterval = setInterval(function() {
        gameState.elapsedTime++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    // Convert elapsed seconds to MM:SS format
    const minutes = Math.floor(gameState.elapsedTime / 60);
    const seconds = gameState.elapsedTime % 60;
    
    // Format with leading zeros (e.g., 02:05)
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update the timer display element
    const timerElement = document.getElementById('timer');
    timerElement.textContent = timeString;
}

function resetTimer() {
    // Stop existing timer if running
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Reset elapsed time
    gameState.elapsedTime = 0;
    updateTimerDisplay();
    
    // Start a fresh timer
    startTimer();
}

/* ============================================
   8. MOVE COUNTER
   Tracks and displays number of moves
   ============================================ */

function updateMoveCounter() {
    // Get the moves display element
    const movesElement = document.getElementById('moves');
    
    // Update with current move count
    movesElement.textContent = gameState.moves;
}

/* ============================================
   9. VICTORY/END GAME LOGIC
   Displays victory modal and final stats
   ============================================ */

function endGame() {
    // Stop the timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Mark game as inactive
    gameState.isGameActive = false;
    
    // Update victory modal with final stats
    document.getElementById('finalMoves').textContent = gameState.moves;
    
    const minutes = Math.floor(gameState.elapsedTime / 60);
    const seconds = gameState.elapsedTime % 60;
    const finalTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('finalTime').textContent = finalTime;
    
    // Show the victory modal after brief delay (let animations complete)
    setTimeout(function() {
        showVictoryModal();
    }, 600);
}

function showVictoryModal() {
    // Get the victory modal element
    const victoryModal = document.getElementById('victoryModal');
    
    // Add show class to display it
    victoryModal.classList.add('show');
}

function hideVictoryModal() {
    // Get the victory modal element
    const victoryModal = document.getElementById('victoryModal');
    
    // Remove show class to hide it
    victoryModal.classList.remove('show');
}

/* ============================================
   10. RESTART GAME
   Resets everything and starts a new game
   ============================================ */

function restartGame() {
    // Clear any animation classes from existing cards
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(function(card) {
        card.classList.remove('flipped', 'matched', 'mismatch');
        card.style.pointerEvents = 'auto';
    });
    
    // Reset game state and UI
    initializeGame();
}

/* ============================================
   11. EVENT LISTENERS
   Wire up button click handlers
   ============================================ */

function setupEventListeners() {
    // Get restart button elements
    const restartBtn = document.getElementById('restartBtn');
    const victoryRestartBtn = document.getElementById('victoryRestartBtn');
    
    // Add click handler to restart button
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    // Add click handler to victory modal restart button
    if (victoryRestartBtn) {
        victoryRestartBtn.addEventListener('click', function() {
            restartGame();
        });
    }
}

/* ============================================
   12. APPLICATION INITIALIZATION
   Run on page load to start the game
   ============================================ */

// Wait for DOM to load before initializing game
document.addEventListener('DOMContentLoaded', function() {
    // Set up all event listeners
    setupEventListeners();
    
    // Initialize the game board
    initializeGame();
});
