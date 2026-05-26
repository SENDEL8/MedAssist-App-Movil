const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

function withMedassistSounds(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const soundsDir = path.join(projectRoot, "assets", "sounds");
      const rawDir = path.join(
        modConfig.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "raw"
      );

      if (!fs.existsSync(soundsDir)) {
        console.warn("[withMedassistSounds] Sounds directory not found:", soundsDir);
        return modConfig;
      }

      fs.mkdirSync(rawDir, { recursive: true });

      const files = fs.readdirSync(soundsDir).filter((f) => f.endsWith(".wav"));
      for (const file of files) {
        const src = path.join(soundsDir, file);
        const dest = path.join(rawDir, file);
        fs.copyFileSync(src, dest);
        console.log(`[withMedassistSounds] Copied: ${file} -> android/app/src/main/res/raw/`);
      }

      return modConfig;
    },
  ]);
}

module.exports = withMedassistSounds;
