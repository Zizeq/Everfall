// ui.js
// --- Screen Management ---
let currentScreen = 'main-menu';

function switchScreen(screenId, isModal = false, onScreenReady = () => {}) {
    const allScreens = document.querySelectorAll('.main-menu-container, .game-container, .sub-screen, .save-load-screen, .journal-container');
    const modalBackdrop = document.getElementById('modal-backdrop');
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
            
            // DOM Elements
            const dialogueBoxElement = document.getElementById('dialogue-box');
            const topControlsElement = document.querySelector('.top-controls');
            const characterDisplay = document.getElementById('character-display');
            const choicesContainerElement = document.getElementById('choices-container');

            if (dialogueBoxElement) dialogueBoxElement.style.display = isGameScreen ? 'flex' : 'none';
            if (topControlsElement) topControlsElement.style.display = isGameScreen ? 'flex' : 'none';
            if (characterDisplay) characterDisplay.style.display = isGameScreen ? 'flex' : 'none';
            if (choicesContainerElement) choicesContainerElement.style.display = 'none';

            gameState.isOverlayOpen = isOverlay;
            onScreenReady();
        });
        currentScreen = screenId;
    } else {
        console.error(`Target screen with ID '${screenId}' not found.`);
    }

    if (screenId === 'main-menu') updateMainMenuUI();
    if (screenId === 'save-load-screen') renderSaveLoadScreen('save-tab');
    if (screenId === 'achievements-screen') renderAchievementsScreen();
    if (screenId === 'inventory-screen') renderInventoryScreen();
    if (screenId === 'cg-gallery-screen') renderCGGalleryScreen();
    if (screenId === 'music-room-screen') renderMusicRoomScreen();
    if (screenId === 'world-map-screen') renderWorldMapScreen();
    if (screenId === 'cooking-screen') { selectedRecipeId = null; renderCookingScreen(); }
}

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
            spriteElement.classList.add(`sprite-${characterId}`);
            spriteElement.id = `sprite-${characterId}`;
            characterDisplay.appendChild(spriteElement);
            currentCharacterSprites[characterId] = { element: spriteElement, position: position };
        }
        const charData = assets.characters[characterId];
        if (charData && charData.emotions && charData.emotions[emotion]) {
            spriteElement.src = charData.emotions[emotion];
        } else if (charData && charData.emotions && charData.emotions.default) {
            spriteElement.src = charData.emotions.default;
        } else {
                spriteElement.src = 'https://placehold.co/400x700/cccccc/000000?text=Sprite+Not+Found';
        }
        
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

function showCustomMessageBox(title, message, buttons) {
    const overlay = document.createElement('div');
    overlay.className = 'message-box-overlay';
    overlay.innerHTML = `<div class="message-box"><h3>${title}</h3><p>${message}</p><div class="button-group"></div></div>`;
    const buttonGroup = overlay.querySelector('.button-group');
    
    buttons.forEach(buttonInfo => {
        const btn = document.createElement('button');
        btn.textContent = buttonInfo.text;
        btn.onclick = () => {
            if (buttonInfo.action) buttonInfo.action();
            overlay.remove();
        };
        if (buttonInfo.disabled) {
            btn.disabled = true;
        }
        buttonGroup.appendChild(btn);
    });

    document.body.appendChild(overlay);
}

function showMessageBox(title, message, isConfirm, onConfirm) {
    const buttons = [];
    if (isConfirm) {
        buttons.push({ text: 'Yes', action: onConfirm });
        buttons.push({ text: 'No' });
    } else {
        buttons.push({ text: 'OK' });
    }
    showCustomMessageBox(title, message, buttons);
}

function showNotification(message, duration = 3000) {
    const notificationPopup = document.getElementById('notification-popup');
    notificationPopup.textContent = message;
    notificationPopup.classList.add('show');
    setTimeout(() => notificationPopup.classList.remove('show'), duration);
}

function updateMainMenuUI() {
    const startButton = document.getElementById('main-menu').querySelector('[data-action="start-game-prompt"]');
    if (startButton) {
        const sessionExists = localStorage.getItem('everfallSessionSave') !== null;
        startButton.textContent = sessionExists ? 'Continue' : 'Start Game';
    }
}

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
    const backgroundMusic = document.getElementById('background-music');
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