const express = require("express");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(express.json());
app.use(express.static("public"));

function createLyrics(words, style) {
  const hook = words.slice(0, 3).join(", ");
  const randomWord = words[Math.floor(Math.random() * words.length)];

  if (style === "romantic") {
    return `
Te-am iubit prin ${words[0]}
Mi-ai lăsat ${randomWord} în suflet
Plâng noaptea pentru ${words[1] || words[0]}

Refren:
${hook}
Inima mea arde pentru tine
${hook}
Fără tine nu-mi e bine
`;
  }

  if (style === "boss") {
    return `
Am pornit de jos cu ${words[0]}
Toți râdeau de ${randomWord}
Acum număr ${words[1] || words[0]}

Refren:
${hook}
Sunt sus și nu mai cad
${hook}
Viața mea e lux curat
`;
  }

  if (style === "toxic") {
    return `
M-ai trădat pentru ${words[0]}
Toți vorbeau de ${randomWord}
Ți-am dat tot și-ai fugit

Refren:
${hook}
Nu mă mai întorc la tine
${hook}
Dușmanii ard de rușine
`;
  }

  return `
Am simțit ${words[0]}
Viața m-a lovit cu ${randomWord}

Refren:
${hook}
Lacrimi cad dar nu cedez
${hook}
Din durere construiesc
`;
}

app.post("/generate", async (req, res) => {
  try {
    const { text, style, preview } = req.body;

    const words = text.trim().split(/\s+/); // 🔥 fără limită

    const lyrics = createLyrics(words, style);

    const voicePath = path.join(__dirname, "voice.mp3");
    const outputPath = path.join(__dirname, preview ? "preview.mp3" : "full.mp3");

    const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Ion&text=${encodeURIComponent(lyrics)}`;

    const response = await fetch(ttsUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!response.ok) {
      return res.status(500).send("Voice generation failed");
    }

    const buffer = await response.buffer();
    fs.writeFileSync(voicePath, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(voicePath)
        .setDuration(preview ? 10 : 25)
        .save(outputPath)
        .on("end", resolve)
        .on("error", reject);
    });

    res.download(outputPath);

  } catch (err) {
    res.status(500).send("Error generating audio");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on http://localhost:3000");
});
