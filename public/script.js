/* =========================================================
   CONFIGURACIÓN
========================================================= */

// ⚠️ API KEY VISIBLE (uso local)
const GEMINI_KEY = "gen-lang-client-0789791742";

// Modelos
const TEXT_MODEL = "gemini-1.5-flash";
const IMAGE_MODEL = "imagen-3.0-generate-001";

// Datos del niño
let child = {
  name: "",
  age: 0
};

/* =========================================================
   NAVEGACIÓN ENTRE PANTALLAS
========================================================= */

function showScreen(id) {
  document.querySelectorAll(".screen")
    .forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goToMonster() {
  child.name = document.getElementById("childName").value.trim();
  child.age = document.getElementById("childAge").value;

  if (!child.name || !child.age) {
    alert("Completá todo 😊");
    return;
  }
  showScreen("screen-monster");
}

/* =========================================================
   CREACIÓN DEL MONSTRUO (IMAGEN REAL)
========================================================= */

async function createMonster() {
  const desc = document.getElementById("monsterDesc").value.trim();
  if (!desc) {
    alert("Describí tu monstruo 👾");
    return;
  }

  showScreen("screen-pet");

  const prompt = `
Cute friendly cartoon monster for children.
Flat illustration, front facing, soft pastel colors.
White or transparent background.

MANDATORY FACE GEOMETRY:
- Two circular eyes
- Eye centers horizontally aligned
- Distance between eye centers exactly 1.8x eye diameter
- Eyes in upper-middle of face
- Mouth centered horizontally
- Mouth exactly one eye-height below eye center line
- Simple clean mouth shape
- Exactly two small square teeth visible

IMPORTANT:
- Clear separation between eyes, mouth and background
- No shadows on face
- Clean shapes suitable for animation overlay

CHILD DESCRIPTION:
${desc}
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateImages?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          numberOfImages: 1,
          imageSize: "512x512"
        })
      }
    );

    const data = await res.json();

    if (!data.images || !data.images[0]?.base64) {
      console.error("Respuesta Imagen:", data);
      alert("No se pudo crear el monstruo 😢");
      return;
    }

    document.getElementById("monster-base").src =
      `data:image/png;base64,${data.images[0].base64}`;

  } catch (err) {
    console.error(err);
    alert("Error creando el monstruo");
  }
}

/* =========================================================
   OJOS SIGUIENDO MOUSE / TOUCH
========================================================= */

document.addEventListener("mousemove", moveEyes);
document.addEventListener("touchmove", e => moveEyes(e.touches[0]));

function moveEyes(e) {
  document.querySelectorAll(".eye").forEach(eye => {
    const pupil = eye.querySelector(".pupil");
    const rect = eye.getBoundingClientRect();

    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const angle = Math.atan2(dy, dx);

    const x = Math.cos(angle) * 6;
    const y = Math.sin(angle) * 6;

    pupil.style.transform = `translate(${x}px, ${y}px)`;
  });
}

/* =========================================================
   CHAT CON EL MONSTRUO (TEXTO)
========================================================= */

async function askMonster() {
  const question = document.getElementById("question").value.trim();
  if (!question) return;

  talk();

  const prompt = `
You are an adorable monster virtual pet.

You are talking to a child named ${child.name},
who is ${child.age} years old.

Rules:
- Always kind and friendly
- Simple words
- Short sentences
- Slightly playful
- Never scary
- Never mention AI or technology
- Maximum 4 sentences

Answer the following question:
"${question}"
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ]
        })
      }
    );

    const data = await res.json();

    if (!data.candidates || !data.candidates[0]) {
      console.error("Respuesta Texto:", data);
      alert("El monstruo no pudo responder 😢");
      return;
    }

    const answer = data.candidates[0].content.parts[0].text;
    document.getElementById("answer").innerText = "👾 " + answer;

  } catch (err) {
    console.error(err);
    alert("Error hablando con el monstruo");
  }
}

/* =========================================================
   BOCA HABLANDO
========================================================= */

function talk() {
  const mouth = document.getElementById("mouth");
  mouth.classList.add("talking");
  setTimeout(() => mouth.classList.remove("talking"), 400);
}
