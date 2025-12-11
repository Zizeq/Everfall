// main.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Asset Preloading Helper ---
    function preloadImages(storyData) {
        console.log("Starting asset preload...");
        const imagesToLoad = new Set();
        if (storyData && Array.isArray(storyData)) {
            storyData.forEach(line => {
                if (Array.isArray(line) && line[0] === "scene") {
                    const bgKey = line[1];
                    const url = assets.backgrounds[bgKey] || bgKey;
                    if (url) imagesToLoad.add(url);
                }
            });
        }
        Object.values(assets.characters).forEach(char => {
            if (char.emotions) {
                Object.values(char.emotions).forEach(url => { imagesToLoad.add(url); });
            }
        });
        imagesToLoad.forEach(url => { const img = new Image(); img.src = url; });
        console.log(`Preloading ${imagesToLoad.size} unique assets.`);
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        const backgroundMusic = document.getElementById('background-music');

        document.addEventListener('click', (event) => {
            if (!gameState.isTyping && gameState.isGameActive && !gameState.isOverlayOpen) {
                if (event.target.closest('.dialogue-box, #background, .character-display')) {
                    proceedStory();
                }
            }
        });

        // Close menus when clicking the BACKDROP
        document.getElementById('modal-backdrop').addEventListener('click', () => {
            if (currentScreen !== 'main-menu' && currentScreen !== 'game-container') {
                if (gameState.isGameActive) switchScreen('game-container');
                else switchScreen('main-menu');
            }
        });

        // SPECIFIC JOURNAL CLOSE LOGIC
        const journalContainer = document.getElementById('journal-container');
        if (journalContainer) {
            journalContainer.addEventListener('click', (event) => {
                // Only close if clicking the container itself (empty space), not the book
                if (event.target.id === 'journal-container') {
                    if (gameState.isGameActive) switchScreen('game-container');
                    else switchScreen('main-menu');
                }
            });
        }

        document.addEventListener('keydown', (event) => {
            if (gameState.isGameActive && !gameState.isOverlayOpen) {
                if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); proceedStory(); }
                if (event.key === 'ArrowUp') { event.preventDefault(); showDialogueFromHistory(gameState.dialogueHistoryPointer - 1); }
                if (event.key === 'ArrowDown') { event.preventDefault(); showDialogueFromHistory(gameState.dialogueHistoryPointer + 1); }
                if (event.key === 'F5') { event.preventDefault(); saveGame(QUICK_SAVE_SLOT_INDEX); }
                if (event.key === 'F9') { event.preventDefault(); loadGame(QUICK_SAVE_SLOT_INDEX); }
            }
            if (event.key === 'Escape') {
                if (currentScreen === 'game-container') {
                    showCustomMessageBox('Return to Menu', 'Your progress for the current session will be saved.', [{
                        text: 'OK',
                        action: () => {
                            saveSession();
                            gameState.isGameActive = false;
                            switchScreen('main-menu');
                        }
                    }]);
                } else if (currentScreen !== 'main-menu' && gameState.isGameActive) {
                    switchScreen('game-container');
                } else if (currentScreen !== 'main-menu') {
                    switchScreen('main-menu');
                }
            }
            if (currentScreen === 'journal-container' && $flipbook && $flipbook.data().turn) {
                if (event.key === 'ArrowLeft') { event.preventDefault(); goPrevJournalPage(); } 
                else if (event.key === 'ArrowRight') { event.preventDefault(); goNextJournalPage(); }
            }
        });

        document.body.addEventListener('click', (event) => {
            const actionTarget = event.target.closest('[data-action]');
            const tabTarget = event.target.closest('[data-tab]');
            const saveBtn = event.target.closest('.save-btn');
            const loadBtn = event.target.closest('.load-btn');
            const deleteBtn = event.target.closest('.delete-btn');
            const replayBtn = event.target.closest('.replay-button');
            const cgItem = event.target.closest('.gallery-item:not(.locked)');
            const musicBtn = event.target.closest('.play-music-btn');
            const recipeItem = event.target.closest('.recipe-item:not(.locked)');
            
            if (actionTarget) {
                const action = actionTarget.dataset.action;
                const actions = {
                    'start-game-prompt': () => {
                        const sessionExists = localStorage.getItem('everfallSessionSave') !== null;
                        showCustomMessageBox('Everfall', 'Be the master of your faith.', [
                            { text: 'Continue', action: loadSession, disabled: !sessionExists },
                            { text: 'New Game', action: startNewGame }
                        ]);
                    },
                    'load-game-menu': () => { switchScreen('save-load-screen'); renderSaveLoadScreen('load-tab'); },
                    'settings': () => switchScreen('settings-screen', true), 
                    'controls': () => switchScreen('controls-screen', true),
                    'about': () => switchScreen('about-screen', true), 
                    'achievements': () => switchScreen('achievements-screen', true),
                    'extras': () => switchScreen('extras-screen', true), 
                    'cg-gallery': () => switchScreen('cg-gallery-screen', true),
                    'music-room': () => switchScreen('music-room-screen', true),
                    'quit-game': () => showMessageBox('Quit', 'Are you sure you want to quit?', true, () => window.close()),
                    'ingame-settings': () => switchScreen('settings-screen', true),
                    'ingame-save': () => { switchScreen('save-load-screen', true); renderSaveLoadScreen('save-tab'); },
                    'ingame-load': () => { switchScreen('save-load-screen', true); renderSaveLoadScreen('load-tab'); },
                    'ingame-journal': () => { switchScreen('journal-container', true); renderJournal(); },
                    'ingame-inventory': () => switchScreen('inventory-screen', true),
                    'ingame-dialogue-log': () => { switchScreen('dialogue-log-screen', true); renderDialogueLog(); },
                    'ingame-world-map': () => { switchScreen('world-map-screen', true); renderWorldMapScreen(); },
                    'ingame-cooking': () => { selectedRecipeId = null; currentRecipeIndex = 0; switchScreen('cooking-screen', true); renderCookingScreen(); },
                    'return-to-main-menu-confirm': () => {
                        showMessageBox('Return to Menu', 'Your progress for the current session will be saved.', true, () => {
                            saveSession();
                            gameState.isGameActive = false;
                            switchScreen('main-menu');
                        });
                    },
                    'back-from-subscreen': () => gameState.isGameActive ? switchScreen('game-container') : switchScreen('main-menu'),
                    'back-to-extras': () => switchScreen('extras-screen', true),
                    'back-from-save-load': () => gameState.isGameActive ? switchScreen('game-container') : switchScreen('main-menu'),
                    'back-from-dialogue-log': () => switchScreen('game-container'),
                    'back-from-achievements': () => gameState.isGameActive ? switchScreen('game-container') : switchScreen('main-menu'),
                    'back-from-inventory': () => switchScreen('game-container'),
                    'music-toggle-button': () => { backgroundMusic.paused ? backgroundMusic.play() : backgroundMusic.pause(); updateMusicToggleButton(); },
                    'reset-game-prompt': () => showMessageBox('Reset ALL Progress?', 'This will erase all saves and unlocked content. This cannot be undone.', true, () => { localStorage.clear(); window.location.reload(); }),
                    'close-journal': () => {
                        if (gameState.isGameActive) switchScreen('game-container');
                        else switchScreen('main-menu');
                    },
                    'prev-journal-page': () => goPrevJournalPage(),
                    'next-journal-page': () => goNextJournalPage(),
                };
                if (actions[action]) actions[action]();
            } else if (tabTarget) {
                renderSaveLoadScreen(tabTarget.dataset.tab);
            } else if (saveBtn) {
                const index = parseInt(saveBtn.dataset.slotIndex);
                const input = saveBtn.closest('.save-slot-item').querySelector('.save-name-input');
                saveGame(index, input.value.trim());
            } else if (loadBtn) {
                loadGame(parseInt(loadBtn.dataset.slotIndex));
            } else if (deleteBtn) {
                deleteSave(parseInt(deleteBtn.dataset.slotIndex));
            } else if (replayBtn) {
                 const nextSceneId = replayBtn.dataset.nextSceneId;
                 const story = getStoryData(assets);
                 showMessageBox('Replay Choice', `Replay from this point? Your current story progress will be reset to here.`, true, () => {
                    const loadedData = createSaveData('Replay');
                    loadedData.gameState.currentStoryIndex = story.findIndex(s => s.id === nextSceneId);
                    applySaveData(loadedData);
                    showNotification(`Replaying from: ${nextSceneId}`);
                    switchScreen('game-container');
                 });
            } else if (cgItem) {
                showMessageBox(cgItem.dataset.cgTitle, `<img src="${cgItem.dataset.fullSrc}" style="width:100%; border-radius: 5px;">`, false);
            } else if (musicBtn) {
                backgroundMusic.src = musicBtn.dataset.trackUrl;
                backgroundMusic.play();
                updateMusicToggleButton();
            }
        });

        document.getElementById('settings-screen').addEventListener('change', (event) => {
            const target = event.target;
            if (target.name === 'typing-speed') gameState.typingSpeed = parseInt(target.value);
            if (target.name === 'skip-mode') gameState.skipMode = target.value;
            if (target.name === 'font-size') { gameState.fontSize = target.value; updateFontStyles(); }
            if (target.id === 'dyslexic-font-toggle') { gameState.useDyslexicFont = target.checked; updateFontStyles(); }
            if (target.id === 'highlight-choices-toggle') { gameState.highlightChoices = target.checked; }
        });

        document.getElementById('settings-screen').addEventListener('click', (event) => {
            const slider = event.target.closest('.block-slider');
            if (!slider) return;
            const rect = slider.getBoundingClientRect();
            const value = Math.ceil(((event.clientX - rect.left) / rect.width) * 10);
            const type = slider.dataset.settingType;
            if(type === 'musicVolume') { gameState.musicVolume = value / 10; backgroundMusic.volume = gameState.musicVolume; }
            if(type === 'sfxVolume') gameState.sfxVolume = value / 10;
            if(type === 'autoAdvanceSpeed') gameState.autoAdvanceSpeed = value;
            if(type === 'dialogueOpacity') { gameState.dialogueOpacity = value / 10; updateDialogueOpacity(); }
            updateBlockSlider(slider.id, value);
        });
    }

    // --- Initialization ---
    async function initialize() {
        loadGameDataFromStorage();
        setupEventListeners();
        updateAllSettingsUI();

        try {
            const response = await fetch('/static/story.json');
            if (!response.ok) throw new Error("Failed to load story script");
            window.rawStory = await response.json(); 
            preloadImages(window.rawStory);
            console.log("Story loaded.");
            switchScreen('main-menu');
        } catch (error) {
            console.error("Critical Error:", error);
            showCustomMessageBox("Error", "Failed to load game data. Check console.", [{text: "Retry", action: () => location.reload()}]);
        }
    }

    initialize();
});