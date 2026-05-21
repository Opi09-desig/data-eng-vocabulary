// ── State ────────────────────────────────────────────────
let idx      = parseInt(localStorage.getItem('vocabIndex')) || 0;
let streak   = 0;
let quizMode = false;
let isFlipped = false;
const mastered = new Set(
    JSON.parse(localStorage.getItem('vocabMastered') || '[]')
);

// ── Render ───────────────────────────────────────────────
function render() {
    const item = vocabList[idx];

    // Animate card entrance
    const scene = document.getElementById('card-scene');
    scene.classList.remove('entering');
    void scene.offsetWidth;                    // force reflow
    scene.classList.add('entering');

    // Reset flip
    document.getElementById('card-inner').classList.remove('flipped');
    isFlipped = false;

    // Front face
    document.getElementById('pos').textContent      = item.pos;
    document.getElementById('word').textContent     = item.word;
    document.getElementById('phonetic').textContent = item.phonetic;

    // Back face
    document.getElementById('meaning').textContent = item.meaning;
    document.getElementById('example').textContent = item.example;

    // Counter & progress
    document.getElementById('cur').textContent  = idx + 1;
    document.getElementById('prog').style.width =
        ((idx + 1) / vocabList.length * 100).toFixed(1) + '%';

    // Mastered button state
    document.getElementById('mastered-btn')
        .classList.toggle('on', mastered.has(idx));
    document.getElementById('mcount').textContent = mastered.size;

    // Persist index
    localStorage.setItem('vocabIndex', idx);

    // Quiz mode reset
    if (quizMode) {
        const qi = document.getElementById('quiz-input');
        qi.value = '';
        qi.className = 'quiz-input';
        document.getElementById('quiz-fb').textContent = '';
        document.getElementById('quiz-fb').className   = 'quiz-feedback';
        qi.focus();
    }
}

// ── Flip ─────────────────────────────────────────────────
function flipCard() {
    if (quizMode) return;           // disable manual flip in quiz mode
    document.getElementById('card-inner').classList.toggle('flipped');
    isFlipped = !isFlipped;
}

// ── Navigation ───────────────────────────────────────────
function navigate(dir) {
    idx = (idx + dir + vocabList.length) % vocabList.length;
    render();
}

// ── Quiz ─────────────────────────────────────────────────
function toggleQuizMode() {
    quizMode = !quizMode;

    document.getElementById('quiz-panel')
        .classList.toggle('active', quizMode);
    document.getElementById('check-btn')
        .classList.toggle('active', quizMode);
    document.getElementById('mode-toggle')
        .classList.toggle('active', quizMode);

    // In quiz mode, card click should NOT flip
    document.getElementById('card-scene').style.cursor =
        quizMode ? 'default' : 'pointer';

    if (quizMode) document.getElementById('quiz-input').focus();
}

function checkAnswer() {
    const input = document.getElementById('quiz-input');
    const fb    = document.getElementById('quiz-fb');
    const val   = input.value.trim().toLowerCase();
    if (!val) return;

    const correct = vocabList[idx].meaning.toLowerCase();
    const words   = correct.split(/\s+/);
    const hits    = words.filter(w => val.includes(w.replace(/[^a-z]/g, '')));
    const score   = hits.length / words.length;

    if (score >= 0.5) {
        input.className      = 'quiz-input correct';
        fb.textContent       = '✓ ¡Correcto!' + (score < 1 ? ' (aprox.)' : '');
        fb.className         = 'quiz-feedback ok';
        streak++;
        document.getElementById('streak').textContent = streak;
        setTimeout(() => navigate(1), 1200);
    } else {
        input.className      = 'quiz-input wrong';
        fb.textContent       = '✗ Significado: ' + vocabList[idx].meaning;
        fb.className         = 'quiz-feedback no';
        streak               = 0;
        document.getElementById('streak').textContent = 0;
    }
}

// ── Mastered ─────────────────────────────────────────────
function toggleMastered() {
    if (mastered.has(idx)) {
        mastered.delete(idx);
    } else {
        mastered.add(idx);
    }
    document.getElementById('mastered-btn')
        .classList.toggle('on', mastered.has(idx));
    document.getElementById('mcount').textContent = mastered.size;
    localStorage.setItem('vocabMastered', JSON.stringify([...mastered]));
}

// ── Keyboard shortcuts ───────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') {
        if (e.key === 'Enter') checkAnswer();
        return;
    }
    if (e.key === 'ArrowRight')          navigate(1);
    else if (e.key === 'ArrowLeft')      navigate(-1);
    else if (e.key === ' ') { e.preventDefault(); flipCard(); }
    else if (e.key === 'm' || e.key === 'M') toggleMastered();
});

// ── Init ─────────────────────────────────────────────────
document.getElementById('total').textContent  = vocabList.length;
document.getElementById('total2').textContent = vocabList.length;
render();