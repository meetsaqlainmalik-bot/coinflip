// Trading State
const state = {
    initialBalance: 10000,
    currentBalance: 10000,
    riskPercent: 1,
    riskRewardRatio: 1,
    customWinRate: 50,
    useCustomWinRate: false,
    trades: [],
    equityCurve: [10000],
    isFlipping: false,
    autoFlipInterval: null,
    charts: {
        equityCurve: null,
        winLoss: null,
        drawdown: null,
        winRate: null
    }
};

// DOM Elements
const elements = {
    initialBalance: document.getElementById('initialBalance'),
    riskPercent: document.getElementById('riskPercent'),
    riskRewardRatio: document.getElementById('riskRewardRatio'),
    customRRWrapper: document.getElementById('customRRWrapper'),
    customRR: document.getElementById('customRR'),
    numTrades: document.getElementById('numTrades'),
    flipSpeed: document.getElementById('flipSpeed'),
    enableCustomWinRate: document.getElementById('enableCustomWinRate'),
    customWinRate: document.getElementById('customWinRate'),
    themeSwitch: document.getElementById('themeSwitch'),
    themeLabel: document.getElementById('themeLabel'),
    flipOnce: document.getElementById('flipOnce'),
    flipAuto: document.getElementById('flipAuto'),
    reset: document.getElementById('reset'),
    exportStats: document.getElementById('exportStats'),
    coin: document.getElementById('coin'),
    result: document.getElementById('result'),
    totalTrades: document.getElementById('totalTrades'),
    totalWins: document.getElementById('totalWins'),
    totalLosses: document.getElementById('totalLosses'),
    winRate: document.getElementById('winRate'),
    currentBalance: document.getElementById('currentBalance'),
    netPnL: document.getElementById('netPnL'),
    returnPercent: document.getElementById('returnPercent'),
    expectancy: document.getElementById('expectancy'),
    profitFactor: document.getElementById('profitFactor'),
    avgWin: document.getElementById('avgWin'),
    avgLoss: document.getElementById('avgLoss'),
    largestWin: document.getElementById('largestWin'),
    largestLoss: document.getElementById('largestLoss'),
    avgTradePnL: document.getElementById('avgTradePnL'),
    maxDrawdown: document.getElementById('maxDrawdown'),
    currentDrawdown: document.getElementById('currentDrawdown'),
    maxConsecWins: document.getElementById('maxConsecWins'),
    maxConsecLosses: document.getElementById('maxConsecLosses'),
    currentStreak: document.getElementById('currentStreak'),
    riskPerTrade: document.getElementById('riskPerTrade'),
    expectedWinRate: document.getElementById('expectedWinRate'),
    actualVsExpected: document.getElementById('actualVsExpected'),
    deviation: document.getElementById('deviation'),
    lawOfLargeNumbers: document.getElementById('lawOfLargeNumbers'),
    nextTradeProbability: document.getElementById('nextTradeProbability'),
    tradingMode: document.getElementById('tradingMode'),
    tradeHistory: document.getElementById('tradeHistory'),
    realityMessage: document.getElementById('realityMessage')
};

// Coin Flip Function
function flipCoin() {
    const winProbability = state.useCustomWinRate ? state.customWinRate / 100 : 0.5;
    return Math.random() < winProbability ? 'win' : 'loss';
}

// Calculate P&L for a trade
function calculateTradePnL(result, riskAmount) {
    if (result === 'win') {
        return riskAmount * state.riskRewardRatio;
    } else {
        return -riskAmount;
    }
}

// Get risk amount based on current balance
function getRiskAmount() {
    return state.currentBalance * (state.riskPercent / 100);
}

// Execute a single trade
function executeTrade() {
    const result = flipCoin();
    const riskAmount = getRiskAmount();
    const pnl = calculateTradePnL(result, riskAmount);
    
    state.currentBalance += pnl;
    
    const trade = {
        number: state.trades.length + 1,
        result: result,
        pnl: pnl,
        balance: state.currentBalance,
        riskAmount: riskAmount,
        returnPercent: ((state.currentBalance - state.initialBalance) / state.initialBalance) * 100
    };
    
    state.trades.push(trade);
    state.equityCurve.push(state.currentBalance);
    
    return trade;
}

// Update statistics
function updateStatistics() {
    const totalTrades = state.trades.length;
    const wins = state.trades.filter(t => t.result === 'win').length;
    const losses = totalTrades - wins;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const netPnL = state.currentBalance - state.initialBalance;
    const returnPercent = ((state.currentBalance - state.initialBalance) / state.initialBalance) * 100;
    
    // Calculate wins and losses arrays
    const winTrades = state.trades.filter(t => t.result === 'win').map(t => t.pnl);
    const lossTrades = state.trades.filter(t => t.result === 'loss').map(t => Math.abs(t.pnl));
    
    const avgWin = winTrades.length > 0 ? winTrades.reduce((a, b) => a + b, 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? lossTrades.reduce((a, b) => a + b, 0) / lossTrades.length : 0;
    const largestWin = winTrades.length > 0 ? Math.max(...winTrades) : 0;
    const largestLoss = lossTrades.length > 0 ? Math.max(...lossTrades) : 0;
    const avgTradePnL = totalTrades > 0 ? state.trades.reduce((sum, t) => sum + t.pnl, 0) / totalTrades : 0;
    
    // Profit Factor = Gross Profit / Gross Loss
    const grossProfit = winTrades.reduce((a, b) => a + b, 0);
    const grossLoss = lossTrades.reduce((a, b) => a + b, 0);
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    
    // Expectancy = (Win% * Avg Win) - (Loss% * Avg Loss)
    const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss);
    
    // Calculate streaks
    let maxConsecWins = 0;
    let maxConsecLosses = 0;
    let currentConsecWins = 0;
    let currentConsecLosses = 0;
    let currentStreak = 0; // positive for wins, negative for losses
    
    state.trades.forEach(trade => {
        if (trade.result === 'win') {
            currentConsecWins++;
            currentConsecLosses = 0;
            maxConsecWins = Math.max(maxConsecWins, currentConsecWins);
        } else {
            currentConsecLosses++;
            currentConsecWins = 0;
            maxConsecLosses = Math.max(maxConsecLosses, currentConsecLosses);
        }
    });
    
    if (state.trades.length > 0) {
        const lastTrade = state.trades[state.trades.length - 1];
        if (lastTrade.result === 'win') {
            currentStreak = currentConsecWins;
        } else {
            currentStreak = -currentConsecLosses;
        }
    }
    
    // Calculate drawdown
    let peak = state.initialBalance;
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    
    state.equityCurve.forEach(balance => {
        peak = Math.max(peak, balance);
        const drawdown = ((peak - balance) / peak) * 100;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
    });
    
    if (state.equityCurve.length > 0) {
        const peakBalance = Math.max(...state.equityCurve);
        currentDrawdown = ((peakBalance - state.currentBalance) / peakBalance) * 100;
    }
    
    // Update DOM
    elements.totalTrades.textContent = totalTrades;
    elements.totalWins.textContent = wins;
    elements.totalLosses.textContent = losses;
    elements.winRate.textContent = winRate.toFixed(2) + '%';
    elements.currentBalance.textContent = formatCurrency(state.currentBalance);
    elements.netPnL.textContent = formatCurrency(netPnL);
    elements.netPnL.className = 'stat-value ' + (netPnL >= 0 ? 'win' : 'loss');
    elements.returnPercent.textContent = returnPercent.toFixed(2) + '%';
    elements.returnPercent.className = 'stat-value ' + (returnPercent >= 0 ? 'win' : 'loss');
    elements.expectancy.textContent = formatCurrency(expectancy);
    elements.expectancy.className = 'stat-value ' + (expectancy >= 0 ? 'win' : 'loss');
    
    elements.profitFactor.textContent = profitFactor === Infinity ? '∞' : profitFactor.toFixed(2);
    elements.avgWin.textContent = formatCurrency(avgWin);
    elements.avgLoss.textContent = formatCurrency(avgLoss);
    elements.largestWin.textContent = formatCurrency(largestWin);
    elements.largestLoss.textContent = formatCurrency(largestLoss);
    elements.avgTradePnL.textContent = formatCurrency(avgTradePnL);
    elements.avgTradePnL.className = 'metric-value ' + (avgTradePnL >= 0 ? 'win' : 'loss');
    
    elements.maxDrawdown.textContent = maxDrawdown.toFixed(2) + '%';
    elements.currentDrawdown.textContent = currentDrawdown.toFixed(2) + '%';
    elements.maxConsecWins.textContent = maxConsecWins;
    elements.maxConsecLosses.textContent = maxConsecLosses;
    
    const streakText = currentStreak > 0 ? `${currentStreak} Wins` : currentStreak < 0 ? `${Math.abs(currentStreak)} Losses` : '0';
    elements.currentStreak.textContent = streakText;
    elements.currentStreak.className = 'metric-value ' + (currentStreak > 0 ? 'win' : currentStreak < 0 ? 'loss' : '');
    
    elements.riskPerTrade.textContent = formatCurrency(getRiskAmount());
    
    // Probability reality check
    const expectedRate = state.useCustomWinRate ? state.customWinRate : 50;
    const deviation = Math.abs(winRate - expectedRate);
    elements.expectedWinRate.textContent = expectedRate.toFixed(1) + '%';
    elements.actualVsExpected.textContent = winRate.toFixed(2) + '% vs ' + expectedRate.toFixed(1) + '%';
    elements.actualVsExpected.className = 'metric-value ' + (Math.abs(winRate - expectedRate) < 2 ? 'win' : deviation < 5 ? '' : 'loss');
    elements.deviation.textContent = deviation.toFixed(2) + '%';
    elements.deviation.className = 'metric-value ' + (deviation < 2 ? 'win' : deviation < 5 ? '' : 'loss');
    
    // Law of Large Numbers message
    if (totalTrades < 10) {
        elements.lawOfLargeNumbers.textContent = 'Too few trades';
    } else if (totalTrades < 100) {
        elements.lawOfLargeNumbers.textContent = 'Converging...';
    } else if (totalTrades < 1000) {
        elements.lawOfLargeNumbers.textContent = 'Getting closer to expected';
    } else {
        elements.lawOfLargeNumbers.textContent = 'Near expected (Law of Large Numbers)';
    }
    
    // Next trade probability
    elements.nextTradeProbability.textContent = expectedRate.toFixed(1) + '%';
    
    // Trading mode
    elements.tradingMode.textContent = state.useCustomWinRate ? `Custom (${state.customWinRate}%)` : 'Pure 50/50';
    elements.tradingMode.className = 'metric-value ' + (state.useCustomWinRate ? '' : 'win');
}

// Add trade to history table
function addTradeToTable(trade) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${trade.number}</td>
        <td><span class="result-badge ${trade.result}">${trade.result === 'win' ? '✓ WIN' : '✗ LOSS'}</span></td>
        <td class="${trade.pnl >= 0 ? 'win' : 'loss'}">${trade.pnl >= 0 ? '+' : ''}${formatCurrency(trade.pnl)}</td>
        <td>${formatCurrency(trade.balance)}</td>
        <td class="${trade.returnPercent >= 0 ? 'win' : 'loss'}">${trade.returnPercent >= 0 ? '+' : ''}${trade.returnPercent.toFixed(2)}%</td>
    `;
    
    elements.tradeHistory.insertBefore(row, elements.tradeHistory.firstChild);
}

// Format currency
function formatCurrency(amount) {
    const absAmount = Math.abs(amount);
    let formatted;
    
    if (absAmount >= 1e12) {
        formatted = (absAmount / 1e12).toFixed(2) + 'T';
    } else if (absAmount >= 1e9) {
        formatted = (absAmount / 1e9).toFixed(2) + 'B';
    } else if (absAmount >= 1e6) {
        formatted = (absAmount / 1e6).toFixed(2) + 'M';
    } else if (absAmount >= 1e4) {
        formatted = absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
        formatted = absAmount.toFixed(2);
    }
    
    return (amount < 0 ? '-$' : '$') + formatted;
}

// Update coin animation
function animateCoin(result) {
    elements.coin.classList.add('flipping');
    
    setTimeout(() => {
        elements.coin.classList.remove('flipping');
        elements.result.textContent = result === 'win' ? '✓ WIN' : '✗ LOSS';
        elements.result.className = 'result-text ' + result;
    }, 600);
}

// Update reality check message
function updateRealityMessage() {
    const totalTrades = state.trades.length;
    const wins = state.trades.filter(t => t.result === 'win').length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const netPnL = state.currentBalance - state.initialBalance;
    const expectedRate = state.useCustomWinRate ? state.customWinRate : 50;
    
    let message = '';
    
    if (totalTrades === 0) {
        message = `<p>Start flipping to see how randomness plays out. ${state.useCustomWinRate ? `Custom win rate set to ${state.customWinRate}%—let's see if reality matches your edge.` : 'No strategy, no edge—just pure 50/50 probability.'}</p>`;
    } else if (totalTrades < 10) {
        message = '<p>🎲 <strong>Small sample size!</strong> With few trades, anything can happen. This is why traders need hundreds of trades to validate a strategy.</p>';
    } else if (winRate > expectedRate + 5 && totalTrades >= 50) {
        message = `<p>🍀 <strong>Above expected!</strong> Your win rate is ${winRate.toFixed(1)}% vs expected ${expectedRate.toFixed(1)}% with ${formatCurrency(netPnL)} ${netPnL >= 0 ? 'profit' : 'loss'}. But remember: past results don't predict future outcomes.</p>`;
    } else if (winRate < expectedRate - 5 && totalTrades >= 50) {
        message = `<p>📉 <strong>Below expected!</strong> Your win rate is ${winRate.toFixed(1)}% vs expected ${expectedRate.toFixed(1)}%. Randomness can create unlucky streaks even with an edge.</p>`;
    } else if (totalTrades >= 100 && Math.abs(winRate - expectedRate) < 3) {
        message = `<p>🎯 <strong>Law of Large Numbers in action!</strong> With ${totalTrades} trades, your win rate is converging to ${expectedRate.toFixed(1)}%. This proves the power of probability theory.</p>`;
    } else if (totalTrades >= 500) {
        message = `<p>📊 <strong>Massive sample size!</strong> After ${totalTrades} trades, you're seeing the true nature of randomness. The win rate is ${winRate.toFixed(2)}%—${Math.abs(winRate - expectedRate) < 2 ? 'very close to' : 'still deviating from'} the expected ${expectedRate.toFixed(1)}%.</p>`;
    } else {
        message = `<p>🪙 <strong>${totalTrades} trades completed.</strong> Win rate: ${winRate.toFixed(1)}% vs expected ${expectedRate.toFixed(1)}%. ${state.useCustomWinRate ? 'The market doesn\'t guarantee your edge plays out—only probability does.' : 'The coin doesn\'t care about your risk management or RR ratio—it\'s always 50/50.'}</p>`;
    }
    
    elements.realityMessage.innerHTML = message;
}

// Initialize charts
function initCharts() {
    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#e2e8f0'
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#a0aec0' },
                grid: { color: 'rgba(45, 55, 72, 0.5)' }
            },
            y: {
                ticks: { color: '#a0aec0' },
                grid: { color: 'rgba(45, 55, 72, 0.5)' }
            }
        }
    };
    
    // Equity Curve
    const equityCtx = document.getElementById('equityCurve').getContext('2d');
    state.charts.equityCurve = new Chart(equityCtx, {
        type: 'line',
        data: {
            labels: [0],
            datasets: [{
                label: 'Account Balance',
                data: [state.initialBalance],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: false
                }
            }
        }
    });
    
    // Win/Loss Distribution
    const winLossCtx = document.getElementById('winLossChart').getContext('2d');
    state.charts.winLoss = new Chart(winLossCtx, {
        type: 'doughnut',
        data: {
            labels: ['Wins', 'Losses'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e2e8f0',
                        padding: 20
                    }
                }
            }
        }
    });
    
    // Drawdown Chart
    const drawdownCtx = document.getElementById('drawdownChart').getContext('2d');
    state.charts.drawdown = new Chart(drawdownCtx, {
        type: 'line',
        data: {
            labels: [0],
            datasets: [{
                label: 'Drawdown %',
                data: [0],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    beginAtZero: true
                }
            }
        }
    });
    
    // Win Rate Convergence Chart
    const winRateCtx = document.getElementById('winRateChart').getContext('2d');
    state.charts.winRate = new Chart(winRateCtx, {
        type: 'line',
        data: {
            labels: [0],
            datasets: [
                {
                    label: 'Actual Win Rate',
                    data: [50],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'Expected (50%)',
                    data: [50],
                    borderColor: '#f59e0b',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Update charts
function updateCharts() {
    const totalTrades = state.trades.length;
    
    // Update Equity Curve
    state.charts.equityCurve.data.labels = Array.from({ length: totalTrades + 1 }, (_, i) => i);
    state.charts.equityCurve.data.datasets[0].data = state.equityCurve;
    state.charts.equityCurve.update('none');
    
    // Update Win/Loss
    const wins = state.trades.filter(t => t.result === 'win').length;
    const losses = totalTrades - wins;
    state.charts.winLoss.data.datasets[0].data = [wins, losses];
    state.charts.winLoss.update('none');
    
    // Update Drawdown
    let peak = state.initialBalance;
    const drawdowns = [0];
    state.equityCurve.slice(1).forEach((balance, i) => {
        peak = Math.max(peak, balance);
        const drawdown = ((peak - balance) / peak) * 100;
        drawdowns.push(drawdown);
    });
    state.charts.drawdown.data.labels = Array.from({ length: totalTrades + 1 }, (_, i) => i);
    state.charts.drawdown.data.datasets[0].data = drawdowns;
    state.charts.drawdown.update('none');
    
    // Update Win Rate Convergence
    const expectedRate = state.useCustomWinRate ? state.customWinRate : 50;
    const winRateData = [];
    let cumulativeWins = 0;
    state.trades.forEach((trade, i) => {
        if (trade.result === 'win') cumulativeWins++;
        winRateData.push((cumulativeWins / (i + 1)) * 100);
    });
    state.charts.winRate.data.labels = Array.from({ length: totalTrades }, (_, i) => i + 1);
    state.charts.winRate.data.datasets[0].data = winRateData;
    state.charts.winRate.data.datasets[1].label = `Expected (${expectedRate}%)`;
    state.charts.winRate.data.datasets[1].data = Array(totalTrades).fill(expectedRate);
    state.charts.winRate.update('none');
}

// Single flip
async function flipOnce() {
    if (state.isFlipping) return;
    
    state.isFlipping = true;
    disableButtons();
    
    const result = flipCoin();
    const trade = executeTrade();
    
    animateCoin(result);
    
    setTimeout(() => {
        addTradeToTable(trade);
        updateStatistics();
        updateCharts();
        updateRealityMessage();
        
        state.isFlipping = false;
        enableButtons();
    }, 700);
}

// Auto flip
function startAutoFlip() {
    if (state.isFlipping) return;
    
    state.isFlipping = true;
    const numTrades = parseInt(elements.numTrades.value);
    const speed = parseInt(elements.flipSpeed.value);
    let count = 0;
    
    disableButtons();
    elements.flipAuto.textContent = '⏸ Running...';
    elements.flipAuto.disabled = true;
    
    state.autoFlipInterval = setInterval(() => {
        if (count >= numTrades) {
            clearInterval(state.autoFlipInterval);
            state.isFlipping = false;
            elements.flipAuto.textContent = '🚀 Auto Flip';
            enableButtons();
            return;
        }
        
        const result = flipCoin();
        const trade = executeTrade();
        
        count++;
        addTradeToTable(trade);
        updateStatistics();
        
        // Update result display
        elements.result.textContent = result === 'win' ? '✓ WIN' : '✗ LOSS';
        elements.result.className = 'result-text ' + result;
        
        // Update charts every 10 trades for performance
        if (count % 10 === 0 || count === numTrades) {
            updateCharts();
            updateRealityMessage();
        }
        
        // Update progress
        elements.flipAuto.textContent = `⏸ ${count}/${numTrades}`;
        
    }, speed);
}

// Stop auto flip
function stopAutoFlip() {
    if (state.autoFlipInterval) {
        clearInterval(state.autoFlipInterval);
        state.autoFlipInterval = null;
        state.isFlipping = false;
        elements.flipAuto.textContent = '🚀 Auto Flip';
        enableButtons();
        updateCharts();
        updateRealityMessage();
    }
}

// Reset
function reset() {
    stopAutoFlip();
    
    state.initialBalance = parseFloat(elements.initialBalance.value) || 10000;
    state.currentBalance = state.initialBalance;
    state.trades = [];
    state.equityCurve = [state.initialBalance];
    
    elements.result.textContent = 'Ready to flip';
    elements.result.className = 'result-text';
    elements.tradeHistory.innerHTML = '';
    
    updateStatistics();
    updateCharts();
    updateRealityMessage();
    enableButtons();
    
    elements.flipAuto.textContent = '🚀 Auto Flip';
}

// Disable buttons during operations
function disableButtons() {
    elements.flipOnce.disabled = true;
    elements.reset.disabled = true;
}

// Enable buttons
function enableButtons() {
    elements.flipOnce.disabled = false;
    elements.reset.disabled = false;
}

// Export statistics
function exportStats() {
    if (state.trades.length === 0) {
        alert('No trades to export!');
        return;
    }
    
    const wins = state.trades.filter(t => t.result === 'win').length;
    const losses = state.trades.length - wins;
    const winRate = (wins / state.trades.length) * 100;
    const netPnL = state.currentBalance - state.initialBalance;
    
    let csv = 'Trade #,Result,P&L,Balance,Risk Amount,Return %\n';
    state.trades.forEach(trade => {
        csv += `${trade.number},${trade.result},${trade.pnl.toFixed(2)},${trade.balance.toFixed(2)},${trade.riskAmount.toFixed(2)},${trade.returnPercent.toFixed(2)}\n`;
    });
    
    csv += '\n\nSummary\n';
    csv += `Initial Balance,${state.initialBalance.toFixed(2)}\n`;
    csv += `Final Balance,${state.currentBalance.toFixed(2)}\n`;
    csv += `Net P&L,${netPnL.toFixed(2)}\n`;
    csv += `Total Trades,${state.trades.length}\n`;
    csv += `Wins,${wins}\n`;
    csv += `Losses,${losses}\n`;
    csv += `Win Rate,${winRate.toFixed(2)}%\n`;
    csv += `Expected Win Rate,${state.useCustomWinRate ? state.customWinRate : 50}%\n`;
    csv += `Trading Mode,${state.useCustomWinRate ? 'Custom (' + state.customWinRate + '%)' : 'Pure 50/50'}\n`;
    csv += `Risk Reward Ratio,1:${state.riskRewardRatio}\n`;
    csv += `Risk Per Trade,${state.riskPercent}%\n`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coinflip_trades_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Update parameters when inputs change
function updateParameters() {
    state.initialBalance = parseFloat(elements.initialBalance.value) || 10000;
    state.riskPercent = parseFloat(elements.riskPercent.value) || 1;
    
    if (elements.riskRewardRatio.value === 'custom') {
        state.riskRewardRatio = parseFloat(elements.customRR.value) || 2;
    } else {
        state.riskRewardRatio = parseFloat(elements.riskRewardRatio.value) || 1;
    }
}

// Event Listeners
elements.flipOnce.addEventListener('click', flipOnce);
elements.flipAuto.addEventListener('click', () => {
    if (state.autoFlipInterval) {
        stopAutoFlip();
    } else {
        updateParameters();
        startAutoFlip();
    }
});
elements.reset.addEventListener('click', reset);
elements.exportStats.addEventListener('click', exportStats);

elements.initialBalance.addEventListener('change', () => {
    if (state.trades.length === 0) {
        state.initialBalance = parseFloat(elements.initialBalance.value) || 10000;
        state.currentBalance = state.initialBalance;
        state.equityCurve = [state.initialBalance];
        updateStatistics();
        updateCharts();
    }
});

elements.riskPercent.addEventListener('change', updateParameters);
elements.riskRewardRatio.addEventListener('change', () => {
    elements.customRRWrapper.style.display = elements.riskRewardRatio.value === 'custom' ? 'flex' : 'none';
    updateParameters();
});
elements.customRR.addEventListener('change', () => {
    if (elements.riskRewardRatio.value === 'custom') {
        updateParameters();
    }
});

// Theme Toggle
elements.themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('light-mode', elements.themeSwitch.checked);
    elements.themeLabel.textContent = elements.themeSwitch.checked ? '☀️ Light' : '🌙 Dark';
    localStorage.setItem('theme', elements.themeSwitch.checked ? 'light' : 'dark');
});

// Custom Win Rate Toggle
elements.enableCustomWinRate.addEventListener('change', () => {
    state.useCustomWinRate = elements.enableCustomWinRate.checked;
    elements.customWinRate.disabled = !state.useCustomWinRate;
    updateStatistics();
    updateRealityMessage();
});

elements.customWinRate.addEventListener('change', () => {
    state.customWinRate = parseFloat(elements.customWinRate.value) || 50;
    state.customWinRate = Math.max(0, Math.min(100, state.customWinRate));
    elements.customWinRate.value = state.customWinRate;
    if (state.useCustomWinRate) {
        updateStatistics();
        updateRealityMessage();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        elements.themeSwitch.checked = true;
        elements.themeLabel.textContent = '☀️ Light';
    }
    
    initCharts();
    updateStatistics();
    updateRealityMessage();
});

// Handle window resize for charts
window.addEventListener('resize', () => {
    Object.values(state.charts).forEach(chart => {
        if (chart) chart.resize();
    });
});
