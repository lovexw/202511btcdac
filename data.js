fetch('investment_data.json')
    .then(response => response.json())
    .then(data => {
        renderData(data);
    })
    .catch(error => console.error('Error loading data:', error));

function renderData(data) {
    document.getElementById('total-investment').textContent = `$${data.total_investment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('total-btc').textContent = `${data.total_btc.toFixed(8)} BTC`;
    document.getElementById('final-value').textContent = `$${data.final_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('profit').textContent = `$${data.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('profit-rate').textContent = `${data.profit_rate >= 0 ? '+' : ''}${data.profit_rate.toFixed(2)}%`;
    
    const profitIcon = document.getElementById('profit-icon');
    if (data.profit >= 0) {
        profitIcon.textContent = '📈';
    } else {
        profitIcon.textContent = '📉';
    }

    document.getElementById('purchase-count').textContent = `${data.purchase_count} 次`;
    document.getElementById('avg-price').textContent = `$${(data.total_investment / data.total_btc).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('final-price').textContent = `$${data.final_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const avgPrice = data.total_investment / data.total_btc;
    const priceChange = ((data.final_price - avgPrice) / avgPrice * 100);
    document.getElementById('price-change').textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`;

    renderTransactionsTable(data);
    renderCumulativeChart(data);
    renderPriceChart(data);
    renderMonthlyChart(data);
}

function renderTransactionsTable(data) {
    const tbody = document.getElementById('transactions-tbody');
    let cumulativeInvestment = 0;
    let cumulativeBTC = 0;

    data.purchases.forEach((purchase, index) => {
        cumulativeInvestment += purchase.usd_invested;
        cumulativeBTC += purchase.btc_amount;
        
        const row = document.createElement('tr');
        const currentValue = cumulativeBTC * data.final_price;
        
        row.innerHTML = `
            <td>${purchase.date}</td>
            <td>$${purchase.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>$${purchase.usd_invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${purchase.btc_amount.toFixed(8)} BTC</td>
            <td>$${cumulativeInvestment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${cumulativeBTC.toFixed(8)} BTC</td>
            <td>$${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        `;
        tbody.appendChild(row);
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
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: '资产价值 (USD)',
                    data: valueData,
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
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
                        color: '#6b7280',
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        maxTicksLimit: 10
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
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
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
                        color: '#6b7280',
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        maxTicksLimit: 10
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
        const year = parts[0];
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
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: '#6366f1',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: '成本均价 (USD)',
                    data: avgPrices,
                    borderColor: '#ec4899',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    type: 'line',
                    yAxisID: 'y1',
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#ec4899'
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
                        color: '#6b7280',
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9ca3af'
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
                        color: '#9ca3af'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                }
            }
        }
    });
}
