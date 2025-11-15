let currentData = null;
let currentSort = 'date';
let sortDirection = true;
let tableData = [];

fetch('investment_data.json')
    .then(response => response.json())
    .then(data => {
        currentData = data;
        renderData(data);
    })
    .catch(error => console.error('Error loading data:', error));

function renderData(data) {
    const avgPrice = data.total_investment / data.total_btc;
    
    document.getElementById('total-investment').textContent = `$${data.total_investment.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    document.getElementById('total-btc').textContent = `${data.total_btc.toFixed(4)} BTC`;
    document.getElementById('final-value').textContent = `$${data.final_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    
    const profitText = data.profit >= 0 ? `+$${Math.abs(data.profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${Math.abs(data.profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    document.getElementById('profit').textContent = profitText;
    
    const profitRateText = data.profit_rate >= 0 ? `+${data.profit_rate.toFixed(2)}%` : `${data.profit_rate.toFixed(2)}%`;
    document.getElementById('profit-rate').textContent = profitRateText;
    
    const profitIcon = document.getElementById('profit-icon');
    if (data.profit >= 0) {
        profitIcon.textContent = '📈';
    } else {
        profitIcon.textContent = '📉';
    }

    document.getElementById('purchase-count').textContent = `${data.purchase_count} 次`;
    document.getElementById('days-count').textContent = `${data.purchase_count} 天`;
    document.getElementById('avg-price').textContent = `$${avgPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    document.getElementById('final-price').textContent = `$${data.final_price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    
    const priceChange = ((data.final_price - avgPrice) / avgPrice * 100);
    document.getElementById('price-change').textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`;

    const prices = data.purchases.map(p => p.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const volatility = ((maxPrice - minPrice) / minPrice * 100);
    
    document.getElementById('max-price').textContent = `$${maxPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    document.getElementById('min-price').textContent = `$${minPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    document.getElementById('price-volatility').textContent = `${volatility.toFixed(2)}%`;
    document.getElementById('detail-profit').textContent = profitText;
    document.getElementById('detail-profit-rate').textContent = profitRateText;

    prepareTableData(data);
    renderTransactionsTable();
    renderCumulativeChart(data);
    renderPriceChart(data);
    renderMonthlyChart(data);
}

function prepareTableData(data) {
    tableData = [];
    let cumulativeInvestment = 0;
    let cumulativeBTC = 0;

    data.purchases.forEach((purchase, index) => {
        cumulativeInvestment += purchase.usd_invested;
        cumulativeBTC += purchase.btc_amount;
        const currentValue = cumulativeBTC * data.final_price;
        
        tableData.push({
            index: index + 1,
            date: purchase.date,
            price: purchase.price,
            invested: purchase.usd_invested,
            btc: purchase.btc_amount,
            cumInvested: cumulativeInvestment,
            cumBtc: cumulativeBTC,
            value: currentValue,
            finalPrice: data.final_price
        });
    });
}

function sortTable(sortBy) {
    if (currentSort === sortBy) {
        sortDirection = !sortDirection;
    } else {
        currentSort = sortBy;
        sortDirection = true;
    }

    const multiplier = sortDirection ? 1 : -1;

    tableData.sort((a, b) => {
        let aVal, bVal;
        
        if (sortBy === 'date') {
            aVal = new Date(a.date.replace(/\//g, '-'));
            bVal = new Date(b.date.replace(/\//g, '-'));
        } else if (sortBy === 'price' || sortBy === 'invested' || sortBy === 'btc' || sortBy === 'cumInvested' || sortBy === 'cumBtc' || sortBy === 'value') {
            aVal = a[sortBy];
            bVal = b[sortBy];
        }
        
        if (aVal < bVal) return -multiplier;
        if (aVal > bVal) return multiplier;
        return 0;
    });

    renderTransactionsTable();
    updateSortButtons(sortBy);
}

function updateSortButtons(sortBy) {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-sort="${sortBy}"]`)?.classList.add('active');
}

function renderTransactionsTable() {
    const tbody = document.getElementById('transactions-tbody');
    tbody.innerHTML = '';

    tableData.forEach((row) => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td class="table-row-number">${row.index}</td>
            <td>${row.date}</td>
            <td>$${row.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
            <td>$${row.invested.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td>${row.btc.toFixed(8)} BTC</td>
            <td>$${row.cumInvested.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
            <td>${row.cumBtc.toFixed(8)} BTC</td>
            <td>$${row.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCumulativeChart(data) {
    let cumulativeInvestment = 0;
    let cumulativeBTC = 0;
    const labels = [];
    const investmentData = [];
    const valueData = [];

    data.purchases.forEach(purchase => {
        cumulativeInvestment += purchase.usd_invested;
        cumulativeBTC += purchase.btc_amount;
        labels.push(purchase.date);
        investmentData.push(cumulativeInvestment);
        valueData.push(cumulativeBTC * data.final_price);
    });

    const ctx = document.getElementById('cumulativeChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '累计投入 (USD)',
                    data: investmentData,
                    borderColor: '#F7931A',
                    backgroundColor: 'rgba(247, 147, 26, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#F7931A',
                    pointHoverRadius: 6
                },
                {
                    label: '资产价值 (USD)',
                    data: valueData,
                    borderColor: '#FFA500',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#FFA500',
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#9CA3AF',
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(247, 147, 26, 0.1)'
                    },
                    ticks: {
                        color: '#9CA3AF',
                        font: { weight: 'bold' }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9CA3AF',
                        maxTicksLimit: 10,
                        font: { weight: 'bold' }
                    }
                }
            }
        }
    });
}

function renderPriceChart(data) {
    const labels = data.purchases.map(p => p.date);
    const prices = data.purchases.map(p => p.price);

    const ctx = document.getElementById('priceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '比特币价格 (USD)',
                    data: prices,
                    borderColor: '#F7931A',
                    backgroundColor: 'rgba(247, 147, 26, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#F7931A',
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#9CA3AF',
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(247, 147, 26, 0.1)'
                    },
                    ticks: {
                        color: '#9CA3AF',
                        font: { weight: 'bold' }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9CA3AF',
                        maxTicksLimit: 10,
                        font: { weight: 'bold' }
                    }
                }
            }
        }
    });
}

function renderMonthlyChart(data) {
    const monthlyData = {};

    data.purchases.forEach(purchase => {
        const month = purchase.date.substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = {
                count: 0,
                totalInvested: 0,
                totalBTC: 0
            };
        }
        monthlyData[month].count += 1;
        monthlyData[month].totalInvested += purchase.usd_invested;
        monthlyData[month].totalBTC += purchase.btc_amount;
    });

    const months = Object.keys(monthlyData).sort();
    const counts = months.map(m => monthlyData[m].count);
    const avgPrices = months.map(m => monthlyData[m].totalInvested / monthlyData[m].totalBTC);
    const monthLabels = months.map(m => {
        const parts = m.split('/');
        const month = parseInt(parts[1]);
        return `${month}月`;
    });

    const ctx = document.getElementById('monthlyChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: '购买次数',
                    data: counts,
                    backgroundColor: 'rgba(247, 147, 26, 0.7)',
                    borderColor: '#F7931A',
                    borderWidth: 2,
                    yAxisID: 'y',
                    borderRadius: 8
                },
                {
                    label: '成本均价 (USD)',
                    data: avgPrices,
                    borderColor: '#FFA500',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    type: 'line',
                    yAxisID: 'y1',
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#FFA500',
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#9CA3AF',
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 13, weight: 'bold' }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(247, 147, 26, 0.1)'
                    },
                    ticks: {
                        color: '#9CA3AF',
                        font: { weight: 'bold' }
                    },
                    title: {
                        display: true,
                        text: '购买次数',
                        color: '#F7931A',
                        font: { weight: 'bold', size: 12 }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: '#9CA3AF',
                        font: { weight: 'bold' }
                    },
                    title: {
                        display: true,
                        text: '成本均价 (USD)',
                        color: '#FFA500',
                        font: { weight: 'bold', size: 12 }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9CA3AF',
                        font: { weight: 'bold' }
                    }
                }
            }
        }
    });
}
