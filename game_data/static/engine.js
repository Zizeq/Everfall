// engine.js
let typingTimeout = null;

function typeWriter(text, onComplete) {
    const dialogueTextElement = document.getElementById('dialogue-text');
    let i = 0;
    dialogueTextElement.textContent = '';
    gameState.isTyping = true;
    dialogueTextElement.classList.remove('unseen-dialogue');

    function type() {
        if (gameState.skipTypingRequest || gameState.typingSpeed === 0) {
            dialogueTextElement.textContent = text;
            gameState.isTyping = false;
            gameState.skipTypingRequest = false;
            onComplete();
            return;
        }
        if (i < text.length) {
            dialogueTextElement.textContent += text.charAt(i);
            i++;
            typingTimeout = setTimeout(type, gameState.typingSpeed);
        } else {
            gameState.isTyping = false;
            onComplete();
        }
    }
    type();
}

function displayDialogue(speaker, text) {
    const nameBoxElement = document.getElementById('name-box');
    const dialogueBoxElement = document.getElementById('dialogue-box');
    const continuePromptElement = document.getElementById('continue-prompt');

    nameBoxElement.textContent = speaker;
    dialogueBoxElement.className = 'dialogue-box'; // Reset classes
    const charData = Object.values(assets.characters).find(char => char.name === speaker);
    dialogueBoxElement.classList.add(charData?.dialog_color_class || 'general-dialogue');
    
    continuePromptElement.style.display = 'none';
    typeWriter(text, () => {
        continuePromptElement.style.display = 'block';
        gameState.waitingForInput = true;
        if (gameState.autoAdvanceSpeed > 0) {
            startAutoAdvance();
        }
    });
}

function displayChoices(choices) {
    const choicesContainerElement = document.getElementById('choices-container');
    choicesContainerElement.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        button.textContent = choice.text;
        if (gameState.highlightChoices && gameState.previouslyChosenChoices.has(choice.id)) {
            button.classList.add('previously-chosen');
        }
        button.onclick = () => handleChoice(choice);
        choicesContainerElement.appendChild(button);
    });
    choicesContainerElement.classList.add('visible');
    choicesContainerElement.style.display = 'flex';
    gameState.waitingForInput = true;
    stopAutoAdvance();
}

function hideChoices() {
    const choicesContainerElement = document.getElementById('choices-container');
    choicesContainerElement.classList.remove('visible');
    choicesContainerElement.style.display = 'none';
    choicesContainerElement.innerHTML = '';
    gameState.waitingForInput = false;
}

function handleChoice(choice) {
    const story = getStoryData(assets);
    hideChoices();
    availableChoices.add(choice.id);
    gameState.previouslyChosenChoices.add(choice.id);
    saveGameDataToStorage();
    const nextIndex = story.findIndex(s => s.id === choice.next);
    if (nextIndex !== -1) {
        gameState.currentStoryIndex = nextIndex;
        processStoryPoint();
    }
}

function processStoryPoint() {
    const story = getStoryData(assets);
    const backgroundMusic = document.getElementById('background-music');
    const gameContainer = document.getElementById('game-container');

    if (gameState.isOverlayOpen) return;
    if (typingTimeout) clearTimeout(typingTimeout);
    updateHistoryButtons();
    if (gameState.currentStoryIndex >= story.length) {
        showEndScreen();
        return;
    }

    const point = story[gameState.currentStoryIndex];
    gameState.waitingForInput = false;
    stopAutoAdvance();

    if (point.type === 'character' || point.type === 'narration') {
        gameState.seenDialogue.add(`${point.speaker || 'Narration'}:${point.text}`);
    }

    const advanceAndProcess = () => {
        gameState.currentStoryIndex++;
        processStoryPoint();
    };

    switch (point.type) {
        case 'background':
            updateBackground(point.src, point.fade);
            if (point.play_music) {
                const track = assets.musicTracks[point.play_music];
                if(track) {
                    backgroundMusic.src = track.url;
                    backgroundMusic.volume = gameState.musicVolume;
                    backgroundMusic.play().catch(e => console.log('Music play prevented:', e));
                    gameState.unlockedTracks.add(track.id);
                }
            }
            if (point.pause_music) backgroundMusic.pause();
            updateMusicToggleButton();
            advanceAndProcess();
            break;
        case 'sprite_action':
            updateCharacterSprite(point.character, point.action, point.position, point.emotion);
            advanceAndProcess();
            break;
        case 'name':
            gameState.currentSpeaker = point.name;
            advanceAndProcess();
            break;
        case 'character':
            if (point.name) {
                gameState.currentSpeaker = point.name;
            }
            
            gameState.currentDialogueText = point.text;
            gameState.dialogueHistory.push({ speaker: gameState.currentSpeaker, text: point.text, type: 'character' });
            gameState.dialogueHistoryPointer = gameState.dialogueHistory.length - 1;
            
            displayDialogue(gameState.currentSpeaker, point.text);
            break;
        case 'narration':
            gameState.currentSpeaker = '';
            gameState.currentDialogueText = point.text;
            gameState.dialogueHistory.push({ speaker: 'Narration', text: point.text, type: 'narration' });
            gameState.dialogueHistoryPointer = gameState.dialogueHistory.length - 1;
            displayDialogue('Narration', point.text);
            break;
        case 'choices':
            displayChoices(point.choices);
            break;
        case 'action':
            handleGameAction(point.action, point);
            advanceAndProcess();
            break;
        case 'transition':
            updateCharacterSprite(null, 'hide-all');
            gameContainer.style.opacity = 0;
            setTimeout(() => {
                gameContainer.style.opacity = 1;
                gameState.currentStoryIndex = story.findIndex(s => s.id === point.next);
                processStoryPoint();
            }, 1000);
            break;
        case 'end':
            if(point.achievement_id) unlockAchievement(point.achievement_id);
            showEndScreen();
            break;
        case 'wait':
            setTimeout(advanceAndProcess, point.duration);
            break;
        default:
            advanceAndProcess();
    }
}

function handleGameAction(actionType, data) {
    const affectionIndicator = document.getElementById('affection-indicator');
    switch (actionType) {
        case 'increaseAffection':
            if (gameState.characterAffection[data.character] !== undefined) {
                gameState.characterAffection[data.character] += data.amount;
                showNotification(`${assets.characters[data.character].name} affection +${data.amount}`);
                affectionIndicator.classList.remove('show-heart');
                void affectionIndicator.offsetWidth; // Trigger reflow
                affectionIndicator.classList.add('show-heart');
            }
            break;
        case 'unlockCharacter':
            if (!gameState.unlockedCharacters.has(data.character)) {
                gameState.unlockedCharacters.add(data.character);
                showNotification(`${assets.characters[data.character].name}'s notes unlocked!`);
            }
            break;
        case 'gainItem':
            gameState.inventory.add(data.item);
            showNotification(`Gained: ${assets.items[data.item].name}!`);
            break;
        case 'unlockCG':
            if (!gameState.unlockedCGs.has(data.cgId)) {
                gameState.unlockedCGs.add(data.cgId);
                showNotification(`New CG Unlocked: ${assets.cgs[data.cgId].title}`);
                saveGameDataToStorage();
            }
            break;
        case 'unlockMapLocation':
            if (!gameState.unlockedMapLocations.has(data.locationId)) {
                gameState.unlockedMapLocations.add(data.locationId);
                showNotification(`New Location Unlocked: ${assets.mapLocations[data.locationId].name}`);
                saveGameDataToStorage();
            }
            break;
        case 'learnRecipe':
                if (!gameState.unlockedRecipes.has(data.recipeId)) {
                gameState.unlockedRecipes.add(data.recipeId);
                showNotification(`New Recipe Learned: ${assets.recipes[data.recipeId].name}`);
                saveGameDataToStorage();
            }
            break;
    }
}

function proceedStory() {
    const choicesContainerElement = document.getElementById('choices-container');
    if (gameState.isTyping) {
        gameState.skipTypingRequest = true;
        return;
    }
    if (choicesContainerElement.classList.contains('visible') || gameState.isOverlayOpen) return;
    
    gameState.currentStoryIndex++;
    processStoryPoint();
}

function startAutoAdvance() {
    if (gameState.autoAdvanceSpeed > 0) {
        stopAutoAdvance();
        const delay = (11 - gameState.autoAdvanceSpeed) * 1000;
        gameState.autoAdvanceTimeoutId = setTimeout(proceedStory, delay);
    }
}

function stopAutoAdvance() {
    if (gameState.autoAdvanceTimeoutId) {
        clearTimeout(gameState.autoAdvanceTimeoutId);
        gameState.autoAdvanceTimeoutId = null;
    }
}

function updateHistoryButtons() {
    const prevDialogueButton = document.getElementById('prev-dialogue-button');
    const nextDialogueButton = document.getElementById('next-dialogue-button');
    prevDialogueButton.disabled = gameState.dialogueHistoryPointer <= 0;
    nextDialogueButton.disabled = gameState.dialogueHistoryPointer >= gameState.dialogueHistory.length - 1;
}

function showDialogueFromHistory(index) {
    const nameBoxElement = document.getElementById('name-box');
    const dialogueTextElement = document.getElementById('dialogue-text');
    const continuePromptElement = document.getElementById('continue-prompt');
    const dialogueBoxElement = document.getElementById('dialogue-box');

    if (index >= 0 && index < gameState.dialogueHistory.length) {
        const entry = gameState.dialogueHistory[index];
        nameBoxElement.textContent = entry.speaker;
        dialogueTextElement.textContent = entry.text;
        continuePromptElement.style.display = 'none';
        dialogueBoxElement.className = 'dialogue-box';
        const charData = Object.values(assets.characters).find(char => char.name === entry.speaker);
        dialogueBoxElement.classList.add(charData?.dialog_color_class || 'general-dialogue');
        gameState.dialogueHistoryPointer = index;
        updateHistoryButtons();
    }
}

function unlockAchievement(id) {
    if(!gameState.unlockedAchievements.has(id)) {
        gameState.unlockedAchievements.add(id);
        showNotification(`Achievement Unlocked: ${assets.achievements[id].title}`);
        saveGameDataToStorage();
    }
}

function showEndScreen() {
    gameState.isGameActive = false;
    showCustomMessageBox('The End', 'Thank you for playing Everfall.', [{
        text: 'Return to Main Menu',
        action: () => switchScreen('main-menu')
    }]);
}