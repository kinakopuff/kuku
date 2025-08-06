// script.js
'use strict';

const fromDanSelect = document.getElementById('fromDan');
const toDanSelect   = document.getElementById('toDan');
const startBtn      = document.getElementById('startBtn');

const startScreen   = document.getElementById('startScreen');
const quizScreen    = document.getElementById('quizScreen');
const summaryScreen = document.getElementById('summaryScreen');

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

/* 段ごとの色マップ */
const colorMap = {
  1: '#e53935', // 赤
  2: '#fb8c00', // オレンジ
  3: '#fdd835', // 黄
  4: '#c0ca33', // 黄緑
  5: '#43a047', // 緑
  6: '#26c6da', // 水色
  7: '#1e88e5', // 青
  8: '#8e24aa', // 紫
  9: '#ec407a'  // ピンク
};

/* セレクト初期化 */
for (let i = 1; i <= 9; i++) {
  fromDanSelect.add(new Option(i, i));
  toDanSelect.add(new Option(i, i));
}
toDanSelect.value = 9;

/* イベント登録 */
startBtn.addEventListener('click', startQuiz);
showAnswerBtn.addEventListener('click', revealAnswer);
nextBtn.addEventListener('click', () => nextQuestion(false));
saveBtn.addEventListener('click', () => nextQuestion(true));
cancelBtn.addEventListener('click', cancelQuiz);
restartBtn.addEventListener('click', restart);

/* クイズ開始 */
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

/* 中止処理 */
function cancelQuiz() {
  showSummary();
}

/* 問題生成 */
function generateQuestions(from, to) {
  questions = [];
  for (let i = from; i <= to; i++) {
    for (let j = 1; j <= 9; j++) {
      questions.push({a: i, b: j});
    }
  }
}

/* シャッフル（フィッシャー–イェーツ） */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* 問題表示 */
function showQuestion() {
  const q = questions[current];
  questionEl.textContent     = `${q.a} × ${q.b}`;
  questionEl.style.color     = colorMap[q.a]; // 段に応じて色変更
  answerEl.textContent       = `${q.a * q.b}`;
  answerEl.classList.add('hidden');
  showAnswerBtn.classList.remove('hidden');
}

/* 答え表示 */
function revealAnswer() {
  answerEl.classList.remove('hidden');
  showAnswerBtn.classList.add('hidden');
}

/* 次の問題へ */
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

/* 保存一覧を表示 */
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
function restart() {
  switchScreen(startScreen);
}

/* 画面切替ユーティリティ */
function switchScreen(target) {
  [startScreen, quizScreen, summaryScreen].forEach(s => s.classList.add('hidden'));
  target.classList.remove('hidden');
}
