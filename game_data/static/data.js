// data.js
// --- Asset & Story Data ---
const assets = {
    backgrounds: {
        graduation: '/static/images/backgrounds/graduation.jpg',
        street: '/static/images/backgrounds/city_street.jpg', 
        forest: '/static/images/backgrounds/forest.jpg',      
        room: 'https://placehold.co/1280x720/74786A/ffffff?text=Clovers+Room',
        darkness: 'https://placehold.co/1280x720/000000/000000?text=', 
    },
    characters: {
        general: { name: 'General', dialog_color_class: 'general-dialogue' },
        clover: { name: 'Clover', dialog_color_class: 'clover' },
        willow: {
            name: 'Willow', 
            dialog_color_class: 'willow',
            bio: "Your childhood best friend and the head of the student council. She loves stars and has a habit of getting you into trouble.",
            emotions: {
                default: '/static/images/sprites/Willow/willow-happy.png', 
                happy: '/static/images/sprites/Willow/willow-happy.png',
                awkward: '/static/images/sprites/Willow/willow-awkward.png'
            }
        },
        nova: {
            name: 'Nova', 
            dialog_color_class: 'nova',
            bio: "A mysterious transfer student with a seemingly bottomless appetite.",
            emotions: {
                default: '/static/images/sprites/Nova/nova-default.png',
            }
        },
        dean: { name: 'Dean', dialog_color_class: 'dean' },
        willow_mom: { name: "Willow's Mom", dialog_color_class: 'willow_mom' },
        voice: { name: "Voice", dialog_color_class: 'general-dialogue' },
        amaryllis: { name: "Amaryllis", dialog_color_class: "amaryllis", bio: "Known for her sharp wit and even sharper fashion sense." },
        kelly: { name: "Kelly", dialog_color_class: "kelly", bio: "A quiet soul who prefers the company of books over people." },
        ray: { name: "Ray", dialog_color_class: "ray", bio: "Energetic and always looking for the next big adventure." },
        clay: { name: "Clay", dialog_color_class: "clay", bio: "Reliable, sturdy, and a bit stubborn." },
        fenrir: { name: "Fenrir", dialog_color_class: "fenrir", bio: "A lone wolf type with a dark past." },
        cerberus: { name: "Cerberus", dialog_color_class: "cerberus", bio: "The loyal guardian of the archives." }
    },
    journalCharacters: ['willow', 'nova', 'amaryllis', 'kelly', 'ray', 'clay', 'fenrir', 'cerberus'],
    items: {
            pebbleton: { name: 'Pebbleton', description: 'A smooth, grey rock. Nova gave it to you.', thumbnail: 'https://placehold.co/100x100/999999/ffffff?text=Pebbleton', type: 'key' },
            mysterious_orb: { name: 'Mysterious Orb', description: 'Pulses with a faint, otherworldly light.', thumbnail: 'https://placehold.co/100x100/87ceeb/000000?text=Orb', type: 'key' },
            smugglers_ledger: { name: "Smuggler's Ledger", description: 'A coded ledger found at the docks.', thumbnail: 'https://placehold.co/100x100/8B4513/FFFFFF?text=Ledger', type: 'clue' },
            sun_kissed_berries: { name: 'Sun-Kissed Berries', description: 'Sweet and juicy berries that grow in sunny clearings.', thumbnail: 'https://placehold.co/100x100/FF6347/FFFFFF?text=Berries', type: 'ingredient' },
            river_root_spice: { name: 'River-Root Spice', description: 'A spicy root found near riverbanks.', thumbnail: 'https://placehold.co/100x100/D2691E/FFFFFF?text=Spice', type: 'ingredient' },
            cave_salt: { name: 'Cave Salt', description: 'Crunchy salt crystals from deep caves.', thumbnail: 'https://placehold.co/100x100/F5F5F5/333333?text=Salt', type: 'ingredient' },
            hearty_stew_dish: { name: "Hearty Stew", description: "A warm, savory stew. Tastes like home.", thumbnail: 'https://placehold.co/100x100/A0522D/FFFFFF?text=Stew', type: 'food'},
    },
    recipes: {
        hearty_stew: {
            id: 'hearty_stew',
            name: "Hearty Stew",
            description: "A simple but filling stew, perfect for a weary traveler. Kelly would probably like this.",
            ingredients: { 'river_root_spice': 1, 'cave_salt': 1 },
            result: 'hearty_stew_dish'
        },
        berry_tarts: {
            id: 'berry_tarts',
            name: "High-Energy Berry Tarts",
            description: "Sweet and zesty tarts. Looks like something Nova would devour in seconds.",
            ingredients: { 'sun_kissed_berries': 2 },
            result: 'berry_tarts_dish'
        }
    },
    mapLocations: {
        everfall_city: {
            id: 'everfall_city',
            name: 'Everfall City',
            description: 'The main hub of this world. Bustling with activity.',
            coords: { top: '50%', left: '50%' },
            lore: 'The capital city, heavily guarded but full of merchants and secrets.'
        },
        slaving_compound: {
            id: 'slaving_compound',
            name: 'Slaver Compound',
            description: 'A grim place from your recent past.',
            coords: { top: '75%', left: '20%' },
            lore: 'You were held captive here. The memories are still fresh.',
            gatherableIngredients: ['cave_salt']
        },
        darnen_ruins: {
            id: 'darnen_ruins',
            name: "Darnen's Ruins",
            description: 'The ancient ruins where you discovered the altar.',
            coords: { top: '25%', left: '75%' },
            lore: 'An ancient place of power. You feel a strange energy lingering.',
            gatherableIngredients: ['sun_kissed_berries', 'river_root_spice']
        }
    },
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

// Character notes initialization
let characterNotes = {};
if (!characterNotes['general']) {
    characterNotes['general'] = '';
}