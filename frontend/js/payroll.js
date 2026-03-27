const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

document.addEventListener('DOMContentLoaded', () => {
    // Current month/year default selection
    const date = new Date();
    document.getElementById('filterMonth').value = months[date.getMonth()];
    
    // Setup modal options
    const procMonthSelect = document.getElementById('procMonth');
    months.forEach(m => {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = m;
        procMonthSelect.appendChild(option);
    });
    procMonthSelect.value = months[date.getMonth()];
    document.getElementById('procYear').value = date.getFullYear();

    loadEmployeesForDropdown();
    loadPayroll();

    document.getElementById('processForm').addEventListener('submit', handleProcessSubmit);
});

async function loadEmployeesForDropdown() {
    try {
        const allEmployees = await api('/api/employees');
        const select = document.getElementById('procEmployee');
        select.innerHTML = '<option value="" disabled selected>Select Employee...</option>';
        allEmployees.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.id;
            opt.textContent = `${emp.name} (${emp.id})`;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error("Could not load employees dropdown");
    }
}

async function loadPayroll() {
    const month = document.getElementById('filterMonth').value;
    const year = document.getElementById('filterYear').value;

    try {
        const url = `/api/payroll?month=${month}&year=${year}`;
        const data = await api(url);
        renderPayroll(data);
    } catch (error) {
        showToast('Failed to load payroll', 'error');
    }
}

function renderPayroll(records) {
    const tbody = document.getElementById('payroll-table');
    tbody.innerHTML = '';

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No payroll records found</td></tr>';
        return;
    }

    const { role } = getUser() || {};

    records.forEach(rec => {
        const tr = document.createElement('tr');
        
        let actionBtn = '';
        if (role === 'admin') {
            actionBtn = `<td style="text-align:center">`;
            if (rec.status !== 'paid') {
                actionBtn += `
                    <button class="btn btn-outline" style="padding: 4px 8px; font-size:12px; border-color:var(--success); color:var(--success)" 
                        onclick="markPaid('${rec.employee_id}', '${rec.month}', ${rec.year})" title="Mark as Paid">
                        <i class="fas fa-check"></i> Pay
                    </button>
                    <button class="action-btn" title="Download Payslip">
                        <i class="fas fa-download"></i>
                    </button>
                `;
            } else {
                 actionBtn += `
                    <button class="action-btn" title="Download Payslip">
                        <i class="fas fa-download"></i>
                    </button>
                `;
            }
            actionBtn += `</td>`;
        } else {
            actionBtn = `<td class="admin-only"></td>`;
        }

        tr.innerHTML = `
            <td>
                <div class="font-semibold">${rec.employee_name}</div>
                <div class="text-muted" style="font-size:11px;">${rec.employee_id}</div>
            </td>
            <td>${rec.month} ${rec.year}</td>
            <td class="text-muted">${rec.present}/${rec.working_days}</td>
            <td class="font-semibold" style="color:var(--text-main)">${formatCurrency(rec.gross)}</td>
            <td style="color:var(--danger)">${formatCurrency(rec.deductions)}</td>
            <td class="font-bold cursor-pointer" style="color:var(--primary-color)">${formatCurrency(rec.net_salary)}</td>
            <td><span class="badge badge-${rec.status}">${rec.status}</span></td>
            ${actionBtn}
        `;
        tbody.appendChild(tr);
    });
}

async function handleProcessSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('processBtn');
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    if(!payload.employee_id) {
        showToast('Please select an employee first!', 'error');
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        const res = await api('/api/payroll/process', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        showToast(res.message);
        
        if (payload.month === document.getElementById('filterMonth').value || !document.getElementById('filterMonth').value) {
            loadPayroll();
        }

    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Process Payroll';
    }
}

async function markPaid(employee_id, month, year) {
    if(!confirm('Mark this salary as Paid?')) return;
    
    try {
        await api('/api/payroll/process', {
            method: 'POST',
            body: JSON.stringify({ employee_id, month, year, action: 'pay' })
        });
        showToast('Salary marked as paid', 'success');
        loadPayroll();
    } catch (error) {
        showToast(error.message, 'error');
    }
}
