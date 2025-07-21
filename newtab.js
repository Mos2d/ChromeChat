const bgImg = document.getElementById('bg');

// Load random background from Picsum
bgImg.src = 'https://picsum.photos/' +
  window.screen.width + '/' + window.screen.height + '?random=' + Date.now();

bgImg.onerror = function() {
  console.warn('Picsum failed, loading fallback image.');
  bgImg.src = 'fallback.jpg';  // optional: add a local fallback image
};

// Load random Quran verse
const verseEl = document.getElementById('verse');
const randomAyah = Math.floor(Math.random() * 6236) + 1;

fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/editions/ar.quran-simple,en.sahih`)
  .then(r => r.json())
  .then(res => {
    console.log(res);
    if (res.status === 'OK' && res.data && res.data.length === 2) {
      const arabic = res.data.find(e => e.edition.language === 'ar');
      const english = res.data.find(e => e.edition.language === 'en');

      verseEl.innerHTML = `
        <div class="arabic-text">
            ۝ ${arabic.text} ۝ 
        </div>
        <div class="english-text">
            <b>Surah ${english.surah.number} (${english.surah.englishName}) Ayah ${english.numberInSurah}</b><br>
            “${english.text}”
        </div>
      `;

    } else {
      verseEl.innerText = 'Failed to load verse.';
      console.error('API bad status or missing data:', res);
    }
  })
  .catch(err => {
    console.error('Verse fetch error:', err);
    verseEl.innerText = 'Could not load verse.';
  });

  particlesJS('particles-layer1', {
  particles: {
    number: { value: 5 },
    size: { value: 1.5 },
    color: { value: '#ffffff' },
    opacity: { value: 0.5 },
    move: { speed: 0.8, direction: 'none' },
    line_linked: { enable: false }
  },
  interactivity: { events: { onhover: { enable: false }, onclick: { enable: false } } }
});

particlesJS('particles-layer2', {
  particles: {
    number: { value: 10 },
    size: { value: 1 },
    color: { value: '#ffffff' },
    opacity: { value: 0.2 },
    move: { speed: 0.4, direction: 'none' },
    line_linked: { enable: false }
  },
  interactivity: { events: { onhover: { enable: false }, onclick: { enable: false } } }
});


