document.addEventListener('DOMContentLoaded', async () => {
    // Only fetch dashboard data if authenticated and DOM loaded
    const user = getUser();
    if (user) {
        if (user.role === 'employee') {
            document.querySelector('.page-title').textContent = 'Employee Dashboard';
            document.querySelector('.text-muted').textContent = 'Welcome back!';
        }
        await loadDashboardData();
    }
});

async function loadDashboardData() {
    try {
        const data = await api('/api/reports');
        
        // Update Stats
        document.getElementById('stat-emp-count').textContent = data.total_employees;
        document.getElementById('stat-total-cost').textContent = formatCurrency(data.total_net);
        document.getElementById('stat-processed').textContent = data.processed_count;
        document.getElementById('stat-paid').textContent = data.paid_count;

        // Render Recent Payments
        renderRecentPayments(data.recent_payments);

        // Render Charts
        renderTrendChart(data.monthly_trend);
        renderDeptChart(data.dept_distribution);

    } catch (error) {
        showToast('Error loading dashboard data', 'error');
        console.error(error);
    }
}

function renderRecentPayments(payments) {
    const tbody = document.getElementById('recent-payments-table');
    tbody.innerHTML = '';
    
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No recent payments</td></tr>';
        return;
    }

    payments.forEach(payment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-semibold">${payment.employee_name}</td>
            <td>${payment.month} ${payment.year}</td>
            <td class="font-semibold">${formatCurrency(payment.net_salary)}</td>
            <td><span class="badge badge-${payment.status}">${payment.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTrendChart(trendData) {
    const ctx = document.getElementById('payrollTrendChart').getContext('2d');
    
    const labels = trendData.map(d => d.month_year);
    const netData = trendData.map(d => parseFloat(d.total_net));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Net Payroll Cost',
                data: netData,
                backgroundColor: 'rgba(37, 99, 235, 0.9)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [2, 4] } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderDeptChart(deptData) {
    const ctx = document.getElementById('deptDistributionChart').getContext('2d');
    
    const labels = deptData.map(d => `${d.department} (${d.count})`);
    const data = deptData.map(d => d.count);
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}
