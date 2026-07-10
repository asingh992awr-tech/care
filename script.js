/* ============================================
   SCENE NAVIGATION
   ============================================ */
function goToScene(sceneNumber) {
  const scenes = document.querySelectorAll('.scene');
  scenes.forEach((scene) => {
    scene.classList.toggle('is-active', scene.dataset.scene === String(sceneNumber));
  });
}

let musicStarted = false;

function startMusic() {
  const music = document.getElementById("bgMusic");

  if (!music || musicStarted) return;

  music.play()
    .then(() => {
      musicStarted = true;
      console.log("Music started");
    })
    .catch((err) => {
      console.log("Music blocked:", err);
    });
}

function initSceneButtons() {
  document.querySelectorAll('.btn-next').forEach((btn) => {
    btn.addEventListener('click', () => {

      goToScene(btn.dataset.next); // move scene first

      startMusic(); // then try music

    });
  });
}

/* ============================================
   BOUQUET ACCEPTANCE
   ============================================ */
function initBouquetAcceptance() {
  const acceptBtn = document.getElementById('acceptBouquet');
  const bouquet = document.getElementById('bouquet');

  acceptBtn.addEventListener('click', () => {
    // Mark the bouquet as settled so it stays visible near the bottom
    // of the page for the rest of the experience.
    bouquet.classList.add('bouquet--settled');
    bouquet.parentElement.classList.add('bouquet-wrap--settled');
  });
}

/* ============================================
   AMBIENT SKY (clouds, stars, sparkles, petals, butterflies, ribbons)
   ============================================ */
const SKY_ITEMS = [
  { type: 'cloud', emoji: '☁️', count: 4, sizeRange: [2.2, 3.6], durationRange: [28, 42] },
  { type: 'star', emoji: '⭐', count: 6, sizeRange: [0.7, 1.1], durationRange: [2, 3.5] },
  { type: 'sparkle', emoji: '✨', count: 6, sizeRange: [0.8, 1.3], durationRange: [1.8, 3] },
  { type: 'petal', emoji: '🌸', count: 6, sizeRange: [1, 1.4], durationRange: [10, 18] },
  { type: 'daisy', emoji: '🌼', count: 4, sizeRange: [1, 1.3], durationRange: [12, 20] },
  { type: 'butterfly', emoji: '🦋', count: 3, sizeRange: [1.2, 1.6], durationRange: [6, 10] },
  { type: 'ribbon', emoji: '🎀', count: 2, sizeRange: [1.1, 1.4], durationRange: [3, 4] },
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createSkyItem(type, emoji, sizeRange, durationRange) {
  const el = document.createElement('span');
  el.className = `sky-item sky-item--${type}`;
  el.textContent = emoji;

  const size = randomBetween(...sizeRange);
  const duration = randomBetween(...durationRange);
  const delay = randomBetween(0, duration);
  const startPosition = randomBetween(0, 100);

  el.style.fontSize = `${size}rem`;
  el.style.animationDuration = `${duration}s`;
  el.style.animationDelay = `-${delay}s`;

  // Clouds and butterflies drift horizontally; everything else is
  // positioned across the width and falls or twinkles in place.
  if (type === 'cloud') {
    el.style.top = `${randomBetween(2, 30)}%`;
  } else if (type === 'butterfly') {
    el.style.top = `${randomBetween(15, 70)}%`;
    el.style.left = `${startPosition}%`;
  } else if (type === 'ribbon') {
    el.style.top = `${randomBetween(5, 20)}%`;
    el.style.left = `${startPosition}%`;
  } else {
    el.style.left = `${startPosition}%`;
    el.style.top = type === 'star' || type === 'sparkle' ? `${randomBetween(0, 90)}%` : '-5%';
  }

  return el;
}

function initSky() {
  const sky = document.getElementById('sky');
  const fragment = document.createDocumentFragment();

  SKY_ITEMS.forEach(({ type, emoji, count, sizeRange, durationRange }) => {
    for (let i = 0; i < count; i += 1) {
      fragment.appendChild(createSkyItem(type, emoji, sizeRange, durationRange));
    }
  });

  sky.appendChild(fragment);
}

/* ============================================
   AMBIENT MUSIC (generated softly via Web Audio API,
   no external audio files needed)
   ============================================ */
function createLullaby() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContextClass();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.05;
  masterGain.connect(ctx.destination);

  // A gentle, slow repeating melody using soft sine tones.
  const notes = [523.25, 587.33, 659.25, 587.33, 523.25, 440.0]; // C5 D5 E5 D5 C5 A4
  const noteDuration = 1.1;
  let isPlaying = true;
  let timeoutId = null;

  function playNote(frequency, startTime) {
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(1, startTime + 0.3);
    noteGain.gain.linearRampToValueAtTime(0, startTime + noteDuration);

    osc.connect(noteGain);
    noteGain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + noteDuration + 0.1);
  }

  function scheduleLoop() {
    if (!isPlaying) return;
    const now = ctx.currentTime;
    notes.forEach((freq, i) => playNote(freq, now + i * noteDuration));
    timeoutId = setTimeout(scheduleLoop, notes.length * noteDuration * 1000);
  }

  return {
    start() {
      isPlaying = true;
      ctx.resume();
      scheduleLoop();
    },
    stop() {
      isPlaying = false;
      clearTimeout(timeoutId);
    },
  };
}

function initMusicToggle() {
  const button = document.getElementById("musicToggle");
  const music = document.getElementById("bgMusic");

  let playing = false;

  button.addEventListener("click", async () => {
    if (!playing) {
      try {
        await music.play();
        playing = true;
        button.classList.add("is-playing");
      } catch (err) {
        console.error("Couldn't play audio:", err);
      }
    } else {
      music.pause();
      playing = false;
      button.classList.remove("is-playing");
    }
  });
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initSky();
  initSceneButtons();
  initBouquetAcceptance();
  initMusicToggle();
});
