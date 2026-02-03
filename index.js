import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF;

app.use(express.json());
app.use(express.static("public"));

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt vacío" });
    }

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "image/png"
        },
        body: JSON.stringify({
          inputs: prompt,
          options: {
            wait_for_model: true
          }
        })
      }
    );

    const contentType = hfResponse.headers.get("content-type");

    // ❌ HF devolvió JSON (error)
    if (!contentType || !contentType.startsWith("image")) {
      const errorText = await hfResponse.text();
      console.error("HF ERROR:", errorText);
      return res.status(500).json({
        error: "HF no devolvió una imagen"
      });
    }

    // ✅ HF devolvió imagen real
    const buffer = await hfResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    res.json({
      image: `data:image/png;base64,${base64}`
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

app.listen(PORT, () => {
  console.log("🧠 AI Image Generator is running!");
});
