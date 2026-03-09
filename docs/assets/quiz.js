/* HRa Quiz — runtime YAML loader, no build step needed
   Requires: js-yaml and Chart.js loaded before this script */

(function () {
  'use strict';

  const STORAGE_KEY = 'hra_quiz_v2';
  const YAML_PATH   = './questions.yaml';

  // ── State ────────────────────────────────────────────────────────────────
  let questions  = [];
  let current    = 0;
  let answered   = false;
  let scores     = {};
  let answeredQs = {};

  // ── Boot ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('quiz-root');
    if (!root) return;
    root.innerHTML = '<div class="quiz-loading"><div class="quiz-spinner"></div><p>Vragen laden…</p></div>';

    fetch(YAML_PATH)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(text => {
        // Sort by id so YAML order = quiz order; gaps in id are fine
        questions = jsyaml.load(text).questions.sort((a, b) => a.id - b.id);

        const saved = loadProgress();
        if (saved) {
          current    = Math.min(saved.current, questions.length - 1);
          scores     = saved.scores     || {};
          answeredQs = saved.answeredQs || {};
        }

        // Build persistent two-column layout once
        root.innerHTML = `
          <div class="quiz-layout">
            <div id="quiz-main"></div>
            <aside class="quiz-sidebar">
              <div class="quiz-chart-section">
                <h3 class="quiz-chart-title">
                  <em>Your performance by topic</em><br>Jouw prestaties per onderwerp
                </h3>
                <div class="quiz-chart-wrap">
                  <canvas id="quiz-chart"></canvas>
                </div>
                <p class="quiz-chart-hint">Click a bar → study material</p>
              </div>
            </aside>
          </div>`;

        renderQuestion();
        renderChart();
      })
      .catch(err => {
        root.innerHTML = `<div class="quiz-error">⚠️ Kon vragen niet laden (${err}). Controleer of questions.yaml op de server staat.</div>`;
      });
  });

  // ── Render question (only updates #quiz-main) ─────────────────────────────
  function renderQuestion() {
    const main = document.getElementById('quiz-main');
    if (!main) return;
    if (current >= questions.length) { renderFinished(); return; }

    const q       = questions[current];
    const qId     = q.id;
    const prevAns = answeredQs[qId];
    answered      = prevAns !== undefined;

    const num  = current + 1;
    const tot  = questions.length;
    const pct  = Math.round((num - 1) / tot * 100);
    const letters = ['A','B','C','D','E'];
    const doneSoFar = Object.keys(answeredQs).length;

    // Nav dots — green = correct, red = wrong, blue = current, grey = unanswered
    const dotsHtml = questions.map((_, i) => {
      const q2      = questions[i];
      const chosen  = answeredQs[q2.id];
      const isNow   = i === current;
      const isDone  = chosen !== undefined;
      const isRight = isDone && q2.answers[chosen]?.correct;
      let cls = 'quiz-dot';
      if (isNow)        cls += ' quiz-dot--active';
      if (isDone)       cls += isRight ? ' quiz-dot--correct' : ' quiz-dot--wrong';
      return `<span class="${cls}" onclick="quizGoTo(${i})" title="Question ${i+1}"></span>`;
    }).join('');

    // Answers
    const answersHtml = q.answers.map((a, i) => {
      let cls = '';
      if (prevAns !== undefined) {
        cls = a.correct ? 'quiz-option--correct'
            : i === prevAns ? 'quiz-option--wrong'
            : 'quiz-option--neutral';
      }
      return `
        <button class="quiz-option ${cls}" onclick="quizAnswer(${i})"
          ${prevAns !== undefined ? 'disabled' : ''}>
          <span class="quiz-letter">${letters[i]}</span>
          <span class="quiz-option-text">
            <em class="quiz-opt-en">${escHtml(a.text_en)}</em>
            <span class="quiz-opt-nl">${escHtml(a.text_nl)}</span>
          </span>
        </button>`;
    }).join('');

    // Feedback (shown immediately if already answered)
    const feedbackHtml = prevAns !== undefined
      ? q.answers.map((a, i) => `
          <div class="quiz-fb-item ${a.correct ? 'quiz-fb--correct' : 'quiz-fb--wrong'}">
            <span class="quiz-fb-letter">${letters[i]}</span>
            <span class="quiz-fb-text">
              <em>${escHtml(a.feedback_en)}</em><br>
              ${escHtml(a.feedback_nl)}
            </span>
          </div>`).join('')
      : '';

    const nextVisible = prevAns !== undefined ? '' : 'style="visibility:hidden"';

    main.innerHTML = `
      <div class="quiz-card" style="animation: slideIn .35s ease">

        <div class="quiz-header">
          <span class="quiz-topic-badge">
            <em>${escHtml(q.topic_en)}</em><br>
            <span class="quiz-topic-nl">${escHtml(q.topic_nl)}</span>
          </span>
          <div class="quiz-header-right">
            <span class="quiz-counter">${num} / ${tot}</span>
            <button class="quiz-btn-fresh" onclick="quizFresh()" title="Start a new quiz and reset results">↺ New Quiz / Reset Results</button>
          </div>
        </div>

        ${doneSoFar > 0 && doneSoFar < tot ? `
          <div class="quiz-resume-banner">✓ Voortgang hersteld · ${doneSoFar} / ${tot} beantwoord</div>` : ''}

        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width:${pct}%"></div>
        </div>

        ${q.image ? `<div class="quiz-image-wrap"><img src="${q.image}" alt="" class="quiz-img" loading="lazy"></div>` : ''}

        <div class="quiz-question">
          <p class="quiz-q-en"><em>${escHtml(q.question_en)}</em></p>
          <p class="quiz-q-nl">${escHtml(q.question_nl)}</p>
        </div>

        <div class="quiz-answers">${answersHtml}</div>

        <div id="quiz-feedback" class="quiz-feedback-area">${feedbackHtml}</div>

        <div class="quiz-footer">
          <div class="quiz-nav">
            <button class="quiz-btn-prev" onclick="quizPrev()" ${current === 0 ? 'style="visibility:hidden"' : ''}>← Vorige</button>
            <div class="quiz-nav-dots">${dotsHtml}</div>
            <button class="quiz-btn-next" id="btn-next" onclick="quizNext()" ${nextVisible}>
              ${current === tot - 1 ? 'Resultaten →' : 'Volgende →'}
            </button>
          </div>
          <a class="quiz-study-link" href="${q.topic_link}" target="_blank">
            📖 <em>${escHtml(q.topic_en)}</em> / ${escHtml(q.topic_nl)}
          </a>
        </div>
      </div>`;
  }

  // ── Answer handler ────────────────────────────────────────────────────────
  window.quizAnswer = function(chosenIdx) {
    if (answered) return;
    answered = true;

    const q      = questions[current];
    const topic  = q.topic_nl;
    const isCorr = q.answers[chosenIdx].correct;
    const letters = ['A','B','C','D','E'];

    if (!scores[topic]) scores[topic] = { correct: 0, total: 0 };
    scores[topic].total += 1;
    if (isCorr) scores[topic].correct += 1;

    answeredQs[q.id] = chosenIdx;
    saveProgress();

    // Style buttons
    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
      btn.disabled = true;
      const a = q.answers[i];
      btn.classList.add(
        a.correct ? 'quiz-option--correct'
        : i === chosenIdx ? 'quiz-option--wrong'
        : 'quiz-option--neutral'
      );
    });

    // Show feedback directly under the answers
    const feedDiv = document.getElementById('quiz-feedback');
    feedDiv.innerHTML = q.answers.map((a, i) => `
      <div class="quiz-fb-item ${a.correct ? 'quiz-fb--correct' : 'quiz-fb--wrong'}"
           style="animation-delay:${i * 70}ms">
        <span class="quiz-fb-letter">${letters[i]}</span>
        <span class="quiz-fb-text">
          <em>${escHtml(a.feedback_en)}</em><br>
          ${escHtml(a.feedback_nl)}
        </span>
      </div>`).join('');
    feedDiv.style.animation = 'fadeIn .4s ease';

    // Show next button
    const btn = document.getElementById('btn-next');
    if (btn) btn.style.visibility = 'visible';

    // Mark current dot as correct/wrong
    const dots = document.querySelectorAll('.quiz-dot');
    if (dots[current]) dots[current].classList.add(isCorr ? 'quiz-dot--correct' : 'quiz-dot--wrong');

    renderChart();
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  window.quizNext  = function() { current += 1; if (current >= questions.length) { renderFinished(); return; } renderQuestion(); scrollToQuiz(); };
  window.quizPrev  = function() { if (current > 0) { current -= 1; renderQuestion(); scrollToQuiz(); } };
  window.quizGoTo  = function(i) { current = i; renderQuestion(); scrollToQuiz(); };

  window.quizFresh = function() {
    if (!confirm('Start a new quiz and reset all results?')) return;
    clearProgress();
    current = 0; answered = false; scores = {}; answeredQs = {};
    renderQuestion();
    renderChart();
    scrollToQuiz();
  };

  function scrollToQuiz() {
    const root = document.getElementById('quiz-root');
    if (root) window.scrollTo({ top: root.offsetTop - 60, behavior: 'smooth' });
  }

  // ── Finished screen ───────────────────────────────────────────────────────
  function renderFinished() {
    const main = document.getElementById('quiz-main');
    if (!main) return;
    let total = 0, correct = 0;
    Object.values(scores).forEach(s => { total += s.total; correct += s.correct; });
    const pct = total ? Math.round(correct / total * 100) : 0;

    main.innerHTML = `
      <div class="quiz-card quiz-finished" style="animation: slideIn .35s ease">
        <div class="quiz-done-icon">${pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
        <h2>Quiz voltooid! / Quiz complete!</h2>
        <p class="quiz-done-score">${correct} / ${total} correct &nbsp;|&nbsp; ${pct}%</p>
        <p class="quiz-done-msg">${
          pct >= 70 ? 'Uitstekend gedaan! / Excellent work!' :
          pct >= 50 ? 'Goed bezig! Nog een beetje oefenen. / Good effort, keep practicing!' :
                      'Bestudeer de onderwerpen en probeer het opnieuw. / Study the topics and try again.'
        }</p>
        <div class="quiz-done-btns">
          <button class="quiz-btn-next" onclick="quizGoTo(0)">← Terug naar begin</button>
          <button class="quiz-btn-fresh" onclick="quizFresh()">↺ New Quiz / Reset Results</button>
        </div>
      </div>`;

    renderChart();
  }

  // ── Chart ─────────────────────────────────────────────────────────────────
  let chartInstance = null;

  // Smooth red→orange→yellow→lime→green gradient (10 stops)
  function scoreColor(pct) {
    const stops = [
      [0,   [220, 38,  38 ]],  // red
      [15,  [239, 68,  68 ]],
      [25,  [249, 115, 22 ]],  // orange
      [35,  [251, 146, 60 ]],
      [45,  [245, 158, 11 ]],  // amber
      [55,  [234, 179, 8  ]],  // yellow
      [65,  [163, 230, 53 ]],  // lime
      [72,  [74,  222, 128]],  // light green
      [82,  [34,  197, 94 ]],  // green
      [100, [21,  128, 61 ]],  // dark green
    ];
    for (let i = 0; i < stops.length - 1; i++) {
      if (pct <= stops[i + 1][0]) {
        const t  = (pct - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
        const r  = Math.round(stops[i][1][0] + t * (stops[i + 1][1][0] - stops[i][1][0]));
        const g  = Math.round(stops[i][1][1] + t * (stops[i + 1][1][1] - stops[i][1][1]));
        const b  = Math.round(stops[i][1][2] + t * (stops[i + 1][1][2] - stops[i][1][2]));
        return { bg: `rgba(${r},${g},${b},0.82)`, border: `rgb(${r},${g},${b})` };
      }
    }
    return { bg: 'rgba(21,128,61,0.82)', border: 'rgb(21,128,61)' };
  }

  function renderChart() {
    const canvas = document.getElementById('quiz-chart');
    if (!canvas) return;

    const allTopics  = [...new Set(questions.map(q => q.topic_nl))];
    const topicLinks = {}, topicEn = {};
    questions.forEach(q => { topicLinks[q.topic_nl] = q.topic_link; topicEn[q.topic_nl] = q.topic_en; });

    const labels = allTopics.map(nl => [topicEn[nl], nl]);
    const rawData = allTopics.map(nl => {
      const s = scores[nl];
      return (!s || s.total === 0) ? null : Math.round(s.correct / s.total * 100);
    });

    const bgColors     = rawData.map(v => v === null ? 'rgba(209,213,219,0.35)' : scoreColor(v).bg);
    const borderColors = rawData.map(v => v === null ? 'rgba(156,163,175,0.5)'  : scoreColor(v).border);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: rawData.map(v => v ?? 0),
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 5,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const nl = allTopics[ctx.dataIndex];
                const s  = scores[nl];
                if (!s || s.total === 0) return 'Not answered yet';
                return `${ctx.parsed.x}%  (${s.correct}/${s.total} correct)`;
              }
            }
          }
        },
        scales: {
          x: {
            min: 0, max: 100,
            ticks: { callback: v => v + '%', color: '#6b7280', font: { size: 10 } },
            grid:  { color: 'rgba(0,0,0,0.05)' }
          },
          y: {
            ticks: { color: '#374151', font: { size: 10 } },
            grid:  { display: false }
          }
        },
        onClick: (_e, els) => {
          if (els.length) {
            const link = topicLinks[allTopics[els[0].index]];
            if (link) window.open(link, '_blank');
          }
        }
      }
    });
  }

  // ── Persistence ───────────────────────────────────────────────────────────
  function saveProgress()  { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ current, scores, answeredQs })); } catch {} }
  function loadProgress()  { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
  function clearProgress() { try { localStorage.removeItem(STORAGE_KEY); } catch {} }

  // ── Utilities ─────────────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();
