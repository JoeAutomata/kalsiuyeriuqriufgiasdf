import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generar", async (req, res) => {
  const { nombre, descripcion } = req.body;

  const prompt = `
Mascota infantil amigable.
Nombre: ${nombre}
Características: ${descripcion}
Estilo cartoon, colores suaves, ojos grandes y simétricos, boca clara y centrada.
`;

  try {
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const buffer = await hfRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    res.json({ image: `data:image/png;base64,${base64}` });
  } catch (e) {
    res.json({ error: "Error generando imagen" });
  }
});

app.listen(3000, () => console.log("Servidor listo"));
