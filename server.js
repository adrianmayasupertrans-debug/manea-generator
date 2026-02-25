const express = require("express");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static("public"));

function createLyrics(words) {
  return `
Te-am iubit pentru ${words[0]}
Dar m-ai trădat cu ${words[1]}
Toți vorbesc despre ${words[2]}
Dar eu mă ridic din nou

${words[0]}, ${words[1]}, ${words[2]}
Azi sunt sus, nu mai cad
`;
}

app.post("/generate", async (req, res) => {
  const { text } = req.body;
  const words = text.split(" ");
  const lyrics = createLyrics(words);

  const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Ion&text=${encodeURIComponent(lyrics)}`;

  const response = await fetch(ttsUrl);
  const buffer = await response.buffer();

  res.set({
    "Content-Type": "audio/mpeg",
    "Content-Disposition": "attachment; filename=manea.mp3"
  });

  res.send(buffer);
});

app.listen(process.env.PORT || 3000);