import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF;

if (!HF_TOKEN) {
  console.error("❌ Falta la variable de entorno HF");
}

app.use(express.json());
app.use(express.static("public"));

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt vacío" });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(text);
      return res.status(500).json({ error: "HF error" });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    res.json({
      image: `data:image/png;base64,${base64Image}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generando imagen" });
  }
});

app.listen(PORT, () => {
  console.log("🧠 AI Image Generator is running!");
});
