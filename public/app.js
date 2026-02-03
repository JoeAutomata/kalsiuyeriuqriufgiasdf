const btn = document.getElementById("generate");
const promptInput = document.getElementById("prompt");
const status = document.getElementById("status");
const img = document.getElementById("result");

btn.onclick = async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  status.textContent = "⏳ Generando imagen...";
  img.src = "";

  try {
    const res = await fetch("/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if (data.image) {
      img.src = data.image;
      status.textContent = "✅ Imagen generada";
    } else {
      status.textContent = "⚠️ No se pudo generar imagen";
    }

  } catch (e) {
    status.textContent = "❌ Error de conexión";
  }
};
