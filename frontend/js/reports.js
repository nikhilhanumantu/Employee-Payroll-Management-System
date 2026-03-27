document.addEventListener('DOMContentLoaded', async () => {
    if(getUser()?.role !== 'admin') return;
    
    await loadReportData();
    document.getElementById('exportCsvBtn').addEventListener('click', downloadCSV);
});

async function loadReportData() {
    try {
        const data = await api('/api/reports');
        
        document.getElementById('r-gross').textContent = formatCurrency(data.total_gross);
        document.getElementById('r-ded>').textContent = formatCurrency(data.total_deductions);
        document.getElementById('r-net').textContent = formatCurrency(data.total_net);

        renderMultiChart(data.monthly_trend);
    } catch (error) {
        showToast('Failed to load reports', 'error');
    }
}

function renderMultiChart(trendData) {
    const ctx = document.getElementById('multiTrendChart').getContext('2d');
    
    const labels = trendData.map(d => d.month_year);
    const grossData = trendData.map(d => parseFloat(d.total_gross));
    const dedData = trendData.map(d => parseFloat(d.total_deductions));
    const netData = trendData.map(d => parseFloat(d.total_net));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Gross',
                    data: grossData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2
                },
                {
                    label: 'Deductions',
                    data: dedData,
                    borderColor: '#ef4444',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2
                },
                {
                    label: 'Net',
                    data: netData,
                    borderColor: '#10b981',
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [2, 4] } }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Download overall payroll records as CSV
async function downloadCSV() {
    try {
        // Fetch all payrolls to export
        const data = await api('/api/payroll');
        
        let csv = 'ID,Employee,Month,Year,Days Worked,Working Days,Gross,Deductions,Net Salary,Status\n';
        
        data.forEach(p => {
            csv += `${p.id},"${p.employee_name}",${p.month},${p.year},${p.present},${p.working_days},${parseFloat(p.gross)},${parseFloat(p.deductions)},${parseFloat(p.net_salary)},${p.status}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'payroll_report.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast('Exported successfully');
    } catch (error) {
        showToast('Error exporting CSV', 'error');
    }
}
