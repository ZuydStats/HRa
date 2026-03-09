/* HRa Quiz — runtime YAML loader, no build step needed
   Requires: js-yaml and Chart.js loaded before this script */

(function () {
  'use strict';

  const STORAGE_KEY = 'hra_quiz_scores';
  const YAML_PATH   = './questions.yaml';

  // ── State ────────────────────────────────────────────────────────────────
  let questions = [];
  let current   = 0;
  let answered  = false;
  let scores    = loadScores();   // { topic: { correct, total } }

  // ── Boot ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('quiz-root');
    if (!root) return;
    root.innerHTML = '<div class="quiz-loading"><div class="quiz-spinner"></div><p>Vragen laden…</p></div>';

    fetch(YAML_PATH)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(text => {
        questions = jsyaml.load(text).questions;
        shuffle(questions);
        renderQuestion();
        renderChart();
      })
      .catch(err => {
        root.innerHTML = `<div class="quiz-error">⚠️ Kon vragen niet laden (${err}). Controleer of questions.yaml op de server staat.</div>`;
      });
  });

  // ── Render question ───────────────────────────────────────────────────────
  function renderQuestion() {
    const root = document.getElementById('quiz-root');
    if (current >= questions.length) { renderFinished(); return; }

    answered = false;
    const q   = questions[current];
    const num = current + 1;
    const tot = questions.length;
    const pct = Math.round((num - 1) / tot * 100);

    const letters = ['A','B','C','D','E'];

    root.innerHTML = `
      <div class="quiz-card" style="animation: slideIn .35s ease">
        <div class="quiz-header">
          <span class="quiz-topic-badge"><em>${escHtml(q.topic_en)}</em><br><span class="quiz-topic-nl">${escHtml(q.topic_nl)}</span></span>
          <span class="quiz-counter">${num} / ${tot}</span>
        </div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>

        ${q.image ? `<div class="quiz-image-wrap"><img src="${q.image}" alt="Vraagafbeelding" class="quiz-img" loading="lazy"></div>` : ''}

        <div class="quiz-question">
          <p class="quiz-q-en"><em>${escHtml(q.question_en)}</em></p>
          <p class="quiz-q-nl">${escHtml(q.question_nl)}</p>
        </div>

        <div class="quiz-answers" id="quiz-answers">
          ${q.answers.map((a, i) => `
            <button class="quiz-option" data-index="${i}" onclick="quizAnswer(${i})">
              <span class="quiz-letter">${letters[i]}</span>
              <span class="quiz-option-text">
                <em class="quiz-opt-en">${escHtml(a.text_en)}</em>
                <span class="quiz-opt-nl">${escHtml(a.text_nl)}</span>
              </span>
            </button>
          `).join('')}
        </div>

        <div id="quiz-feedback" class="quiz-feedback-area" style="display:none"></div>

        <div class="quiz-footer">
          <button class="quiz-btn-next" id="btn-next" onclick="quizNext()" style="display:none">
            Volgende vraag →
          </button>
          <a class="quiz-study-link" href="${q.topic_link}" target="_blank">
            📖 Study material: <em>${escHtml(q.topic_en)}</em> / ${escHtml(q.topic_nl)}
          </a>
        </div>
      </div>

      <div class="quiz-chart-section">
        <h3 class="quiz-chart-title">Jouw prestaties per onderwerp</h3>
        <canvas id="quiz-chart" height="220"></canvas>
        <p class="quiz-chart-hint">Klik op een balk om naar het studiemateriaal te gaan.</p>
      </div>
    `;

    renderChart();
  }

  // ── Answer handler (called from inline onclick) ───────────────────────────
  window.quizAnswer = function(chosenIdx) {
    if (answered) return;
    answered = true;

    const q       = questions[current];
    const buttons = document.querySelectorAll('.quiz-option');
    const feedDiv = document.getElementById('quiz-feedback');

    // Record score (keyed by Dutch topic name for stable localStorage)
    const topic = q.topic_nl;
    if (!scores[topic]) scores[topic] = { correct: 0, total: 0 };
    scores[topic].total += 1;
    const isCorrect = q.answers[chosenIdx].correct;
    if (isCorrect) scores[topic].correct += 1;
    saveScores();

    // Style each button
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      const a = q.answers[i];
      if (a.correct) {
        btn.classList.add('quiz-option--correct');
      } else if (i === chosenIdx && !a.correct) {
        btn.classList.add('quiz-option--wrong');
      } else {
        btn.classList.add('quiz-option--neutral');
      }
    });

    // Build feedback HTML
    const letters = ['A','B','C','D','E'];
    const feedHtml = q.answers.map((a, i) => `
      <div class="quiz-fb-item ${a.correct ? 'quiz-fb--correct' : 'quiz-fb--wrong'}" style="animation-delay:${i*80}ms">
        <span class="quiz-fb-letter">${letters[i]}</span>
        <span class="quiz-fb-text">
          <em>${escHtml(a.feedback_en)}</em><br>
          ${escHtml(a.feedback_nl)}
        </span>
      </div>
    `).join('');

    feedDiv.innerHTML = feedHtml;
    feedDiv.style.display = 'block';
    feedDiv.style.animation = 'fadeIn .4s ease';

    document.getElementById('btn-next').style.display = 'inline-flex';
    renderChart();
  };

  // ── Next button ───────────────────────────────────────────────────────────
  window.quizNext = function() {
    current += 1;
    if (current >= questions.length) { renderFinished(); return; }
    renderQuestion();
    window.scrollTo({ top: document.getElementById('quiz-root').offsetTop - 60, behavior: 'smooth' });
  };

  // ── Finished screen ───────────────────────────────────────────────────────
  function renderFinished() {
    const root  = document.getElementById('quiz-root');
    let total = 0, correct = 0;
    Object.values(scores).forEach(s => { total += s.total; correct += s.correct; });
    const pct = total ? Math.round(correct / total * 100) : 0;

    root.innerHTML = `
      <div class="quiz-card quiz-finished" style="animation: slideIn .35s ease">
        <div class="quiz-done-icon">${pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
        <h2>Quiz voltooid!</h2>
        <p class="quiz-done-score">${correct} / ${total} correct &nbsp;|&nbsp; ${pct}%</p>
        <p class="quiz-done-msg">${pct >= 70 ? 'Uitstekend gedaan!' : pct >= 50 ? 'Goed bezig – nog een beetje oefenen!' : 'Bestudeer de onderwerpen hieronder en probeer het opnieuw.'}</p>
        <button class="quiz-btn-next" onclick="quizRestart()">Opnieuw beginnen 🔄</button>
      </div>
      <div class="quiz-chart-section">
        <h3 class="quiz-chart-title">Jouw prestaties per onderwerp</h3>
        <canvas id="quiz-chart" height="280"></canvas>
        <p class="quiz-chart-hint">Klik op een balk om naar het studiemateriaal te gaan.</p>
      </div>
    `;
    renderChart();
  }

  window.quizRestart = function() {
    current  = 0;
    answered = false;
    shuffle(questions);
    renderQuestion();
  };

  // ── Chart ─────────────────────────────────────────────────────────────────
  let chartInstance = null;

  function renderChart() {
    const canvas = document.getElementById('quiz-chart');
    if (!canvas) return;

    // Gather all topics from questions
    const allTopics  = [...new Set(questions.map(q => q.topic_nl))];
    const topicLinks = {};
    const topicEn    = {};
    questions.forEach(q => {
      topicLinks[q.topic_nl] = q.topic_link;
      topicEn[q.topic_nl]    = q.topic_en;
    });

    // Chart labels: "English / Nederlands" (two lines via array)
    const labels = allTopics.map(nl => [topicEn[nl], nl]);
    const data   = labels.map(t => {
      const s = scores[t];
      if (!s || s.total === 0) return null;
      return Math.round(s.correct / s.total * 100);
    });

    const colors = data.map(v =>
      v === null ? 'rgba(200,200,200,0.3)' :
      v >= 70    ? 'rgba(34,197,94,0.75)' :
      v >= 50    ? 'rgba(251,191,36,0.75)' :
                   'rgba(239,68,68,0.75)'
    );
    const borders = colors.map(c => c.replace('0.75', '1'));

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '% correct',
          data: data.map(v => v ?? 0),
          backgroundColor: colors,
          borderColor: borders,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        animation: { duration: 600, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const nl = allTopics[ctx.dataIndex];
                const s  = scores[nl];
                if (!s || s.total === 0) return 'Not answered yet / Nog niet beantwoord';
                return `${ctx.parsed.x}%  (${s.correct}/${s.total} correct)`;
              }
            }
          }
        },
        scales: {
          x: {
            min: 0, max: 100,
            ticks: { callback: v => v + '%', color: '#6b7280' },
            grid: { color: 'rgba(0,0,0,0.06)' }
          },
          y: {
            ticks: { color: '#374151', font: { size: 12 } },
            grid: { display: false }
          }
        },
        onClick: (evt, elements) => {
          if (elements.length) {
            const nl   = allTopics[elements[0].index];
            const link = topicLinks[nl];
            if (link) window.open(link, '_blank');
          }
        }
      }
    });
  }

  // ── Persistence ───────────────────────────────────────────────────────────
  function loadScores() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }
  function saveScores() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scores)); }
    catch {}
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function escHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
