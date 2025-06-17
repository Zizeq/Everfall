document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const settingsScreen = document.getElementById('settings-screen');
    const controlsScreen = document.getElementById('controls-screen');
    const aboutScreen = document.getElementById('about-screen');
    const saveLoadScreen = document.getElementById('save-load-screen');
    const journalContainer = document.getElementById('journal-container');
    const backgroundMusic = document.getElementById('background-music');
    const notificationPopup = document.getElementById('notification-popup');
    const modalBackdrop = document.getElementById('modal-backdrop');
    let dialogueBoxElement, nameBoxElement, dialogueTextElement, continuePromptElement, choicesContainerElement, prevDialogueButton, nextDialogueButton, affectionIndicator;
    let topControlsElement;
    let journalBookContainer;

    // NEW: References for new QoL and Extras screens
    let dialogueLogScreen, achievementsScreen, inventoryScreen, extrasScreen, cgGalleryScreen, musicRoomScreen;

    // NEW: turn.js specific variables
    let $flipbook;
    let charIdToPageMap = {};

    // --- Game State Variables ---
    let gameState = {
        currentStoryIndex: 0,
        isGameActive: false,
        typingSpeed: 25,
        skipMode: 'read',
        autoAdvanceSpeed: 0, // 0 is off, 1-10 is speed
        musicVolume: 0.5,
        sfxVolume: 0.75,
        dialogueOpacity: 0.8, // NEW: Dialogue box opacity
        fontSize: 'normal', // NEW: Font size (small, normal, large)
        useDyslexicFont: false, // NEW: Dyslexic font toggle
        highlightChoices: true, // NEW: Toggle for choice highlighting
        chosenOutfit: null,
        unlockedCharacters: new Set(['general']),
        dialogueHistory: [],
        dialogueHistoryPointer: -1,
        seenDialogue: new Set(),
        isTyping: false,
        waitingForInput: false,
        skipTypingRequest: false,
        autoAdvanceTimeoutId: null,
        currentJournalCharacter: 'general',
        currentDialogueText: '',
        currentSpeaker: '',
        isOverlayOpen: false,

        characterAffection: {
            willow: 0, nova: 0, amaryllis: 0, kelly: 0, ray: 0, clay: 0, fenrir: 0, cerberus: 0, dean: 0,
        },

        inventory: new Set(),
        unlockedAchievements: new Set(),
        previouslyChosenChoices: new Set(), // NEW: Tracks choice IDs that have been picked before
        unlockedCGs: new Set(), // NEW: Stores IDs of unlocked CGs
        unlockedTracks: new Set(), // NEW: Stores IDs of unlocked music tracks
    };

    let saveSlots = Array(10).fill(null);
    const MAX_SAVE_SLOTS = 10;
    const QUICK_SAVE_SLOT_INDEX = MAX_SAVE_SLOTS - 1; // Use the last slot for quick saves
    let availableChoices = new Set();
    let characterNotes = {};
    if (!characterNotes['general']) {
        characterNotes['general'] = '';
    }

    // --- Asset & Story Data ---
    const assets = {
        backgrounds: {
            graduationHall: 'https://placehold.co/1280x720/E6DBCD/3e2723?text=Graduation+Hall',
            cityStreet: 'https://placehold.co/1280x720/C3B4A3/3e2723?text=City+Street',
            cloverRoom: 'https://placehold.co/1280x720/74786A/ffffff?text=Clover%27s+Room',
            forestPath: 'https://placehold.co/1280x720/89A26A/ffffff?text=Forest+Path',
            forestClearing: 'https://placehold.co/1280x720/ADC77E/3e2723?text=Forest+Clearing',
            newForest: 'https://placehold.co/1280x720/5A6F4E/ffffff?text=Weird+Forest',
            prisonCell: 'https://placehold.co/1280x720/74786A/ffffff?text=Grim+Prison+Cell',
            darkness: 'https://placehold.co/1280x720/000000/000000?text=',
        },
        characters: {
            general: { name: 'General', dialog_color_class: 'general-dialogue', bio: 'General notes about the world and your journey.' },
            clover: { name: 'Clover', dialog_color_class: 'clover', bio: 'The protagonist. Trying to find a way home.' },
            willow: {
                name: 'Willow', dialog_color_class: 'willow',
                emotions: {
                    default: 'https://placehold.co/400x700/ffcc66/000000?text=Willow+Default',
                    happy: 'https://placehold.co/400x700/ffcc66/000000?text=Willow+Happy',
                    awkward: 'https://placehold.co/400x700/ffcc66/000000?text=Willow+Awkward'
                },
                bio: "Clover's best friend from their original world. Kind, earnest, and fiercely loyal."
            },
            nova: {
                name: 'Nova', dialog_color_class: 'nova',
                emotions: {
                    default: 'https://placehold.co/400x700/87ceeb/000000?text=Nova',
                    grinning: 'https://placehold.co/400x700/87ceeb/000000?text=Nova+Grinning',
                },
                bio: "A chirpy and energetic fennec-bat creature. Was Clover's first cellmate and ally in the new world."
            },
            amaryllis: { name: 'Amaryllis', dialog_color_class: 'amaryllis', bio: 'A mysterious figure with a calm and knowing demeanor.' },
            kelly: { name: 'Kelly', dialog_color_class: 'kelly', bio: 'A resourceful and intelligent inventor.' },
            ray: { name: 'Ray', dialog_color_class: 'ray', bio: 'A charming and passionate individual with a flare for the dramatic.' },
            clay: { name: 'Clay', dialog_color_class: 'clay', bio: 'A laid-back and humorous person, always ready with a joke.' },
            fenrir: {
                name: 'Fenrir', dialog_color_class: 'fenrir',
                emotions: {
                    default: 'https://placehold.co/400x700/2c3e50/ffffff?text=Fenrir',
                    confused: 'https://placehold.co/400x700/2c3e50/ffffff?text=Fenrir+Confused'
                },
                bio: 'A stoic and wise wolf-like being. Seems to understand more about this world than he lets on.'
            },
            cerberus: { name: 'Cerberus', dialog_color_class: 'cerberus', bio: 'A powerful guardian figure, stern but fair.' },
            dean: { name: 'Dean', dialog_color_class: 'dean', bio: 'A figure of authority in the new world.' },
            guard: { name: 'Guard', emotions: { default: 'https://placehold.co/450x750/555555/ffffff?text=Guard' }, dialog_color_class: 'guard', bio: 'A generic guard. Seems to be everywhere.' },
            willow_mom: { name: "Willow's Mom", emotions: { default: 'https://placehold.co/400x700/9966cc/ffffff?text=Willow%27s+Mom' }, dialog_color_class: 'willow_mom', bio: "Willow's mother." },
        },
        journalCharacters: ['nova', 'amaryllis', 'kelly', 'ray', 'clay', 'fenrir', 'cerberus'],
        items: {
            pebbleton: { name: 'Pebbleton', description: 'A smooth, grey rock. Nova gave it to you.', thumbnail: 'https://placehold.co/100x100/999999/ffffff?text=Pebbleton' },
            mysterious_orb: { name: 'Mysterious Orb', description: 'Pulses with a faint, otherworldly light.', thumbnail: 'https://placehold.co/100x100/87ceeb/000000?text=Orb' },
        },
        // NEW: CG Gallery assets
        cgs: {
            picnic_stars: {
                id: 'picnic_stars',
                title: 'Picnic Under the Stars',
                thumbnail: 'https://placehold.co/300x169/89A26A/ffffff?text=CG:+Picnic',
                full: 'https://placehold.co/1280x720/89A26A/ffffff?text=CG:+Picnic+with+Willow'
            },
            isekai_awakening: {
                id: 'isekai_awakening',
                title: 'Forest Awakening',
                thumbnail: 'https://placehold.co/300x169/5A6F4E/ffffff?text=CG:+Awakening',
                full: 'https://placehold.co/1280x720/5A6F4E/ffffff?text=CG:+Waking+up+in+the+Forest'
            }
        },
        // NEW: Music Room assets
        musicTracks: {
            melancholic_guitar: {
                id: 'melancholic_guitar',
                title: 'Melancholic Mood',
                url: 'https://assets.mixkit.co/sfx/preview/mixkit-melancholic-guitar-loop-1372.mp3'
            }
        },
        achievements: {
            ending_1_good: { title: 'The Great Escape', description: 'Achieved the good ending. (Ending 1 of 9)', poemFragment: 'If I had nine lives, I think the first one would be a lie.\nI’d spend it convincing myself I’m okay,\nburying the truth so deep I’d forget what it felt like to be honest.\nI’d probably crash at some point—\nand maybe that would be the peace I was too scared to chase.', icon: '<i class="fas fa-star"></i>' },
            ending_2_neutral: { title: 'A Fork in the Road', description: 'Achieved a neutral ending. (Ending 2 of 9)', poemFragment: 'But in my second life, I’d wake up.\nI’d feel the sting of every bruise, the weight of what I ignored.\nI’d see things clearly, no more pretending, no more hiding.\nIt would hurt, but I’d finally know what’s real,\neven if the truth left scars.', icon: '<i class="fas fa-route"></i>' },
            ending_3_placeholder: { title: 'The Homecoming', description: 'Achieved Ending 3. (Ending 3 of 9)', poemFragment: 'In the third life, I’d go back home.\nBack to the places I once knew, thinking I could find something I lost.\nBut it wouldn’t feel the same.\nThe streets would be different, the people older,\nand I’d realize that going back doesn\'t always mean finding what you’re looking for.', icon: '<i class="fas fa-question-circle"></i>' },
            ending_4_sacrifice: { title: 'The Giver', description: 'Achieved Ending 4. (Ending 4 of 9)', poemFragment: 'The fourth life, though, I’d give away.\nNot to myself, but to everyone else—\nsacrificing my time, my energy, and my heart for the people I love.\nI’d put their needs before mine, until there was nothing left.\nMaybe that’s noble, or maybe it’s just another way to disappear.', icon: '<i class="fas fa-hand-holding-heart"></i>' },
            ending_5_fate: { title: 'Tempting Fate I', description: 'Achieved Ending 5. (Ending 5 of 9)', poemFragment: 'Then comes three lives spent tempting fate,\nlike I’m stuck in some cosmic game I can’t win.\nI’d get caught up in the thrill, thinking I could outsmart destiny.\nBut each time, it would bring me back to the same spot—\nthe charm wears off, and I’m left standing in the wreckage.', icon: '<i class="fas fa-dice"></i>' },
            ending_6_fate: { title: 'Tempting Fate II', description: 'Achieved Ending 6. (Ending 6 of 9)', poemFragment: 'Then comes three lives spent tempting fate,\nlike I’m stuck in some cosmic game I can’t win.\nI’d get caught up in the thrill, thinking I could outsmart destiny.\nBut each time, it would bring me back to the same spot—\nthe charm wears off, and I’m left standing in the wreckage.', icon: '<i class="fas fa-dice-d20"></i>' },
            ending_7_fate: { title: 'Tempting Fate III', description: 'Achieved Ending 7. (Ending 7 of 9)', poemFragment: 'Then comes three lives spent tempting fate,\nlike I’m stuck in some cosmic game I can’t win.\nI’d get caught up in the thrill, thinking I could outsmart destiny.\nBut each time, it would bring me back to the same spot—\nthe charm wears off, and I’m left standing in the wreckage.', icon: '<i class="fas fa-hat-wizard"></i>' },
            ending_8_happy: { title: 'True Happiness', description: 'Achieved Ending 8. (Ending 8 of 9)', poemFragment: 'And in the eighth life, I’d be happy.\nNot just content, but truly happy.\nI’d live without fear, without holding back.\nI’d find joy in the small things, in the moments I used to overlook,\nbecause by then I’d know what really matters.', icon: '<i class="fas fa-grin-beam"></i>' },
            ending_9_final: { title: 'The Final Chance', description: 'Achieved Ending 9. (Ending 9 of 9)', poemFragment: 'But the ninth…\nThe ninth life, I’d cherish.\nI’d hold it like it’s something fragile, something precious.\nBecause I’d know it’s my last chance,\nmy final breath,\nand I’d want to spend it finding you.', icon: '<i class="fas fa-heart"></i>' },
            all_endings_unlocked: { title: 'The One Life', description: 'Unlocked all 9 endings.', poemFragment: 'But I’m not a cat, and there are no second chances.\nI’ve only got this one life, and it’s more than enough.\nSo I’ll spend it with purpose, with heart,\nsurrounding myself with those who truly see me.\nAnd maybe, one day, you’ll find your way to me too.', icon: '<i class="fas fa-cat"></i>' }
        },
        poemFragments: [
            'ending_1_good', 'ending_2_neutral', 'ending_3_placeholder', 'ending_4_sacrifice',
            'ending_5_fate', 'ending_6_fate', 'ending_7_fate', 'ending_8_happy', 'ending_9_final',
            'all_endings_unlocked'
        ]
    };

    const story = [
        { id: 'start_story', type: 'background', src: assets.backgrounds.graduationHall, fade: true },
        { type: 'narration', text: 'The graduation ceremony is over. Willow drags me on stage, gives a heartfelt speech, and then we plan a picnic.' },
        { type: 'sprite_action', character: 'willow', action: 'show', position: 'center', emotion: 'default' },
        { type: 'name', name: 'Willow' },
        { type: 'character', name: 'Willow', text: 'Tonight! Picnic under the stars! You in, Clover?' },
        { type: 'name', name: 'Clover' },
        { type: 'character', name: 'Clover', text: 'Absolutely! I\'m so ready.' },
        { type: 'action', action: 'increaseAffection', character: 'willow', amount: 5 },
        { type: 'narration', text: 'Later that night, we head to a quiet clearing in the forest. The stars are breathtaking.' },
        { type: 'background', src: assets.backgrounds.forestClearing, fade: true },
        { type: 'action', action: 'unlockCG', cgId: 'picnic_stars' },
        { type: 'name', name: 'Willow' },
        { type: 'character', name: 'Willow', text: 'Isn\'t it beautiful here? Just us and the stars.' },
        { type: 'narration', text: 'A strange light appears in the sky, growing larger, faster than any comet should.' },
        { type: 'name', name: 'Willow' },
        { type: 'character', name: 'Willow', text: 'What the f-?' },
        { type: 'narration', text: 'Everything goes white, then dark. Silence.' },
        { type: 'sprite_action', character: 'willow', action: 'hide' },
        { type: 'transition', next: 'isekai_start', pause_music: true },

        { id: 'isekai_start', type: 'background', src: assets.backgrounds.newForest, fade: true, play_music: 'melancholic_guitar' },
        { type: 'action', action: 'unlockCG', cgId: 'isekai_awakening' },
        { type: 'narration', text: 'I wake up, aching, in a strange, unfamiliar forest. And I\'m... different. Hooves? Fur?' },
        { type: 'narration', text: 'Soon, I\'m captured by lizard-like guards and thrown into a cell.' },
        { type: 'background', src: assets.backgrounds.prisonCell, fade: true },
        { type: 'narration', text: 'My cellmate is a chirpy fennec-bat creature named Nova.' },
        { type: 'sprite_action', character: 'nova', action: 'show', position: 'center', emotion: 'default' },
        { type: 'action', action: 'unlockCharacter', character: 'nova' },
        { type: 'action', action: 'increaseAffection', character: 'nova', amount: 10 },
        { type: 'action', action: 'gainItem', item: 'pebbleton' },
        { type: 'name', name: 'Nova' },
        { type: 'character', name: 'Nova', text: 'Welcome to the party, new roomie! Name\'s Nova.' },
        { type: 'name', name: 'Clover' },
        {
            id: 'where_are_we_choice',
            type: 'choices',
            choices: [
                { id: 'where_are_we_1', text: 'Clover. Where... are we?', next: 'nova_reply' },
                { id: 'where_are_we_2', text: 'I... think I\'m going to be sick.', next: 'nova_reply_alt' }
            ]
        },
        { id: 'nova_reply', type: 'name', name: 'Nova' },
        { type: 'character', name: 'Nova', text: 'Long story, short version: You got isekai\'d, buddy. And now we\'re prisoners.' },
        { type: 'narration', text: 'To be continued...' },
        { type: 'end', achievement_id: 'ending_1_good' },

        { id: 'nova_reply_alt', type: 'name', name: 'Nova' },
        { type: 'character', name: 'Nova', text: 'Whoa there, easy! Deep breaths. Long story short... you got isekai\'d. And now we\'re prisoners.' },
        { type: 'action', action: 'increaseAffection', character: 'nova', amount: 2 },
        { type: 'narration', text: 'To be continued...' },
        { type: 'end', achievement_id: 'ending_2_neutral' },
    ];

    // --- Template Injection ---
    function injectContent() {
        mainMenu.innerHTML = `
            <h1 class="menu-title">Everfall</h1>
            <button class="menu-button" data-action="start-game">Start Game</button>
            <button class="menu-button" data-action="load-game-menu">Load Game</button>
            <button class="menu-button" data-action="settings">Settings</button>
            <button class="menu-button" data-action="extras">Extras</button>
            <button class="menu-button" data-action="achievements">Achievements</button>
            <button class="menu-button" data-action="controls">Controls</button>
            <button class="menu-button" data-action="about">About</button>
            <button class="menu-button" data-action="quit-game">Quit</button>`;

        gameContainer.innerHTML = `
            <div class="background" id="background"></div>
            <div class="character-display" id="character-display"></div>
            <div class="top-controls">
                <button data-action="ingame-journal" class="control-button"><i class="fas fa-book"></i> Journal</button>
                <button data-action="ingame-inventory" class="control-button"><i class="fas fa-box-open"></i> Inventory</button>
                <button data-action="ingame-settings" class="control-button"><i class="fas fa-cog"></i> Settings</button>
                <button data-action="ingame-save" class="control-button"><i class="fas fa-save"></i> Save</button>
                <button data-action="ingame-load" class="control-button"><i class="fas fa-folder-open"></i> Load</button>
                <button data-action="ingame-dialogue-log" class="control-button"><i class="fas fa-clipboard-list"></i> Log</button>
                <button data-action="return-to-main-menu-confirm" class="control-button"><i class="fas fa-home"></i> Main Menu</button>
                <button id="music-toggle-button" class="control-button"><i class="fas fa-music"></i> <i class="fas fa-play"></i><i class="fas fa-pause"></i></button>
            </div>
            <div class="dialogue-box" id="dialogue-box">
                <div class="name-box-wrapper">
                    <div class="name-box" id="name-box"></div>
                    <div class="affection-indicator" id="affection-indicator"><i class="fas fa-heart"></i></div>
                </div>
                <p class="dialogue-text" id="dialogue-text"></p>
                <div class="continue-prompt" id="continue-prompt">Click to continue...</div>
                <div class="history-buttons">
                    <button id="prev-dialogue-button" class="history-button" disabled><i class="fas fa-chevron-up"></i></button>
                    <button id="next-dialogue-button" class="history-button" disabled><i class="fas fa-chevron-down"></i></button>
                </div>
            </div>
            <div class="choices-container" id="choices-container"></div>`;

        settingsScreen.innerHTML = `
            <h2 class="sub-screen-title">Settings</h2>
            <div class="sub-screen-content settings-grid">
                <div class="settings-section">
                    <h3><i class="fas fa-font"></i> Text Speed</h3>
                    <div class="setting-item" id="typing-speed-options">
                         <label class="custom-radio"><input type="radio" name="typing-speed" value="50"> Slow</label>
                         <label class="custom-radio"><input type="radio" name="typing-speed" value="25"> Normal</label>
                         <label class="custom-radio"><input type="radio" name="typing-speed" value="10"> Fast</label>
                         <label class="custom-radio"><input type="radio" name="typing-speed" value="0"> Instant</label>
                    </div>
                </div>
                <div class="settings-section">
                    <h3><i class="fas fa-forward"></i> Skip Mode</h3>
                    <div class="setting-item" id="skip-mode-options">
                        <label class="custom-radio"><input type="radio" name="skip-mode" value="read"> Read Dialogue</label>
                        <label class="custom-radio"><input type="radio" name="skip-mode" value="all"> All Dialogue</label>
                    </div>
                </div>
                <div class="settings-section">
                    <h3><i class="fas fa-music"></i> Music Volume</h3>
                    <div class="setting-item">
                        <div class="block-slider" id="music-volume-slider" data-setting-type="musicVolume">
                            ${'<div class="block"></div>'.repeat(10)}
                        </div>
                    </div>
                </div>
                <div class="settings-section">
                    <h3><i class="fas fa-volume-up"></i> SFX Volume</h3>
                    <div class="setting-item">
                        <div class="block-slider" id="sfx-volume-slider" data-setting-type="sfxVolume">
                            ${'<div class="block"></div>'.repeat(10)}
                        </div>
                    </div>
                </div>
                <div class="settings-section">
                    <h3><i class="fas fa-fast-forward"></i> Auto-Forward Speed</h3>
                    <div class="setting-item">
                         <div class="block-slider" id="auto-forward-slider" data-setting-type="autoAdvanceSpeed">
                            ${'<div class="block"></div>'.repeat(10)}
                        </div>
                        <span class="slider-label">Off / Slow <-> Fast</span>
                    </div>
                </div>
                <div class="settings-section">
                    <h3><i class="fas fa-eye"></i> Dialogue Box Opacity</h3>
                     <div class="setting-item">
                        <div class="block-slider" id="dialogue-opacity-slider" data-setting-type="dialogueOpacity">
                            ${'<div class="block"></div>'.repeat(10)}
                        </div>
                        <span class="slider-label">Light <-> Opaque</span>
                    </div>
                </div>
                <div class="settings-section">
                    <h3><i class="fas fa-text-height"></i> Font Options</h3>
                    <div class="setting-item" id="font-size-options">
                        <label>Font Size:</label>
                         <label class="custom-radio"><input type="radio" name="font-size" value="small"> Small</label>
                         <label class="custom-radio"><input type="radio" name="font-size" value="normal"> Normal</label>
                         <label class="custom-radio"><input type="radio" name="font-size" value="large"> Large</label>
                    </div>
                     <div class="setting-item">
                        <label class="custom-toggle">
                            <input type="checkbox" id="dyslexic-font-toggle">
                            <span class="slider"></span>
                            Use Dyslexic-Friendly Font
                        </label>
                    </div>
                </div>
                 <div class="settings-section">
                    <h3><i class="fas fa-check-double"></i> UI Options</h3>
                    <div class="setting-item">
                        <label class="custom-toggle">
                            <input type="checkbox" id="highlight-choices-toggle">
                            <span class="slider"></span>
                            Highlight Previously Chosen Choices
                        </label>
                    </div>
                </div>
                <div class="settings-section">
                    <h3><i class="fas fa-redo"></i> Reset Progress</h3>
                    <div class="setting-item reset-button-container">
                        <button class="back-button" data-action="reset-game-prompt"><i class="fas fa-exclamation-triangle"></i> Reset Game</button>
                    </div>
                </div>
            </div>
            <div class="sub-screen-footer">
                <button class="back-button" data-action="back-from-subscreen"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;

        controlsScreen.innerHTML = `
            <h2 class="sub-screen-title">Controls</h2>
            <div class="sub-screen-content">
                <p><strong>Click / Spacebar:</strong> Advance dialogue, confirm choices.</p>
                <p><strong>F5:</strong> Quick Save to Slot 10.</p>
                <p><strong>F9:</strong> Quick Load from Slot 10.</p>
                <p><strong>Arrow Up / Scroll Up:</strong> View previous dialogue in log.</p>
                <p><strong>Arrow Down / Scroll Down:</strong> View next dialogue in log.</p>
                <p><strong>Ctrl / Cmd:</strong> Hold to fast-forward dialogue.</p>
                <p><strong>Esc:</strong> Open in-game menu.</p>
            </div>
            <div class="sub-screen-footer">
                <button class="back-button" data-action="back-from-subscreen"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;

        aboutScreen.innerHTML = `
            <h2 class="sub-screen-title">About Everfall</h2>
            <div class="sub-screen-content">
                <p>Game created using HTML, CSS, and JavaScript.</p>
            </div>
            <div class="sub-screen-footer">
                <button class="back-button" data-action="back-from-subscreen"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;

        saveLoadScreen.innerHTML = `
            <h2 class="sub-screen-title">Save / Load Game</h2>
            <div class="save-load-tabs">
                <button class="back-button active" data-tab="save-tab">Save</button>
                <button class="back-button" data-tab="load-tab">Load</button>
                <button class="back-button" data-tab="choices-tab">Replay Choices</button>
            </div>
            <div class="save-load-content" id="save-load-grid"></div>
            <div class="sub-screen-footer">
                <button class="back-button" data-action="back-from-save-load"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;

        journalContainer.innerHTML += `
            <div class="journal-book-container" id="actual-animated-journal"></div>
            <div class="journal-navigation">
                <button class="nav-button" data-action="close-journal">Close Journal</button>
            </div>`;

        dialogueLogScreen = document.getElementById('dialogue-log-screen');
        dialogueLogScreen.innerHTML = `
            <h2 class="sub-screen-title">Dialogue Log</h2>
            <div class="sub-screen-content dialogue-log-content" id="dialogue-log-content"></div>
            <div class="sub-screen-footer">
                <button class="back-button" data-action="back-from-dialogue-log"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;

        achievementsScreen = document.getElementById('achievements-screen');
        achievementsScreen.innerHTML = `
            <h2 class="sub-screen-title">Achievements</h2>
            <div class="sub-screen-content achievements-content">
                <div class="achievements-grid" id="achievements-grid"></div>
                <h3>Poem Fragments</h3>
                <div class="poem-display" id="poem-display"></div>
            </div>
            <div class="sub-screen-footer">
                <button class="back-button" data-action="back-from-achievements"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;

        inventoryScreen = document.getElementById('inventory-screen');
        inventoryScreen.innerHTML = `
            <h2 class="sub-screen-title">Inventory</h2>
            <div class="sub-screen-content inventory-content">
                <div class="item-grid" id="inventory-grid"></div>
            </div>
            <div class="sub-screen-footer">
                <button class="back-button" data-action="back-from-inventory"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;

        extrasScreen = document.getElementById('extras-screen');
        extrasScreen.innerHTML = `
             <h2 class="sub-screen-title">Extras</h2>
             <div class="sub-screen-content extras-menu">
                 <button class="menu-button" data-action="cg-gallery">CG Gallery</button>
                 <button class="menu-button" data-action="music-room">Music Room</button>
             </div>
             <div class="sub-screen-footer">
                <button class="back-button" data-action="back-from-subscreen"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;

        cgGalleryScreen = document.getElementById('cg-gallery-screen');
        cgGalleryScreen.innerHTML = `
            <h2 class="sub-screen-title">CG Gallery</h2>
            <div class="sub-screen-content">
                <div class="gallery-grid" id="cg-gallery-grid"></div>
            </div>
             <div class="sub-screen-footer">
                <button class="back-button" data-action="back-to-extras"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;

        musicRoomScreen = document.getElementById('music-room-screen');
        musicRoomScreen.innerHTML = `
            <h2 class="sub-screen-title">Music Room</h2>
            <div class="sub-screen-content music-room-content" id="music-room-list"></div>
            <div class="sub-screen-footer">
                <button class="back-button" data-action="back-to-extras"><i class="fas fa-arrow-left"></i> Back</button>
            </div>`;


        // Assign elements that exist only after injection
        dialogueBoxElement = document.getElementById('dialogue-box');
        nameBoxElement = document.getElementById('name-box');
        dialogueTextElement = document.getElementById('dialogue-text');
        continuePromptElement = document.getElementById('continue-prompt');
        choicesContainerElement = document.getElementById('choices-container');
        prevDialogueButton = document.getElementById('prev-dialogue-button');
        nextDialogueButton = document.getElementById('next-dialogue-button');
        topControlsElement = document.querySelector('.top-controls');
        affectionIndicator = document.getElementById('affection-indicator');
        journalBookContainer = document.getElementById('actual-animated-journal');
    }


    // --- Screen Management ---
    let currentScreen = 'main-menu';

    function switchScreen(screenId, isModal = false, onScreenReady = () => {}) {
        const allScreens = document.querySelectorAll('.main-menu-container, .game-container, .sub-screen, .save-load-screen, .journal-container');
        allScreens.forEach(s => s.classList.remove('visible', 'modal-in-game-screen'));

        modalBackdrop.classList.toggle('visible', isModal);

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            if (isModal) {
                targetScreen.classList.add('modal-in-game-screen');
            }
            requestAnimationFrame(() => {
                targetScreen.classList.add('visible');
                const isGameScreen = screenId === 'game-container';
                const isOverlay = isModal || !isGameScreen;

                if (dialogueBoxElement) dialogueBoxElement.style.display = isGameScreen ? 'flex' : 'none';
                if (topControlsElement) topControlsElement.style.display = isGameScreen ? 'flex' : 'none';
                if (document.getElementById('character-display')) document.getElementById('character-display').style.display = isGameScreen ? 'flex' : 'none';
                if (choicesContainerElement) choicesContainerElement.style.display = 'none';

                gameState.isOverlayOpen = isOverlay;
                onScreenReady();
            });
            currentScreen = screenId;
        } else {
            console.error(`Target screen with ID '${screenId}' not found.`);
        }

        if (screenId === 'save-load-screen') renderSaveLoadScreen('save-tab');
        if (screenId === 'journal-container') renderJournal();
        if (screenId === 'achievements-screen') renderAchievementsScreen();
        if (screenId === 'inventory-screen') renderInventoryScreen();
        if (screenId === 'cg-gallery-screen') renderCGGalleryScreen();
        if (screenId === 'music-room-screen') renderMusicRoomScreen();
    }

    // --- Game Logic ---
    let currentBackground = null;
    let currentCharacterSprites = {};
    let typingTimeout = null;

    function updateBackground(src, fade) {
        const backgroundElement = document.getElementById('background');
        if (fade) {
            backgroundElement.style.opacity = 0;
            setTimeout(() => {
                backgroundElement.style.backgroundImage = `url('${src}')`;
                backgroundElement.style.opacity = 1;
                currentBackground = src;
            }, 1000);
        } else {
            backgroundElement.style.backgroundImage = `url('${src}')`;
            backgroundElement.style.opacity = 1;
            currentBackground = src;
        }
    }

    function updateCharacterSprite(characterId, action, position = 'center', emotion = 'default') {
        const characterDisplay = document.getElementById('character-display');
        let spriteElement = currentCharacterSprites[characterId]?.element;

        if (action === 'show') {
            if (!spriteElement) {
                spriteElement = document.createElement('img');
                spriteElement.classList.add('character-sprite');
                spriteElement.id = `sprite-${characterId}`;
                characterDisplay.appendChild(spriteElement);
                currentCharacterSprites[characterId] = { element: spriteElement, position: position };
            }
            spriteElement.src = assets.characters[characterId]?.emotions?.[emotion] || '';
            spriteElement.style.display = 'block';
            spriteElement.style.left = 'auto';
            spriteElement.style.right = 'auto';
            spriteElement.style.transform = 'translateX(-50%)';

            switch (position) {
                case 'left': spriteElement.style.left = '10%'; spriteElement.style.transform = 'translateX(0)'; break;
                case 'right': spriteElement.style.right = '10%'; spriteElement.style.transform = 'translateX(0)'; break;
                case 'center': default: spriteElement.style.left = '50%'; break;
            }
            currentCharacterSprites[characterId].position = position;
        } else if (action === 'hide') {
            if (spriteElement) spriteElement.style.display = 'none';
        } else if (action === 'hide-all') {
            Object.values(currentCharacterSprites).forEach(sprite => {
                sprite.element.style.display = 'none';
            });
            currentCharacterSprites = {};
        }
    }

    function typeWriter(text, onComplete) {
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
        choicesContainerElement.classList.remove('visible');
        choicesContainerElement.style.display = 'none';
        choicesContainerElement.innerHTML = '';
        gameState.waitingForInput = false;
    }

    function handleChoice(choice) {
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
                if (!gameState.inventory.has(data.item)) {
                    gameState.inventory.add(data.item);
                    showNotification(`Gained: ${assets.items[data.item].name}!`);
                }
                break;
            case 'unlockCG':
                if (!gameState.unlockedCGs.has(data.cgId)) {
                    gameState.unlockedCGs.add(data.cgId);
                    showNotification(`New CG Unlocked: ${assets.cgs[data.cgId].title}`);
                    saveGameDataToStorage();
                }
                break;
        }
    }

    function proceedStory() {
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
        prevDialogueButton.disabled = gameState.dialogueHistoryPointer <= 0;
        nextDialogueButton.disabled = gameState.dialogueHistoryPointer >= gameState.dialogueHistory.length - 1;
    }

    function showDialogueFromHistory(index) {
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

    // --- Save / Load Logic ---
    function saveGame(slotIndex, saveName) {
        const isQuickSave = slotIndex === QUICK_SAVE_SLOT_INDEX;
        const finalSaveName = isQuickSave ? `Quick Save` : (saveName || `Save Slot ${slotIndex + 1}`);
        
        const saveData = {
            name: finalSaveName,
            timestamp: new Date().toLocaleString(),
            currentStoryIndex: gameState.currentStoryIndex,
            dialogueHistory: gameState.dialogueHistory,
            seenDialogue: Array.from(gameState.seenDialogue),
            characterAffection: gameState.characterAffection,
            inventory: Array.from(gameState.inventory),
            unlockedCharacters: Array.from(gameState.unlockedCharacters),
            unlockedAchievements: Array.from(gameState.unlockedAchievements),
            previouslyChosenChoices: Array.from(gameState.previouslyChosenChoices),
            unlockedCGs: Array.from(gameState.unlockedCGs),
            unlockedTracks: Array.from(gameState.unlockedTracks),
            availableChoices: Array.from(availableChoices),
            characterNotes: characterNotes,
            // Save all settings
            musicVolume: gameState.musicVolume, sfxVolume: gameState.sfxVolume,
            typingSpeed: gameState.typingSpeed, skipMode: gameState.skipMode,
            autoAdvanceSpeed: gameState.autoAdvanceSpeed, dialogueOpacity: gameState.dialogueOpacity,
            fontSize: gameState.fontSize, useDyslexicFont: gameState.useDyslexicFont,
            highlightChoices: gameState.highlightChoices,
            // Scene context
            currentBackground: currentBackground,
            currentCharacterSprites: {},
            currentDialogueText: dialogueTextElement.textContent,
            currentSpeaker: nameBoxElement.textContent,
        };

        for (const charId in currentCharacterSprites) {
            const spriteInfo = currentCharacterSprites[charId];
            if (spriteInfo.element.style.display !== 'none') {
                saveData.currentCharacterSprites[charId] = { src: spriteInfo.element.src, position: spriteInfo.position };
            }
        }
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

        Object.assign(gameState, {
            currentStoryIndex: loadedData.currentStoryIndex,
            dialogueHistory: loadedData.dialogueHistory || [],
            seenDialogue: new Set(loadedData.seenDialogue || []),
            characterAffection: loadedData.characterAffection || {},
            inventory: new Set(loadedData.inventory || []),
            unlockedCharacters: new Set(loadedData.unlockedCharacters || ['general']),
            unlockedAchievements: new Set(loadedData.unlockedAchievements || []),
            previouslyChosenChoices: new Set(loadedData.previouslyChosenChoices || []),
            unlockedCGs: new Set(loadedData.unlockedCGs || []),
            unlockedTracks: new Set(loadedData.unlockedTracks || []),
            musicVolume: loadedData.musicVolume ?? 0.5,
            sfxVolume: loadedData.sfxVolume ?? 0.75,
            typingSpeed: loadedData.typingSpeed ?? 25,
            skipMode: loadedData.skipMode || 'read',
            autoAdvanceSpeed: loadedData.autoAdvanceSpeed ?? 0,
            dialogueOpacity: loadedData.dialogueOpacity ?? 0.8,
            fontSize: loadedData.fontSize || 'normal',
            useDyslexicFont: loadedData.useDyslexicFont || false,
            highlightChoices: loadedData.highlightChoices ?? true,
            currentDialogueText: loadedData.currentDialogueText || '',
            currentSpeaker: loadedData.currentSpeaker || '',
        });
        availableChoices = new Set(loadedData.availableChoices || []);
        characterNotes = loadedData.characterNotes || {};
        currentBackground = loadedData.currentBackground;

        updateAllSettingsUI();
        updateBackground(currentBackground, false);
        updateCharacterSprite(null, 'hide-all');
        for (const charId in loadedData.currentCharacterSprites) {
            const spriteData = loadedData.currentCharacterSprites[charId];
            updateCharacterSprite(charId, 'show', spriteData.position);
        }

        nameBoxElement.textContent = gameState.currentSpeaker;
        dialogueTextElement.textContent = gameState.currentDialogueText;
        continuePromptElement.style.display = 'block';
        gameState.dialogueHistoryPointer = gameState.dialogueHistory.length - 1;
        updateHistoryButtons();
        dialogueBoxElement.className = 'dialogue-box';
        const charData = Object.values(assets.characters).find(char => char.name === gameState.currentSpeaker);
        dialogueBoxElement.classList.add(charData?.dialog_color_class || 'general-dialogue');
        
        showNotification(`Loaded: ${loadedData.name}`);
        switchScreen('game-container', false, () => {
            gameState.isGameActive = true;
        });
    }
    
    function generateSaveThumbnail() {
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.classList.add('save-thumbnail');
        thumbnailDiv.style.backgroundImage = `url('${currentBackground}')`;
        for (const charId in currentCharacterSprites) {
            const spriteInfo = currentCharacterSprites[charId];
            if (spriteInfo.element.style.display !== 'none') {
                const thumbSprite = document.createElement('img');
                thumbSprite.src = spriteInfo.element.src;
                thumbSprite.classList.add('thumbnail-sprite');
                if (spriteInfo.position === 'left') thumbSprite.style.left = '5%';
                else if (spriteInfo.position === 'right') thumbSprite.style.right = '5%';
                else thumbSprite.style.left = '50%';
                thumbnailDiv.appendChild(thumbSprite);
            }
        }
        return thumbnailDiv.outerHTML;
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
        if (savedData) saveSlots = JSON.parse(savedData);
        const globalAchievements = localStorage.getItem('everfallAchievements');
        if (globalAchievements) gameState.unlockedAchievements = new Set(JSON.parse(globalAchievements));
        const globalCGs = localStorage.getItem('everfallCGs');
        if(globalCGs) gameState.unlockedCGs = new Set(JSON.parse(globalCGs));
        const globalTracks = localStorage.getItem('everfallTracks');
        if(globalTracks) gameState.unlockedTracks = new Set(JSON.parse(globalTracks));
    }

    function saveGameDataToStorage() {
        localStorage.setItem('everfallAchievements', JSON.stringify(Array.from(gameState.unlockedAchievements)));
        localStorage.setItem('everfallCGs', JSON.stringify(Array.from(gameState.unlockedCGs)));
        localStorage.setItem('everfallTracks', JSON.stringify(Array.from(gameState.unlockedTracks)));
        localStorage.setItem('everfallCharacterNotes', JSON.stringify(characterNotes));
    }

    function renderSaveLoadScreen(activeTab) {
        const grid = document.getElementById('save-load-grid');
        grid.innerHTML = '';
        document.querySelector('.save-load-tabs').querySelectorAll('.back-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === activeTab);
        });

        if (activeTab === 'save-tab' || activeTab === 'load-tab') {
            for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
                const slot = saveSlots[i];
                const slotDiv = document.createElement('div');
                slotDiv.classList.add('save-slot-item');
                if (!slot) slotDiv.classList.add('empty');
                
                let isQuickSaveSlot = i === QUICK_SAVE_SLOT_INDEX;
                let defaultName = isQuickSaveSlot ? `Slot ${i + 1} (Quick Save)` : `Slot ${i + 1} (Empty)`;

                slotDiv.innerHTML = `
                    <div class="save-thumbnail-container">${slot ? slot.thumbnail : '<div class="save-thumbnail empty-thumbnail"></div>'}</div>
                    <div class="slot-info">
                        <input type="text" class="save-name-input" value="${slot ? slot.name : defaultName}" ${activeTab === 'load-tab' || isQuickSaveSlot ? 'readonly' : ''}>
                        <p>${slot ? `Saved: ${slot.timestamp}` : 'No data saved.'}</p>
                    </div>
                    <div class="slot-actions">
                        ${activeTab === 'save-tab' ? `<button class="save-btn" data-slot-index="${i}">Save</button>` : `<button class="load-btn" data-slot-index="${i}" ${!slot ? 'disabled' : ''}>Load</button>`}
                        <button class="delete-btn" data-slot-index="${i}" ${!slot ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
                    </div>`;
                grid.appendChild(slotDiv);
            }
        } else if (activeTab === 'choices-tab') {
            if (availableChoices.size === 0) {
                grid.innerHTML = '<p class="empty-log-message">No major choices have been made yet.</p>';
                return;
            }
            const replayableChoicePoints = story.filter(s => s.type === 'choices' && availableChoices.has(s.id));
            if (replayableChoicePoints.length === 0) {
                grid.innerHTML = '<p class="empty-log-message">No major choices have been made yet.</p>';
                return;
            }
            replayableChoicePoints.forEach(choicePoint => {
                const choiceItem = document.createElement('div');
                choiceItem.classList.add('choice-item');
                choiceItem.innerHTML = `
                    <div class="node-header">
                        <i class="fas fa-random"></i>
                        <span class="node-title">${choicePoint.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <button class="replay-button" data-next-scene-id="${choicePoint.id}">Replay from this choice</button>
                `;
                grid.appendChild(choiceItem);
            });
        }
    }
    
    // --- Settings UI & Logic ---
    function updateAllSettingsUI() {
        updateRadioSetting('typing-speed-options', gameState.typingSpeed.toString());
        updateRadioSetting('skip-mode-options', gameState.skipMode);
        updateRadioSetting('font-size-options', gameState.fontSize);
        document.getElementById('dyslexic-font-toggle').checked = gameState.useDyslexicFont;
        document.getElementById('highlight-choices-toggle').checked = gameState.highlightChoices;
        updateBlockSlider('music-volume-slider', gameState.musicVolume * 10);
        updateBlockSlider('sfx-volume-slider', gameState.sfxVolume * 10);
        updateBlockSlider('auto-forward-slider', gameState.autoAdvanceSpeed);
        updateBlockSlider('dialogue-opacity-slider', gameState.dialogueOpacity * 10);
        updateDialogueOpacity();
        updateFontStyles();
        updateMusicToggleButton();
    }

    function updateRadioSetting(containerId, value) {
        const container = document.getElementById(containerId);
        if (container) {
            const radio = container.querySelector(`input[value="${value}"]`);
            if (radio) radio.checked = true;
        }
    }

    function updateBlockSlider(containerId, value) {
        const container = document.getElementById(containerId);
        if (container) {
            container.querySelectorAll('.block').forEach((block, index) => {
                block.classList.toggle('active', index < value);
            });
        }
    }

    function updateMusicToggleButton() {
        const musicButton = document.getElementById('music-toggle-button');
        if (!musicButton) return;
        musicButton.classList.toggle('paused', backgroundMusic.paused);
    }

    function updateDialogueOpacity() {
        document.documentElement.style.setProperty('--dialogue-bg-opacity', gameState.dialogueOpacity);
    }

    function updateFontStyles() {
        document.body.classList.toggle('font-dyslexic', gameState.useDyslexicFont);
        document.body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large');
        document.body.classList.add(`font-size-${gameState.fontSize}`);
    }
    
    // --- Journal, Extras, and other Screens ---
    function renderJournal() {
        if (typeof jQuery === 'undefined' || typeof jQuery.fn.turn === 'undefined') {
            showMessageBox('Journal Error', 'Required libraries (jQuery, turn.js) are missing.', false);
            return;
        }
        if ($flipbook && $flipbook.data().turn) {
            $flipbook.turn('destroy');
        }
        journalBookContainer.innerHTML = '';

        let pagesHtml = '';
        charIdToPageMap = {};
        
        pagesHtml += `<div class="page hard"><h3>Everfall Journal</h3></div>`;
        
        let tocListHtml = assets.journalCharacters.map(charId => {
            const charName = assets.characters[charId].name;
            const isUnlocked = gameState.unlockedCharacters.has(charId);
            return `<li data-char-id="${charId}" class="${isUnlocked ? '' : 'locked'}">${isUnlocked ? charName : '??? <i class="fas fa-lock"></i>'}</li>`;
        }).join('');
        pagesHtml += `<div class="page journal-page toc-page"><h2>Contents</h2><ul id="journal-toc-list">${tocListHtml}</ul></div>`;
        
        let pageCounter = 3; // Cover is 1, ToC is 2
        assets.journalCharacters.forEach(charId => {
            charIdToPageMap[charId] = pageCounter++;
            const charData = assets.characters[charId];
            const isUnlocked = gameState.unlockedCharacters.has(charId);
            let characterPageContent = `<p class="locked-content">Encounter ${charData.name} to unlock this page.</p>`;

            if (isUnlocked) {
                const affection = gameState.characterAffection[charId] ?? 0;
                characterPageContent = `
                    <div class="character-profile"><h4>Profile</h4><p>${charData.bio}</p></div>
                    <p class="affection-display">Affection: ${affection}</p>
                    <h4>Player Notes</h4>
                    <textarea class="journal-textarea" id="notes-textarea-${charId}" placeholder="Your notes on ${charData.name}..."></textarea>`;
            }
            pagesHtml += `<div class="page journal-page" data-char-id="${charId}"><h3>${charData.name}</h3><div class="page-content">${characterPageContent}</div></div>`;
        });
        
        pagesHtml += `<div class="page hard"></div>`;
        journalBookContainer.innerHTML = pagesHtml;
        
        requestAnimationFrame(initializeFlipbook);
    }

    function initializeFlipbook() {
        $flipbook = $(journalBookContainer);
        if ($flipbook.width() === 0 || $flipbook.height() === 0) {
            setTimeout(initializeFlipbook, 100);
            return;
        }
        $flipbook.turn({
            width: $flipbook.width(), height: $flipbook.height(),
            autoCenter: true, gradients: true, acceleration: true, display: 'double'
        });
        setupJournalEventListeners();
        document.querySelectorAll('.journal-textarea').forEach(textarea => {
            const charId = textarea.id.replace('notes-textarea-', '');
            textarea.value = characterNotes[charId] || '';
            textarea.addEventListener('input', (e) => {
                characterNotes[charId] = e.target.value;
                saveGameDataToStorage();
            });
        });
        $flipbook.turn('page', 1);
    }
    
    function selectJournalCharacter(charId) {
        if ($flipbook && $flipbook.data().turn) {
            const targetPage = charIdToPageMap[charId];
            if (targetPage) $flipbook.turn('page', targetPage);
        }
    }

    function renderDialogueLog() {
        const logContent = document.getElementById('dialogue-log-content');
        if (gameState.dialogueHistory.length === 0) {
            logContent.innerHTML = '<p class="empty-log-message">No dialogue yet.</p>'; return;
        }
        logContent.innerHTML = gameState.dialogueHistory.map(entry => {
            const charData = Object.values(assets.characters).find(c => c.name === entry.speaker);
            const speakerClass = charData ? charData.dialog_color_class : 'general-dialogue';
            if(entry.type === 'narration') return `<div class="log-entry"><span class="log-narration">${entry.text}</span></div>`;
            return `<div class="log-entry"><span class="log-speaker ${speakerClass}">${entry.speaker}:</span> <span class="log-text">${entry.text}</span></div>`;
        }).join('');
        logContent.scrollTop = logContent.scrollHeight;
    }

    function renderAchievementsScreen() {
        const grid = document.getElementById('achievements-grid');
        const poem = document.getElementById('poem-display');
        grid.innerHTML = Object.keys(assets.achievements).map(id => {
            const ach = assets.achievements[id];
            const isUnlocked = gameState.unlockedAchievements.has(id);
            return `<div class="achievement-item ${isUnlocked ? '' : 'locked'}">
                        <div class="achievement-icon">${ach.icon}</div>
                        <div class="achievement-info">
                            <h4 class="achievement-title">${isUnlocked ? ach.title : '???'}</h4>
                            <p class="achievement-description">${isUnlocked ? ach.description : 'Unlock to reveal.'}</p>
                        </div>
                    </div>`;
        }).join('');
        poem.innerHTML = assets.poemFragments.map(id => {
            const ach = assets.achievements[id];
            const isUnlocked = gameState.unlockedAchievements.has(id);
            return `<pre class="poem-fragment ${isUnlocked ? '' : 'locked-fragment'}">${isUnlocked ? ach.poemFragment : '?????????'}</pre>`;
        }).join('');
    }

    function renderInventoryScreen() {
        const grid = document.getElementById('inventory-grid');
        if (gameState.inventory.size === 0) {
            grid.innerHTML = '<p class="empty-inventory-message">Inventory is empty.</p>'; return;
        }
        grid.innerHTML = Array.from(gameState.inventory).map(itemId => {
            const item = assets.items[itemId];
            return `<div class="inventory-item">
                        <img src="${item.thumbnail}" alt="${item.name}" class="item-thumbnail">
                        <h4 class="item-name">${item.name}</h4>
                        <p class="item-description">${item.description}</p>
                    </div>`;
        }).join('');
    }

    function renderCGGalleryScreen() {
        const grid = document.getElementById('cg-gallery-grid');
        grid.innerHTML = Object.values(assets.cgs).map(cg => {
            const isUnlocked = gameState.unlockedCGs.has(cg.id);
            return `<div class="gallery-item ${isUnlocked ? '' : 'locked'}" data-full-src="${isUnlocked ? cg.full : ''}" data-cg-title="${cg.title}">
                        <img src="${cg.thumbnail}" alt="${cg.title}">
                        <div class="gallery-item-title">${isUnlocked ? cg.title : '???'}</div>
                    </div>`;
        }).join('');
    }

    function renderMusicRoomScreen() {
        const list = document.getElementById('music-room-list');
        list.innerHTML = Object.values(assets.musicTracks).map(track => {
            const isUnlocked = gameState.unlockedTracks.has(track.id);
            return `<div class="music-item ${isUnlocked ? '' : 'locked'}">
                        <span>${isUnlocked ? track.title : '???'}</span>
                        ${isUnlocked ? `<button class="play-music-btn" data-track-url="${track.url}"><i class="fas fa-play"></i></button>` : '<i class="fas fa-lock"></i>'}
                    </div>`;
        }).join('');
    }

    // --- Utility Functions ---
    function showMessageBox(title, message, isConfirm, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'message-box-overlay';
        overlay.innerHTML = `<div class="message-box"><h3>${title}</h3><p>${message}</p><div class="button-group"></div></div>`;
        const buttonGroup = overlay.querySelector('.button-group');
        if (isConfirm) {
            const yesBtn = document.createElement('button');
            yesBtn.textContent = 'Yes';
            yesBtn.onclick = () => { onConfirm(); overlay.remove(); };
            buttonGroup.appendChild(yesBtn);
            const noBtn = document.createElement('button');
            noBtn.textContent = 'No';
            noBtn.onclick = () => overlay.remove();
            buttonGroup.appendChild(noBtn);
        } else {
            const okBtn = document.createElement('button');
            okBtn.textContent = 'OK';
            okBtn.onclick = () => overlay.remove();
            buttonGroup.appendChild(okBtn);
        }
        document.body.appendChild(overlay);
    }
    
    function unlockAchievement(id) {
        if(!gameState.unlockedAchievements.has(id)) {
            gameState.unlockedAchievements.add(id);
            showNotification(`Achievement Unlocked: ${assets.achievements[id].title}`);
            saveGameDataToStorage();
        }
    }

    function showNotification(message, duration = 3000) {
        notificationPopup.textContent = message;
        notificationPopup.classList.add('show');
        setTimeout(() => notificationPopup.classList.remove('show'), duration);
    }

    function showEndScreen() {
        showMessageBox('The End', 'Thank you for playing Everfall.', false, () => switchScreen('main-menu'));
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        document.addEventListener('click', (event) => {
            if (!gameState.isTyping && gameState.isGameActive && !gameState.isOverlayOpen) {
                if (event.target.closest('.dialogue-box, #background, .character-display')) {
                    proceedStory();
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (gameState.isGameActive && !gameState.isOverlayOpen) {
                if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); proceedStory(); }
                if (event.key === 'ArrowUp') { event.preventDefault(); showDialogueFromHistory(gameState.dialogueHistoryPointer - 1); }
                if (event.key === 'ArrowDown') { event.preventDefault(); showDialogueFromHistory(gameState.dialogueHistoryPointer + 1); }
            }
            if (event.key === 'Escape') {
                if (currentScreen === 'game-container') switchScreen('settings-screen', true);
                else if (currentScreen !== 'main-menu' && gameState.isGameActive) switchScreen('game-container');
                else if (currentScreen !== 'main-menu') switchScreen('main-menu');
            }
            if(gameState.isGameActive && !gameState.isOverlayOpen) {
                if (event.key === 'F5') { event.preventDefault(); saveGame(QUICK_SAVE_SLOT_INDEX); }
                if (event.key === 'F9') { event.preventDefault(); loadGame(QUICK_SAVE_SLOT_INDEX); }
            }
        });

        // FIX: Using a single, delegated event listener for the entire body
        document.body.addEventListener('click', (event) => {
            const actionTarget = event.target.closest('[data-action]');
            const tabTarget = event.target.closest('[data-tab]');
            const saveBtn = event.target.closest('.save-btn');
            const loadBtn = event.target.closest('.load-btn');
            const deleteBtn = event.target.closest('.delete-btn');
            const replayBtn = event.target.closest('.replay-button');
            const cgItem = event.target.closest('.gallery-item:not(.locked)');
            const musicBtn = event.target.closest('.play-music-btn');

            if (actionTarget) {
                const action = actionTarget.dataset.action;
                const actions = {
                    'start-game': () => {
                        Object.assign(gameState, { currentStoryIndex: 0, dialogueHistory: [], previouslyChosenChoices: new Set(), inventory: new Set() });
                        Object.keys(gameState.characterAffection).forEach(k => gameState.characterAffection[k] = 0);
                        switchScreen('game-container', false, () => { gameState.isGameActive = true; processStoryPoint(); });
                    },
                    'load-game-menu': () => { switchScreen('save-load-screen'); renderSaveLoadScreen('load-tab'); },
                    'settings': () => switchScreen('settings-screen'), 'controls': () => switchScreen('controls-screen'),
                    'about': () => switchScreen('about-screen'), 'achievements': () => switchScreen('achievements-screen'),
                    'extras': () => switchScreen('extras-screen'), 'cg-gallery': () => switchScreen('cg-gallery-screen'),
                    'music-room': () => switchScreen('music-room-screen'),
                    'quit-game': () => showMessageBox('Quit', 'Return to main menu?', true, () => { gameState.isGameActive = false; switchScreen('main-menu'); }),
                    'ingame-settings': () => switchScreen('settings-screen', true),
                    'ingame-save': () => { switchScreen('save-load-screen', true); renderSaveLoadScreen('save-tab'); },
                    'ingame-load': () => { switchScreen('save-load-screen', true); renderSaveLoadScreen('load-tab'); },
                    'ingame-journal': () => switchScreen('journal-container', true),
                    'ingame-inventory': () => switchScreen('inventory-screen', true),
                    'ingame-dialogue-log': () => { switchScreen('dialogue-log-screen', true); renderDialogueLog(); },
                    'return-to-main-menu-confirm': () => showMessageBox('Return to Menu', 'Unsaved progress will be lost.', true, () => { gameState.isGameActive = false; switchScreen('main-menu'); }),
                    'back-from-subscreen': () => gameState.isGameActive ? switchScreen('game-container') : switchScreen('main-menu'),
                    'back-to-extras': () => switchScreen('extras-screen'),
                    'back-from-save-load': () => gameState.isGameActive ? switchScreen('game-container') : switchScreen('main-menu'),
                    'back-from-dialogue-log': () => switchScreen('game-container'),
                    'back-from-achievements': () => gameState.isGameActive ? switchScreen('game-container') : switchScreen('main-menu'),
                    'back-from-inventory': () => switchScreen('game-container'),
                    'music-toggle-button': () => { backgroundMusic.paused ? backgroundMusic.play() : backgroundMusic.pause(); updateMusicToggleButton(); },
                    'reset-game-prompt': () => showMessageBox('Reset ALL Progress?', 'This will erase all saves and unlocked content.', true, () => { localStorage.clear(); window.location.reload(); }),
                    'close-journal': () => {
                        if ($flipbook && $flipbook.data().turn) $flipbook.turn('destroy');
                        setTimeout(() => gameState.isGameActive ? switchScreen('game-container') : switchScreen('main-menu'), 50);
                    }
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
                 showMessageBox('Replay Choice', `Replay from this point? Your current story progress will be reset to here.`, true, () => {
                    gameState.currentStoryIndex = story.findIndex(s => s.id === nextSceneId);
                    if (gameState.currentStoryIndex !== -1) {
                        gameState.dialogueHistory = [];
                        showNotification(`Replaying from: ${nextSceneId}`);
                        switchScreen('game-container', false, () => { gameState.isGameActive = true; processStoryPoint(); });
                    }
                 });
            } else if (cgItem) {
                showMessageBox(cgItem.dataset.cgTitle, `<img src="${cgItem.dataset.fullSrc}" style="width:100%; border-radius: 5px;">`, false);
            } else if (musicBtn) {
                backgroundMusic.src = musicBtn.dataset.trackUrl;
                backgroundMusic.play();
                updateMusicToggleButton();
            }
        });

        // Settings Listeners
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

    function setupJournalEventListeners() {
        const tocList = document.getElementById('journal-toc-list');
        if (tocList) {
            tocList.querySelectorAll('li:not(.locked)').forEach(item => {
                item.onclick = (e) => selectJournalCharacter(e.target.closest('li').dataset.charId);
            });
        }
    }
    
    // --- Initialization ---
    function initialize() {
        injectContent();
        loadGameDataFromStorage();
        setupEventListeners();
        updateAllSettingsUI();
        switchScreen('main-menu');
    }

    initialize();
});