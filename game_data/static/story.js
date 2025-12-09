// ============================================================================
// 1. CHARACTER SHORTCUTS
// ============================================================================
const chars = {
    // Code: ["Display Name", "Asset_Key_In_Script_JS"]
    c: ["Clover", "clover"],
    w: ["Willow", "willow"],
    n: ["", null], // Narration
    vm: ["Voice", "voice"],
    dean: ["Dean over the speakers", "dean"],
    mom: ["Willow's Mom", "willow_mom"]
};

// ============================================================================
// 2. THE STORY SCRIPT
// ============================================================================
// Syntax:
// ["char", "Text"] -> Dialogue
// ["char", "emotion", "Text"] -> Sprite Change + Dialogue
// ["scene", "bg_key"] -> Change Background (Fade default)
// ["music", "track_key"] -> Play Music
// ============================================================================

const rawStory = [
    // --- Start ---
    ["scene", "darkness"], // Start in black
    ["n", "Prologue"],
    
    // Voice Section
    ["vm", "Kaelia O'Ashen…", "...Na-Morn Solvae…", "...Tel…", "Ug-h…"],

    // Transition to Hall
    ["scene", "graduation"], 
    ["n", "Huh?", "The voice of the Dean booming over the speakers snaps me out of my head - a voice I've begun to hate over the years spent here."],

    ["dean", "Congratulations, graduates! You have worked hard and persisted through many challenges to reach this moment."],

    ["c", "Well… I guess I really need to get more sleep…"],

    ["n", "I sigh as I cross my arms, glancing at my classmates. The festive atmosphere is almost infectious... almost."],

    ["c", "We're finally here, huh?"],

    // Willow Appears!
    ["w", "happy", "I know, right!"],

    {
        type: "action",
        action: "unlockCharacter",
        character: "willow" // This MUST match the key in assets.characters (lowercase)
    },

    ["n", "I shift my weight from foot to foot, trying to ignore the bittersweet feeling rising in my chest. As much as I hated this place, I'll miss moments like these - With Willow and the others."],

    ["c", "How are you feeling? Ready for your speech?"],

    ["n", "I see Willow chuckle."],

    // Change emotion to awkward
    ["w", "awkward", "As ready as I'll ever be.. which is to say, not at all."],

    ["n", "I blink a few times, a bit surprised, but the feeling clears soon."],
    
    ["c", "Wait, what?"],

    ["w", "happy", "Haha, a speech is as good as you make it! After all, what matters is if you truly mean those words - and it comes from your heart."],

    ["n", "I can’t help but let out a small chuckle. Typical Willow - If anyone can pull off an improvised speech, it’s her."],

    ["c", "I don't know if I should be impressed, or disappointed. You know, it's probably the last and the most important speech you'll have, you should've at least prepared something!"],

    ["n", "Willow smiles awkwardly, which I immediately respond to with a smile of my own, easing up the tension."],

    ["dean", "That would be all I had to say to you all today. Lastly, a few words from the head of the student council, Willow!"],

    ["w", "happy", "Guess that's me!"],

    ["c", "Good Lu-!?"],

    ["n", "Willow grabs my hand before I can even register what's happening, and starts tugging me along towards the stage."],

    ["c", "W-Willow!? What are you doing??"],

    ["w", "happy", "We do everything together as is, it'd be unfair if you weren't on stage with me!"],

    ["n", "When I hear those words I feel my face burn up, getting warmer by the second. But Willow just smiles back, tightening her grip on my hand as she picks up pace."],

    ["w", "I'll do the talking, don't worry!"],

    ["c", "Uh- yeah, I sure hope so! I don't even know what I would say!"],

    ["n", "The fact that they’d do the talking didn't even cross my mind... I swear, one day, she'll be the death of me!", 
          "As we enter the stage, the crowd feels larger than it ever was before.",
          "Familiar faces blurring into a sea of gazes, all fixed on Willow.",
          "Thankfully, no one is really paying attention to me now."],

    ["w", "awkward", "Hey, everyone. I'm Willow. Most of you probably know me already, or at least heard of me at some point. Some of you may even be tired of hearing my name."],

    ["n", "A few giggles can be heard, certainly the demeaning kind. However, nothing signifies that Willow was moved by it, in fact, her posture improved; as if in response."],

    ["w", "happy", 
        "I could stand here and talk about grades, achievements, or the future... but let's be real, you've already heard all that today. So, instead, I want to talk about stars.",
        "Not the ones up there, but the ones down here. I read this old tale once... it said that everyone gets a couple of 'falling stars' in their life. They're not bad things, not really. They're just... moments."
    ],

    // ... (You can continue pasting the rest of your dialogue here) ...

    // Example of the outfit choice logic:
    ["c", "Okay... what should I wear?"],
    {
        type: "choices",
        id: "outfit_choice",
        choices: [
            { text: "Wear Sweater", next: "choice_sweater" }, // You need to define these IDs later in the array
            { text: "Wear Formal", next: "choice_formal" }
        ]
    }
];

// ============================================================================
// 3. THE ENGINE CONVERTER (Updates assets automatically)
// ============================================================================
function getStoryData(assets) {
    const compiledStory = [];

    rawStory.forEach(item => {
        // Pass through raw objects (choices, complex actions)
        if (!Array.isArray(item)) {
            compiledStory.push(item);
            return;
        }

        const [cmd, ...args] = item;

        // --- COMMAND: SCENE (Backgrounds) ---
        if (cmd === "scene") {
            const bgKey = args[0];
            // Lookup the URL from script.js assets
            const bgSrc = assets.backgrounds[bgKey] || bgKey; 
            compiledStory.push({ type: "background", src: bgSrc, fade: true });
            return;
        }

        // --- COMMAND: MUSIC ---
        if (cmd === "music") {
            compiledStory.push({ type: "background", play_music: args[0] }); // Utilizing existing bg logic for music
            return;
        }

        // --- COMMAND: DIALOGUE / SPRITES ---
        const charDef = chars[cmd];
        if (charDef) {
            const [displayName, spriteKey] = charDef;
            let lines = args;

            // Check if first arg is an Emotion (e.g. "happy")
            if (spriteKey && assets.characters[spriteKey] && lines.length > 0) {
                const potentialEmotion = lines[0];
                const charAssets = assets.characters[spriteKey];
                
                // Does this emotion exist in script.js?
                if (charAssets.emotions && charAssets.emotions[potentialEmotion]) {
                    compiledStory.push({
                        type: "sprite_action",
                        character: spriteKey,
                        action: "show",
                        emotion: potentialEmotion,
                        position: "center"
                    });
                    lines.shift(); // Remove the emotion word from text
                } else if (charAssets.emotions && charAssets.emotions.default) {
                     // Default show if no emotion specified but character has sprites
                     compiledStory.push({
                        type: "sprite_action",
                        character: spriteKey,
                        action: "show",
                        emotion: "default",
                        position: "center"
                    });
                }
            }

            // Push text lines
            lines.forEach(text => {
                if (cmd === "n") {
                    compiledStory.push({ type: "narration", text: text });
                } else {
                    compiledStory.push({ type: "character", name: displayName, text: text });
                }
            });
        }
    });

    return compiledStory;
}