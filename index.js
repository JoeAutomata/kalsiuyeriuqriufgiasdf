import express from "express";
import axios from "axios";
import path from "path";

const app = express();
app.use(express.json());

// 👇 servir frontend
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

// Ruta raíz → abre la ventana
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// Endpoint imagen
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt requerido" });
    }

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/imagen-3:generateImage",
      {
        prompt: prompt,
        size: "1024x1024"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY
        }
      }
    );

    const imageBase64 = response.data?.data?.[0]?.b64_json;

    res.json({ image: imageBase64 });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Error generando imagen" });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
