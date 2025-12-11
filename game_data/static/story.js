// story.js

// 1. CHARACTER SHORTCUTS
const chars = {
    c: ["Clover", "clover"],
    w: ["Willow", "willow"],
    n: ["", null],
    vm: ["Voice", "voice"],
    dean: ["Dean over the speakers", "dean"],
    mom: ["Willow's Mom", "willow_mom"]
};

// 2. THE ENGINE CONVERTER
// Now accepts 'rawStoryData' as an argument, defaults to window.rawStory
function getStoryData(assets, rawStoryData) {
    // If no specific data passed, use the global loaded one
    const storyToProcess = rawStoryData || window.rawStory || [];
    const compiledStory = [];

    storyToProcess.forEach(item => {
        if (!Array.isArray(item)) {
            compiledStory.push(item);
            return;
        }

        const [cmd, ...args] = item;

        // SCENE
        if (cmd === "scene") {
            const bgKey = args[0];
            const bgSrc = assets.backgrounds[bgKey] || bgKey; 
            compiledStory.push({ type: "background", src: bgSrc, fade: true });
            return;
        }

        // MUSIC
        if (cmd === "music") {
            compiledStory.push({ type: "background", play_music: args[0] });
            return;
        }

        // DIALOGUE / SPRITES
        const charDef = chars[cmd];
        if (charDef) {
            const [displayName, spriteKey] = charDef;
            let lines = args;

            if (spriteKey && assets.characters[spriteKey] && lines.length > 0) {
                const potentialEmotion = lines[0];
                const charAssets = assets.characters[spriteKey];
                
                if (charAssets.emotions && charAssets.emotions[potentialEmotion]) {
                    compiledStory.push({
                        type: "sprite_action", character: spriteKey, action: "show",
                        emotion: potentialEmotion, position: "center"
                    });
                    lines.shift();
                } else if (charAssets.emotions && charAssets.emotions.default) {
                     compiledStory.push({
                        type: "sprite_action", character: spriteKey, action: "show",
                        emotion: "default", position: "center"
                    });
                }
            }

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