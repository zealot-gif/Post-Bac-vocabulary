let dbData = { words: [] };
let activeWords = ['detrimental', 'scrupulous', 'ubiquitous'];
let selectedSchoolFilter = 'ALL';
let currentContextWord = 'detrimental';
let chartInstance = null;

const COLOR_PALETTE = [
    { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
    { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
    { border: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' }
];

const ALL_YEARS = Array.from({ length: 22 }, (_, i) => (93 + i).toString());

document.addEventListener('DOMContentLoaded', async () => {
    await initData();
    setupEventListeners();
    renderUI();
});

async function initData() {
    try {
        const response = await fetch('vocab_database.json');
        dbData = await response.json();
    } catch (e) {
        console.error('無法載入預設 JSON 資料庫:', e);
    }
}

function setupEventListeners() {
    document.getElementById('addWordBtn').addEventListener('click', handleAddWord);
    document.getElementById('schoolFilter').addEventListener('change', (e) => {
        selectedSchoolFilter = e.target.value;
        updateChart();
    });
    document.getElementById('contextWordSelect').addEventListener('change', (e) => {
        currentContextWord = e.target.value;
        renderContextList();
    });
}

function renderUI() {
    renderWordTags();
    updateChart();
    renderSchoolStats();
    updateContextSelectOptions();
    renderContextList();
}

function updateChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    const datasets = activeWords.map((wordStr, idx) => {
        const wordObj = dbData.words.find(w => w.word.toLowerCase() === wordStr.toLowerCase());
        const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
        const dataPoints = ALL_YEARS.map(year => (wordObj && wordObj.trends) ? (wordObj.trends[year] || 0) : 0);

        return {
            label: wordObj ? `${wordObj.word} (${wordObj.meaning})` : wordStr,
            data: dataPoints,
            borderColor: color.border,
            backgroundColor: color.bg,
            borderWidth: 3,
            tension: 0.35,
            fill: true
        };
    });

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: ALL_YEARS.map(y => `${y}學年`), datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function renderContextList() {
    const container = document.getElementById('contextList');
    container.innerHTML = '';
    const wordObj = dbData.words.find(w => w.word.toLowerCase() === currentContextWord.toLowerCase());

    if (!wordObj || !wordObj.contexts) return;

    wordObj.contexts.forEach((c) => {
        const card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3';
        const highlightedSentence = c.sentence.replace(new RegExp(`(${wordObj.word})`, 'gi'), '<span class="highlight-word">$1</span>');

        card.innerHTML = `
            <div class="flex justify-between border-b border-slate-800 pb-2 text-xs">
                <span class="font-bold text-indigo-400">${c.year} 學年度 ${c.school} (${c.exam_type}) 第 ${c.question_no} 題</span>
                <span class="text-emerald-400 font-bold">標準答案: (${c.answer})</span>
            </div>
            <p class="text-sm text-slate-200 leading-relaxed font-serif">${highlightedSentence}</p>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-2 bg-slate-950 border border-slate-800 rounded">(A) ${c.options.A}</div>
                <div class="p-2 bg-slate-950 border border-slate-800 rounded">(B) ${c.options.B}</div>
                <div class="p-2 bg-slate-950 border border-slate-800 rounded">(C) ${c.options.C}</div>
                <div class="p-2 bg-slate-950 border border-slate-800 rounded">(D) ${c.options.D}</div>
            </div>
        `;
        container.appendChild(card);
    });
}
