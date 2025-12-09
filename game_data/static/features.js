// features.js

// --- Journal Flipbook Variables ---
let $flipbook;
let charIdToPageMap = {};
let isJournalInitialized = false;
let selectedRecipeId = null;

// --- Journal Logic ---
function renderJournal() {
    const journalBookContainer = document.getElementById('actual-animated-journal');
    if (isJournalInitialized) return;
    if ($flipbook && $flipbook.data().turn) {
        $flipbook.turn('destroy');
    }
    
    journalBookContainer.innerHTML = '';
    let pagesHtml = '';
    charIdToPageMap = {};
    
    // PAGE 1: Hard Cover (Title)
    pagesHtml += `
        <div class="page hard">
            <div class="journal-page-inner">
                <h3>Everfall Journal</h3>
            </div>
        </div>`;
    
    // PAGE 2: Table of Contents
    let tocListHtml = assets.journalCharacters.map(charId => {
        const charName = assets.characters[charId].name;
        const isUnlocked = gameState.unlockedCharacters.has(charId);
        return `<li data-char-id="${charId}" class="${isUnlocked ? '' : 'locked'}">${isUnlocked ? charName : '??? <i class="fas fa-lock"></i>'}</li>`;
    }).join('');

    pagesHtml += `
        <div class="page journal-page toc-page">
            <div class="journal-page-inner">
                <h2>Contents</h2>
                <ul id="journal-toc-list">${tocListHtml}</ul>
            </div>
        </div>`;
    
    // CHARACTER PAGES
    let pageCounter = 3; 
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
        
        pagesHtml += `
            <div class="page journal-page" data-char-id="${charId}">
                <div class="journal-page-inner">
                    <h3>${charData.name}</h3>
                    <div class="page-content">${characterPageContent}</div>
                </div>
            </div>`;
    });

    // BACK COVER
    pagesHtml += `<div class="page hard"></div>`;
    
    journalBookContainer.innerHTML = pagesHtml;
    
    requestAnimationFrame(initializeFlipbook);
    isJournalInitialized = true;
}

function initializeFlipbook() {
    const journalBookContainer = document.getElementById('actual-animated-journal');
    $flipbook = $(journalBookContainer);
    if ($flipbook.width() === 0 || $flipbook.height() === 0) {
        setTimeout(initializeFlipbook, 100);
        return;
    }
    $flipbook.turn({
        width: $flipbook.width(), 
        height: $flipbook.height(),
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

function setupJournalEventListeners() {
    const tocList = document.getElementById('journal-toc-list');
    if (tocList) {
        tocList.querySelectorAll('li:not(.locked)').forEach(item => {
            item.onclick = (e) => selectJournalCharacter(e.target.closest('li').dataset.charId);
        });
    }
}

function selectJournalCharacter(charId) {
    if ($flipbook && $flipbook.data().turn) {
        const targetPage = charIdToPageMap[charId];
        if (targetPage) $flipbook.turn('page', targetPage);
    }
}

function goNextJournalPage() { if ($flipbook) $flipbook.turn('next'); }
function goPrevJournalPage() { if ($flipbook) $flipbook.turn('previous'); }

// --- Other Feature Screens ---

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
    const inventoryContent = document.getElementById('inventory-screen').querySelector('.sub-screen-content');
    if (gameState.inventory.size === 0) {
        inventoryContent.innerHTML = '<p class="empty-inventory-message">Inventory is empty.</p>'; return;
    }
    const categorizedItems = { food: [], ingredient: [], clue: [], key: [], other: [] };
    gameState.inventory.forEach(itemId => {
        const item = assets.items[itemId];
        if (!item) return;
        const category = item.type || 'other';
        if (categorizedItems[category]) categorizedItems[category].push(item);
        else categorizedItems.other.push(item);
    });
    let html = '';
    const categoryOrder = { food: 'Cooked Dishes', ingredient: 'Ingredients', clue: 'Clue Items', key: 'Key Items', other: 'Other' };
    for (const category in categoryOrder) {
        if (categorizedItems[category].length > 0) {
            html += `<div class="inventory-section"><h3>${categoryOrder[category]}</h3><div class="item-grid">`;
            html += categorizedItems[category].map(item => `
                <div class="inventory-item">
                    <img src="${item.thumbnail}" alt="${item.name}" class="item-thumbnail">
                    <h4 class="item-name">${item.name}</h4>
                    <p class="item-description">${item.description}</p>
                    <span class="item-type-tag">${item.type}</span>
                </div>`).join('');
            html += `</div></div>`;
        }
    }
    inventoryContent.innerHTML = html;
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

function renderWorldMapScreen() {
    const container = document.getElementById('world-map-container');
    container.innerHTML = '';
    Object.values(assets.mapLocations).forEach(loc => {
        const isUnlocked = gameState.unlockedMapLocations.has(loc.id);
        const point = document.createElement('div');
        point.className = `map-point ${isUnlocked ? '' : 'locked'}`;
        point.style.top = loc.coords.top;
        point.style.left = loc.coords.left;
        point.dataset.locationId = loc.id;
        point.innerHTML = `<i class="fas fa-map-marker-alt"></i><span class="map-point-tooltip">${loc.name}<br>${isUnlocked ? '(Click to explore)' : '(Location unknown)'}</span>`;
        if (isUnlocked) {
            point.onclick = () => exploreMapLocation(loc.id);
        }
        container.appendChild(point);
    });
}

function exploreMapLocation(locationId) {
    const location = assets.mapLocations[locationId];
    let message = `<p>${location.lore}</p>`;
    if (location.gatherableIngredients && location.gatherableIngredients.length > 0) {
        if (Math.random() > 0.5) {
            const foundIngredientId = location.gatherableIngredients[Math.floor(Math.random() * location.gatherableIngredients.length)];
            const ingredient = assets.items[foundIngredientId];
            gameState.inventory.add(foundIngredientId);
            message += `<br><p style="color: var(--color-fern-glow);">You found: ${ingredient.name}!</p>`;
            showNotification(`Found: ${ingredient.name}`);
        } else {
            message += `<br><p>You searched for ingredients but found nothing this time.</p>`;
        }
    }
    showMessageBox(`Exploring: ${location.name}`, message, false);
}

function renderCookingScreen() {
    const container = document.getElementById('cooking-container');
    const unlockedRecipesHTML = Array.from(gameState.unlockedRecipes).map(id => {
        const recipe = assets.recipes[id];
        return `<div class="recipe-item ${selectedRecipeId === id ? 'selected' : ''}" data-recipe-id="${id}">${recipe.name}</div>`;
    }).join('');
    const lockedRecipesCount = Object.keys(assets.recipes).length - gameState.unlockedRecipes.size;
    const lockedRecipesHTML = lockedRecipesCount > 0 ? `<div class="recipe-item locked">${lockedRecipesCount} more recipes to discover...</div>` : '';
    let detailsHTML = '<h3>Recipe Details</h3><div class="recipe-details-content">';
    if (selectedRecipeId) {
        const recipe = assets.recipes[selectedRecipeId];
        detailsHTML += `<p>${recipe.description}</p><h4>Ingredients:</h4><ul>`;
        let canCook = true;
        for (const ingId in recipe.ingredients) {
            const requiredQty = recipe.ingredients[ingId];
            const hasItem = gameState.inventory.has(ingId); 
            if (!hasItem) canCook = false;
            detailsHTML += `<li class="${hasItem ? 'has-ingredient' : 'missing-ingredient'}">${requiredQty}x ${assets.items[ingId].name} ${hasItem ? '✔' : '✖'}</li>`;
        }
        detailsHTML += '</ul>';
        detailsHTML += `<button class="cook-button" data-recipe-id="${recipe.id}" ${canCook ? '' : 'disabled'}>Cook It!</button>`;
    } else {
        detailsHTML += '<p>Select a recipe to see the details.</p>';
    }
    detailsHTML += '</div>';
    const ingredients = Array.from(gameState.inventory).map(id => assets.items[id]).filter(item => item.type === 'ingredient');
    const ingredientsHTML = ingredients.length > 0 ? ingredients.map(item => `<div class="ingredient-item">${item.name}</div>`).join('') : '<p>No ingredients.</p>';
    container.innerHTML = `
        <div class="cooking-section"><h3>Recipe Book</h3><div class="scrollable-list">${unlockedRecipesHTML}${lockedRecipesHTML}</div></div>
        <div class="cooking-section" id="recipe-details-section">${detailsHTML}</div>
        <div class="cooking-section"><h3>Available Ingredients</h3><div class="scrollable-list">${ingredientsHTML}</div></div>`;
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
            let defaultName = isQuickSaveSlot ? `Slot ${i + 1} (Quick Save)` : `Slot ${i + 1}`;

            slotDiv.innerHTML = `
                <div class="save-thumbnail-container">${slot && slot.thumbnail ? slot.thumbnail : '<div class="save-thumbnail empty-thumbnail"></div>'}</div>
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
        const story = getStoryData(assets);
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