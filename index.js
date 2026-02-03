import express from "express";
import fetch from "node-fetch";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF;

// 🔹 middleware CORRECTO
app.use(express.json());
app.use(express.static("public"));

// 🔹 endpoint imagen
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true }
        })
      }
    );

    const type = response.headers.get("content-type");

    if (!type || !type.startsWith("image")) {
      const err = await response.text();
      console.error("HF ERROR:", err);
      return res.status(500).json({ error: "HF no devolvió imagen" });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.json({
      image: `data:image/png;base64,${buffer.toString("base64")}`
    });

  } catch (e) {
    console.error("SERVER ERROR:", e);
    res.status(500).json({ error: "Error interno" });
  }
});

app.listen(PORT, () => {
  console.log("🧠 AI Image Generator is running!");
});
