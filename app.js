// PostMed English Trends Main Application Script
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
    if (window.VOCAB_DATABASE && window.VOCAB_DATABASE.words) {
        dbData = window.VOCAB_DATABASE;
    }
    try {
        const response = await fetch('vocab_database.json');
        if (response.ok) {
            const json = await response.json();
            if (json && json.words) {
                dbData = json;
            }
        }
    } catch (e) {
        console.log('Local fetch bypassed, using JS embedded database');
    }
}

function setupEventListeners() {
    document.getElementById('addWordBtn').addEventListener('click', handleAddWord);
    document.getElementById('wordInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAddWord();
    });

    document.querySelectorAll('.preset-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const word = e.currentTarget.getAttribute('data-word');
            if (word && !activeWords.includes(word)) {
                if (activeWords.length >= 5) activeWords.shift();
                activeWords.push(word);
                currentContextWord = word;
                renderUI();
            }
        });
    });

    document.getElementById('schoolFilter').addEventListener('change', (e) => {
        selectedSchoolFilter = e.target.value;
        updateChart();
        renderSchoolStats();
    });

    document.getElementById('contextWordSelect').addEventListener('change', (e) => {
        currentContextWord = e.target.value;
        renderContextList();
    });

    document.getElementById('cloudSyncBtn').addEventListener('click', () => {
        document.getElementById('cloudModal').classList.remove('hidden');
    });
    document.getElementById('closeCloudModal').addEventListener('click', () => {
        document.getElementById('cloudModal').classList.add('hidden');
    });

    document.getElementById('uploadModalBtn').addEventListener('click', () => {
        document.getElementById('uploadModal').classList.remove('hidden');
    });
    document.getElementById('closeUploadModal').addEventListener('click', () => {
        document.getElementById('uploadModal').classList.add('hidden');
    });

    document.getElementById('saveCloudSettings').addEventListener('click', () => {
        alert('Supabase 連線資訊已儲存！');
        document.getElementById('cloudModal').classList.add('hidden');
    });

    document.getElementById('startUploadBtn').addEventListener('click', () => {
        alert('檔案已模擬解析完成，單字頻率已成功更新！');
        document.getElementById('uploadModal').classList.add('hidden');
    });
}

function handleAddWord() {
    const input = document.getElementById('wordInput');
    const val = input.value.trim().toLowerCase();
    if (val && !activeWords.includes(val)) {
        if (activeWords.length >= 5) activeWords.shift();
        activeWords.push(val);
        currentContextWord = val;
        input.value = '';
        renderUI();
    }
}

function renderUI() {
    renderWordTags();
    updateChart();
    renderSchoolStats();
    updateContextSelectOptions();
    renderContextList();
}

function renderWordTags() {
    const container = document.getElementById('wordTagsContainer');
    container.innerHTML = '';

    activeWords.forEach((wordStr, idx) => {
        const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
        const tag = document.createElement('div');
        tag.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm border';
        tag.style.backgroundColor = color.bg;
        tag.style.borderColor = color.border;
        tag.style.color = '#ffffff';

        tag.innerHTML = `
            <span>${wordStr}</span>
            <button class="remove-tag hover:text-red-400 transition ml-1" data-word="${wordStr}">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        tag.querySelector('.remove-tag').addEventListener('click', (e) => {
            const targetWord = e.currentTarget.getAttribute('data-word');
            activeWords = activeWords.filter(w => w !== targetWord);
            if (activeWords.length > 0) {
                currentContextWord = activeWords[activeWords.length - 1];
            }
            renderUI();
        });

        container.appendChild(tag);
    });
}

function updateChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    
    const datasets = activeWords.map((wordStr, idx) => {
        const wordObj = dbData.words.find(w => w.word.toLowerCase() === wordStr.toLowerCase());
        const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
        
        const dataPoints = ALL_YEARS.map(year => {
            if (!wordObj || !wordObj.trends) return 0;
            return wordObj.trends[year] || 0;
        });

        return {
            label: wordObj ? `${wordObj.word} (${wordObj.meaning})` : wordStr,
            data: dataPoints,
            borderColor: color.border,
            backgroundColor: color.bg,
            borderWidth: 3,
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ALL_YEARS.map(y => `${y}學年`),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#cbd5e1', font: { size: 12 } }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', stepSize: 1 }
                }
            }
        }
    });
}

function renderSchoolStats() {
    const container = document.getElementById('schoolStatsContainer');
    container.innerHTML = '';

    const wordObj = dbData.words.find(w => w.word.toLowerCase() === currentContextWord.toLowerCase());
    if (!wordObj || !wordObj.schools) {
        container.innerHTML = `<p class="text-xs text-slate-500">查無「${currentContextWord}」的分佈統計數據</p>`;
        return;
    }

    const schoolsData = wordObj.schools;
    const total = Object.values(schoolsData).reduce((a, b) => a + b, 0);

    Object.entries(schoolsData).forEach(([schName, count]) => {
        const pct = Math.round((count / total) * 100);
        const row = document.createElement('div');
        row.className = 'space-y-1';
        row.innerHTML = `
            <div class="flex justify-between text-xs">
                <span class="text-slate-300">${schName}</span>
                <span class="text-indigo-400 font-semibold">${count} 次 (${pct}%)</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-indigo-500 h-2 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
        `;
        container.appendChild(row);
    });

    document.getElementById('activeWordCountDisplay').innerText = `${wordObj.word}: 歷年共 ${wordObj.total_count} 次`;
}

function updateContextSelectOptions() {
    const select = document.getElementById('contextWordSelect');
    select.innerHTML = '';

    activeWords.forEach(wordStr => {
        const wordObj = dbData.words.find(w => w.word.toLowerCase() === wordStr.toLowerCase());
        const opt = document.createElement('option');
        opt.value = wordStr;
        opt.innerText = wordObj ? `${wordObj.word} - ${wordObj.meaning}` : wordStr;
        if (wordStr === currentContextWord) opt.selected = true;
        select.appendChild(opt);
    });
}

function renderContextList() {
    const container = document.getElementById('contextList');
    container.innerHTML = '';

    const wordObj = dbData.words.find(w => w.word.toLowerCase() === currentContextWord.toLowerCase());

    if (!wordObj || !wordObj.contexts || wordObj.contexts.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-slate-500 text-sm">
                目前尚無「${currentContextWord}」的詳細題型上下文資料。
            </div>
        `;
        return;
    }

    const filteredContexts = wordObj.contexts.filter(c => {
        if (selectedSchoolFilter === 'ALL') return true;
        return c.school.includes(selectedSchoolFilter);
    });

    if (filteredContexts.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-slate-500 text-sm">
                在【${selectedSchoolFilter}】無「${currentContextWord}」的命題紀錄。
            </div>
        `;
        return;
    }

    filteredContexts.forEach((c) => {
        const card = document.createElement('div');
        card.className = 'bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-indigo-500/50 transition';
        
        const highlightedSentence = c.sentence.replace(
            new RegExp(`(${wordObj.word})`, 'gi'), 
            '<span class="highlight-word">$1</span>'
        );

        card.innerHTML = `
            <div class="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 text-xs gap-2">
                <span class="font-bold text-indigo-400 flex items-center gap-1.5">
                    <i class="fa-solid fa-graduation-cap"></i>
                    ${c.year} 學年度 ${c.school} (${c.exam_type}) 第 ${c.question_no} 題
                    <span class="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] ml-2">${c.section || '字彙題'}</span>
                </span>
                <span class="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-md">
                    標準答案: (${c.answer})
                </span>
            </div>
            
            <p class="text-sm text-slate-200 leading-relaxed font-serif tracking-wide pt-1">
                ${highlightedSentence}
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                <div class="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-slate-300">
                    <span class="font-bold text-slate-500 me-1">(A)</span> ${c.options.A || ''}
                </div>
                <div class="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-slate-300">
                    <span class="font-bold text-slate-500 me-1">(B)</span> ${c.options.B || ''}
                </div>
                <div class="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-slate-300">
                    <span class="font-bold text-slate-500 me-1">(C)</span> ${c.options.C || ''}
                </div>
                <div class="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-slate-300">
                    <span class="font-bold text-slate-500 me-1">(D)</span> ${c.options.D || ''}
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}
