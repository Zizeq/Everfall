// state.js
// --- Game State Variables ---
let gameState = {
    currentStoryIndex: 0,
    isGameActive: false,
    typingSpeed: 25,
    skipMode: 'read',
    autoAdvanceSpeed: 0, // 0 is off, 1-10 is speed
    musicVolume: 0.5,
    sfxVolume: 0.75,
    dialogueOpacity: 0.8,
    fontSize: 'normal',
    useDyslexicFont: false,
    highlightChoices: true,
    chosenOutfit: null,
    unlockedCharacters: new Set(['general']),
    dialogueHistory: [],
    dialogueHistoryPointer: -1,
    seenDialogue: new Set(),
    isTyping: false,
    waitingForInput: false,
    skipTypingRequest: false,
    autoAdvanceTimeoutId: null,
    currentDialogueText: '',
    currentSpeaker: '',
    isOverlayOpen: false,

    characterAffection: {
        willow: 0, nova: 0, amaryllis: 0, kelly: 0, ray: 0, clay: 0, fenrir: 0, cerberus: 0, dean: 0,
    },

    inventory: new Set(),
    unlockedAchievements: new Set(),
    previouslyChosenChoices: new Set(),
    unlockedCGs: new Set(),
    unlockedTracks: new Set(),
    unlockedRecipes: new Set(['hearty_stew']),
    unlockedMapLocations: new Set(['everfall_city']),
};

let saveSlots = Array(10).fill(null);
const MAX_SAVE_SLOTS = 10;
const QUICK_SAVE_SLOT_INDEX = MAX_SAVE_SLOTS - 1;
let availableChoices = new Set();
let currentBackground = null;
let currentCharacterSprites = {};

// --- Save / Load Logic ---

function createSaveData(name) {
    const serializableGameState = { ...gameState };
    
    serializableGameState.unlockedCharacters = Array.from(gameState.unlockedCharacters);
    serializableGameState.seenDialogue = Array.from(gameState.seenDialogue);
    serializableGameState.inventory = Array.from(gameState.inventory);
    serializableGameState.unlockedAchievements = Array.from(gameState.unlockedAchievements);
    serializableGameState.previouslyChosenChoices = Array.from(gameState.previouslyChosenChoices);
    serializableGameState.unlockedCGs = Array.from(gameState.unlockedCGs);
    serializableGameState.unlockedTracks = Array.from(gameState.unlockedTracks);
    serializableGameState.unlockedRecipes = Array.from(gameState.unlockedRecipes);
    serializableGameState.unlockedMapLocations = Array.from(gameState.unlockedMapLocations);

    const saveData = {
        name: name,
        timestamp: new Date().toLocaleString(),
        gameState: serializableGameState,
        currentBackground: currentBackground,
        currentCharacterSprites: {},
        currentDialogueText: document.getElementById('dialogue-text').textContent,
        currentSpeaker: document.getElementById('name-box').textContent,
        availableChoices: Array.from(availableChoices),
        characterNotes: characterNotes,
    };

    for (const charId in currentCharacterSprites) {
        const spriteInfo = currentCharacterSprites[charId];
        if (spriteInfo.element.style.display !== 'none') {
            saveData.currentCharacterSprites[charId] = { 
                src: spriteInfo.element.src, 
                position: spriteInfo.position 
            };
        }
    }
    return saveData;
}

function applySaveData(loadedData) {
    if (!loadedData || !loadedData.gameState) {
        showMessageBox('Load Error', 'The save data is corrupted or from an incompatible version.', false);
        return;
    }

    gameState = loadedData.gameState;
    
    const toSet = (value) => Array.isArray(value) ? new Set(value) : new Set();

    gameState.unlockedCharacters = toSet(gameState.unlockedCharacters);
    gameState.seenDialogue = toSet(gameState.seenDialogue);
    gameState.inventory = toSet(gameState.inventory);
    gameState.unlockedAchievements = toSet(gameState.unlockedAchievements);
    gameState.previouslyChosenChoices = toSet(gameState.previouslyChosenChoices);
    gameState.unlockedCGs = toSet(gameState.unlockedCGs);
    gameState.unlockedTracks = toSet(gameState.unlockedTracks);
    gameState.unlockedRecipes = toSet(gameState.unlockedRecipes || ['hearty_stew']);
    gameState.unlockedMapLocations = toSet(gameState.unlockedMapLocations || ['everfall_city']);

    availableChoices = toSet(loadedData.availableChoices);
    characterNotes = loadedData.characterNotes || {};
    currentBackground = loadedData.currentBackground;

    updateAllSettingsUI();
    updateBackground(currentBackground, false);
    updateCharacterSprite(null, 'hide-all');
    for (const charId in loadedData.currentCharacterSprites) {
        const spriteData = loadedData.currentCharacterSprites[charId];
        const charInfo = assets.characters[charId];
        let emotion = 'default';
        if(charInfo && charInfo.emotions) {
            emotion = Object.keys(charInfo.emotions).find(key => charInfo.emotions[key] === spriteData.src) || 'default';
        }
        updateCharacterSprite(charId, 'show', spriteData.position, emotion);
    }

    const nameBox = document.getElementById('name-box');
    const dialogueBox = document.getElementById('dialogue-box');
    
    nameBox.textContent = loadedData.currentSpeaker;
    document.getElementById('dialogue-text').textContent = loadedData.currentDialogueText;
    document.getElementById('continue-prompt').style.display = 'block';
    
    gameState.dialogueHistoryPointer = gameState.dialogueHistory.length - 1;
    updateHistoryButtons();
    dialogueBox.className = 'dialogue-box';
    const charData = Object.values(assets.characters).find(char => char.name === loadedData.currentSpeaker);
    dialogueBox.classList.add(charData?.dialog_color_class || 'general-dialogue');
    
    gameState.isGameActive = true;
}

function saveSession() {
    if (!gameState.isGameActive) return;
    const sessionData = createSaveData('Session');
    localStorage.setItem('everfallSessionSave', JSON.stringify(sessionData));
    console.log("Session saved.");
}

function loadSession() {
    const sessionDataString = localStorage.getItem('everfallSessionSave');
    if (sessionDataString) {
        try {
            const loadedData = JSON.parse(sessionDataString);
            applySaveData(loadedData);
            showNotification('Continuing last session.');
            switchScreen('game-container');
        } catch (e) {
            console.error("Failed to parse session data:", e);
            showMessageBox('Continue', 'Could not load session data. It might be corrupted. Starting a new game.', false);
            startNewGame();
        }
    } else {
        showMessageBox('Continue', 'No session found. Starting a new game.', false);
        startNewGame();
    }
}

function startNewGame() {
    gameState = {
        currentStoryIndex: 0, isGameActive: true, typingSpeed: 25, skipMode: 'read', autoAdvanceSpeed: 0,
        musicVolume: 0.5, sfxVolume: 0.75, dialogueOpacity: 0.8, fontSize: 'normal', useDyslexicFont: false,
        highlightChoices: true, chosenOutfit: null, unlockedCharacters: new Set(['general']),
        dialogueHistory: [], dialogueHistoryPointer: -1, seenDialogue: new Set(), isTyping: false,
        waitingForInput: false, skipTypingRequest: false, autoAdvanceTimeoutId: null, currentDialogueText: '', currentSpeaker: '', isOverlayOpen: false,
        characterAffection: { willow: 0, nova: 0, amaryllis: 0, kelly: 0, ray: 0, clay: 0, fenrir: 0, cerberus: 0, dean: 0 },
        inventory: new Set(),
        unlockedAchievements: new Set(JSON.parse(localStorage.getItem('everfallAchievements') || '[]')),
        unlockedCGs: new Set(JSON.parse(localStorage.getItem('everfallCGs') || '[]')),
        unlockedTracks: new Set(JSON.parse(localStorage.getItem('everfallTracks') || '[]')),
        unlockedRecipes: new Set(JSON.parse(localStorage.getItem('everfallRecipes') || '["hearty_stew"]')),
        unlockedMapLocations: new Set(JSON.parse(localStorage.getItem('everfallMapLocations') || '["everfall_city"]')),
        previouslyChosenChoices: new Set(),
    };
    availableChoices = new Set();
    characterNotes = {'general': ''};
    localStorage.removeItem('everfallSessionSave');
    updateMainMenuUI();
    switchScreen('game-container', false, () => {
         processStoryPoint();
    });
}

function saveGame(slotIndex, saveName) {
    const isQuickSave = slotIndex === QUICK_SAVE_SLOT_INDEX;
    const finalSaveName = isQuickSave ? `Quick Save` : (saveName || `Save Slot ${slotIndex + 1}`);
    
    const saveData = createSaveData(finalSaveName);
    saveData.thumbnail = generateSaveThumbnail();
    saveSlots[slotIndex] = saveData;
    localStorage.setItem('everfallSaveSlots', JSON.stringify(saveSlots));
    showNotification(`Game saved to ${finalSaveName}`);
    if(currentScreen === 'save-load-screen') renderSaveLoadScreen('save-tab');
}

function loadGame(slotIndex) {
    const loadedData = saveSlots[slotIndex];
    if (!loadedData) {
        showMessageBox('Load Error', 'No data found in this slot.', false);
        return;
    }
    applySaveData(loadedData);
    showNotification(`Loaded: ${loadedData.name}`);
    switchScreen('game-container');
}

function deleteSave(slotIndex) {
    showMessageBox('Delete Save', `Are you sure you want to delete save slot ${slotIndex + 1}?`, true, () => {
        saveSlots[slotIndex] = null;
        localStorage.setItem('everfallSaveSlots', JSON.stringify(saveSlots));
        showNotification(`Save slot ${slotIndex + 1} deleted.`);
        renderSaveLoadScreen('save-tab');
    });
}

function loadGameDataFromStorage() {
    const savedData = localStorage.getItem('everfallSaveSlots');
    if (savedData) {
        try {
            saveSlots = JSON.parse(savedData);
        } catch(e) {
            console.error("Could not parse save slots. Resetting.", e);
            saveSlots = Array(10).fill(null);
            localStorage.removeItem('everfallSaveSlots');
        }
    }
    gameState.unlockedAchievements = new Set(JSON.parse(localStorage.getItem('everfallAchievements') || '[]'));
    gameState.unlockedCGs = new Set(JSON.parse(localStorage.getItem('everfallCGs') || '[]'));
    gameState.unlockedTracks = new Set(JSON.parse(localStorage.getItem('everfallTracks') || '[]'));
    gameState.unlockedMapLocations = new Set(JSON.parse(localStorage.getItem('everfallMapLocations') || '["everfall_city"]'));
    gameState.unlockedRecipes = new Set(JSON.parse(localStorage.getItem('everfallRecipes') || '["hearty_stew"]'));
}

function saveGameDataToStorage() {
    localStorage.setItem('everfallAchievements', JSON.stringify(Array.from(gameState.unlockedAchievements)));
    localStorage.setItem('everfallCGs', JSON.stringify(Array.from(gameState.unlockedCGs)));
    localStorage.setItem('everfallTracks', JSON.stringify(Array.from(gameState.unlockedTracks)));
    localStorage.setItem('everfallMapLocations', JSON.stringify(Array.from(gameState.unlockedMapLocations)));
    localStorage.setItem('everfallRecipes', JSON.stringify(Array.from(gameState.unlockedRecipes)));
    localStorage.setItem('everfallCharacterNotes', JSON.stringify(characterNotes));
}