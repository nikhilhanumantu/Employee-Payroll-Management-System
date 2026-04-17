const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let allEmployees = [];

document.addEventListener('DOMContentLoaded', () => {
    // Current month/year default selection
    const date = new Date();
    document.getElementById('filterMonth').value = months[date.getMonth()];
    document.getElementById('filterYear').value = date.getFullYear();
    
    // Setup modal options
    const modalMonthSelect = document.getElementById('attMonth');
    if (modalMonthSelect) {
        months.forEach(m => {
            const option = document.createElement('option');
            option.value = m;
            option.textContent = m;
            modalMonthSelect.appendChild(option);
        });
        modalMonthSelect.value = months[date.getMonth()];
    }
    
    if (document.getElementById('attYear')) {
        document.getElementById('attYear').value = date.getFullYear();
    }

    if (getUser()?.role === 'employee') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    loadEmployeesForDropdown();
    loadAttendance();

    // Auto-calculate to ensure logical inputs
    if (document.getElementById('attPresent')) {
        ['attPresent', 'attAbsent', 'attLeaves'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', autoCheckWorkingDays);
        });
    }

    if (document.getElementById('attendanceForm')) {
        document.getElementById('attendanceForm').addEventListener('submit', handleAttendanceSubmit);
    }
});

async function loadEmployeesForDropdown() {
    try {
        allEmployees = await api('/api/employees');
        const select = document.getElementById('attEmployee');
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

async function loadAttendance() {
    const month = document.getElementById('filterMonth').value;
    const year = document.getElementById('filterYear').value;

    try {
        const url = `/api/attendance?month=${month}&year=${year}`;
        const data = await api(url);
        renderAttendance(data);
    } catch (error) {
        showToast('Failed to load attendance', 'error');
    }
}

function renderAttendance(records) {
    const tbody = document.getElementById('attendance-table');
    tbody.innerHTML = '';

    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No records found for selected period</td></tr>';
        return;
    }

    records.forEach(rec => {
        const prefilledData = encodeURIComponent(JSON.stringify(rec));
        
        let actionBtn = getUser()?.role === 'admin' 
        ? `<button class="action-btn" onclick="editAttendance('${prefilledData}')" title="Edit"><i class="fas fa-pen"></i></button>`
        : `<td class="admin-only"></td>`;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="font-semibold">${rec.employee_name}</div>
                <div class="text-muted" style="font-size:11px;">${rec.employee_id}</div>
            </td>
            <td>${rec.month} ${rec.year}</td>
            <td class="font-semibold" style="color:var(--success)">${rec.present}</td>
            <td style="color:var(--danger)">${rec.absent}</td>
            <td style="color:var(--warning)">${rec.leaves}</td>
            <td class="font-bold">${rec.working_days}</td>
            ${getUser()?.role === 'admin' ? `<td style="text-align:center">${actionBtn}</td>` : '<td class="admin-only"></td>'}
        `;
        tbody.appendChild(tr);
    });
}

function autoCheckWorkingDays() {
    const present = parseInt(document.getElementById('attPresent').value) || 0;
    const absent = parseInt(document.getElementById('attAbsent').value) || 0;
    const leaves = parseInt(document.getElementById('attLeaves').value) || 0;
    const workingDaysInput = document.getElementById('attWorking');
    
    // Optionally auto sync; for now just let user input and validate on submit
}

function openAttendanceModal() {
    document.getElementById('attendanceForm').reset();
    document.getElementById('modalTitle').textContent = 'Mark Attendance';
    document.getElementById('attEmployee').disabled = false;
    document.getElementById('attendanceModal').classList.add('active');
}

function editAttendance(dataStr) {
    const data = JSON.parse(decodeURIComponent(dataStr));
    openAttendanceModal();
    document.getElementById('modalTitle').textContent = 'Update Attendance';
    
    document.getElementById('attEmployee').value = data.employee_id;
    // Don't disable completely so value posts, or handle read-only visually. Better to just disable and re-enable before submit.
    
    document.getElementById('attMonth').value = data.month;
    document.getElementById('attYear').value = data.year;
    document.getElementById('attPresent').value = data.present;
    document.getElementById('attAbsent').value = data.absent;
    document.getElementById('attLeaves').value = data.leaves;
    document.getElementById('attWorking').value = data.working_days;
}

async function handleAttendanceSubmit(e) {
    e.preventDefault();
    
    const present = parseInt(document.getElementById('attPresent').value) || 0;
    const absent = parseInt(document.getElementById('attAbsent').value) || 0;
    const leaves = parseInt(document.getElementById('attLeaves').value) || 0;
    const working_days = parseInt(document.getElementById('attWorking').value) || 0;

    const btn = document.getElementById('saveBtn');
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    if(!payload.employee_id) {
        showToast('Please select an employee first!', 'error');
        return;
    }

    if (present + absent + leaves > working_days + 5) {
        showToast('Sum of days does not clearly map to working days', 'warning');
    }

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        await api('/api/attendance', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        showToast('Attendance updated');
        document.getElementById('attendanceModal').classList.remove('active');
        
        // Refresh table if the form month matches currently viewed month
        if(payload.month === document.getElementById('filterMonth').value) {
            loadAttendance();
        }

    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Attendance';
    }
}
