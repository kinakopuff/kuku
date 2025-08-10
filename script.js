// script.js
'use strict';

const fromDanSelect = document.getElementById('fromDan');
const toDanSelect   = document.getElementById('toDan');
const startBtn      = document.getElementById('startBtn');

const startScreen   = document.getElementById('startScreen');
const quizScreen    = document.getElementById('quizScreen');
const summaryScreen = document.getElementById('summaryScreen');

const progressEl    = document.getElementById('progress');
const questionEl    = document.getElementById('question');
const answerEl      = document.getElementById('answer');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const nextBtn       = document.getElementById('nextBtn');
const saveBtn       = document.getElementById('saveBtn');
const cancelBtn     = document.getElementById('cancelBtn');

const savedListEl   = document.getElementById('savedList');
const restartBtn    = document.getElementById('restartBtn');

let questions = [];
let current   = 0;
let saved     = [];

/* 段ごとの色 */
const colorMap = {
  1: '#e53935', 2: '#fb8c00', 3: '#fdd835', 4: '#c0ca33', 5: '#43a047',
  6: '#26c6da', 7: '#1e88e5', 8: '#8e24aa', 9: '#ec407a'
};

/* 学校の唱え方の基本（因子用）：
   左（掛けられる数）…1は「いん」、他は下の表
   右（掛ける数）……1は「いち」、他は下の表（同じ）
*/
const chantUnits = ['', 'いち','に','さん','し','ご','ろく','しち','はち','く'];

/* 答え（通常読み 1〜99） */
const unitsKana = ['', 'いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];
const tensKana  = ['', 'じゅう','にじゅう','さんじゅう','よんじゅう','ごじゅう','ろくじゅう','ななじゅう','はちじゅう','きゅうじゅう'];
function numberToKana(n) {
  if (n < 10) return unitsKana[n];
  const t = Math.floor(n / 10), u = n % 10;
  const tStr = (t === 1) ? 'じゅう' : tensKana[t];
  return tStr + (u ? unitsKana[u] : '');
}

/* <ruby>ユーティリティ */
function ruby(num, rt) { return `<ruby>${num}<rt>${rt}</rt></ruby>`; }
/* 「が」を右側読みの直後にスペースを入れて表示 */
const GA_RUBY = ' ' + `<ruby class="ga"><rb>&nbsp;</rb><rt>が</rt></ruby>`;

/* 「が」を付ける条件（前回仕様のまま） */
function needsGa(a, b) {
  if (a === 1) return true; // 1の段
  if (b === 1) return true; // 右が1
  const special = new Set(['2x2','2x3','2x4','3x2','3x3','4x2']);
  return special.has(`${a}x${b}`);
}

/* —— 特殊読みの指定 —— */
/* 右側（掛ける数）の読みが変わる組み合わせ */
const rightOverride = {
  '2x2': 'にん',
  '3x8': 'ぱ',
  '4x8': 'は',
  '5x8': 'は',
  '6x8': 'は',
  '7x8': 'は',
  '9x8': 'は',
  '8x8': 'ぱ',  // 8×8 は右も「ぱ」
  '3x3': 'ざん' // 3×3 は右「ざん」
};
/* 左側（掛けられる数）または両方が変わる組み合わせ */
const leftOverride = {
  '3x3': 'さ',
  '3x6': 'さぶ',
  '5x9': 'ごっ',
  '6x9': 'ろっ',
  '8x8': 'はっ',
  '8x9': 'はっ'
};

/* 左読み（a,b依存：1は「いん」、特殊があれば優先） */
function leftReading(a, b) {
  const key = `${a}x${b}`;
  if (leftOverride[key]) return leftOverride[key];
  return (a === 1) ? 'いん' : chantUnits[a];
}
/* 右読み（a,b依存：1は「いち」、特殊があれば優先） */
function rightReading(a, b) {
  const key = `${a}x${b}`;
  if (rightOverride[key]) return rightOverride[key];
  return chantUnits[b];
}

/* 初期化：1〜9 */
for (let i = 1; i <= 9; i++) {
  fromDanSelect.add(new Option(i, i));
  toDanSelect.add(new Option(i, i));
}
toDanSelect.value = 9;

/* イベント */
startBtn.addEventListener('click', startQuiz);
showAnswerBtn.addEventListener('click', revealAnswer);
nextBtn.addEventListener('click', () => nextQuestion(false));
saveBtn.addEventListener('click', () => nextQuestion(true));
cancelBtn.addEventListener('click', cancelQuiz);
restartBtn.addEventListener('click', restart);

/* 開始 */
function startQuiz() {
  const from = Number(fromDanSelect.value);
  const to   = Number(toDanSelect.value);
  if (from < 1 || to > 9 || from > to) {
    alert('範囲は 1〜9 段で、かつ「何段から」≦「何段まで」でなければならない。');
    return;
  }
  generateQuestions(from, to);
  shuffle(questions);
  current = 0;
  saved   = [];
  switchScreen(quizScreen);
  showQuestion();
}

/* 中止 → 一覧 */
function cancelQuiz() { showSummary(); }

/* 問題生成 */
function generateQuestions(from, to) {
  questions = [];
  for (let i = from; i <= to; i++) {
    for (let j = 1; j <= 9; j++) {
      questions.push({a: i, b: j});
    }
  }
}

/* シャッフル */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* 表示 */
function showQuestion() {
  const q = questions[current];
  progressEl.textContent = `${current + 1} / ${questions.length}`;

  const left = ruby(q.a, leftReading(q.a, q.b));
  const right = ruby(q.b, rightReading(q.a, q.b));
  const ga = needsGa(q.a, q.b) ? GA_RUBY : '';

  // × はふりがなを付けず表示
  questionEl.innerHTML = `${left} × ${right}${ga}`;
  questionEl.style.color = colorMap[q.a];

  // 答え（通常読み）
  answerEl.innerHTML = `= <ruby>${q.a * q.b}<rt>${numberToKana(q.a * q.b)}</rt></ruby>`;
  answerEl.classList.add('hidden');
  showAnswerBtn.classList.remove('hidden');
}

/* 答え表示 */
function revealAnswer() {
  answerEl.classList.remove('hidden');
  showAnswerBtn.classList.add('hidden');
}

/* 次へ */
function nextQuestion(saveCurrent) {
  if (saveCurrent) {
    const q = questions[current];
    saved.push(`${q.a} × ${q.b} = ${q.a * q.b}`);
  }
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    showSummary();
  }
}

/* 一覧画面 */
function showSummary() {
  savedListEl.innerHTML = '';
  saved.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    savedListEl.appendChild(li);
  });
  switchScreen(summaryScreen);
}

/* 再スタート */
function restart() { switchScreen(startScreen); }

/* 画面切替 */
function switchScreen(target) {
  [startScreen, quizScreen, summaryScreen].forEach(s => s.classList.add('hidden'));
  target.classList.remove('hidden');
}
