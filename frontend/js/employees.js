let allEmployees = [];
let isEditing = false;
let editId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();

    document.getElementById('searchInput').addEventListener('input', renderEmployees);
    document.getElementById('deptFilter').addEventListener('change', renderEmployees);

    document.getElementById('employeeForm').addEventListener('submit', handleEmployeeSubmit);
});

async function loadEmployees() {
    try {
        const data = await api('/api/employees');
        allEmployees = data;
        document.getElementById('total-employees-text').textContent = `${data.length} total employees`;
        renderEmployees();
    } catch (error) {
        showToast('Failed to load employees', 'error');
    }
}

function renderEmployees() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const deptFilter = document.getElementById('deptFilter').value;
    const userRole = getUser()?.role;

    const filtered = allEmployees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm) || 
                              emp.id.toLowerCase().includes(searchTerm) ||
                              emp.email.toLowerCase().includes(searchTerm);
        const matchesDept = deptFilter === "" || emp.department === deptFilter;
        return matchesSearch && matchesDept;
    });

    const tbody = document.getElementById('employees-table');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No employees found</td></tr>';
        return;
    }

    filtered.forEach(emp => {
        const tr = document.createElement('tr');
        
        let actionsHtml = '';
        if (userRole === 'admin') {
            actionsHtml = `
                <td style="text-align: center;">
                    <button class="action-btn" onclick='openEmployeeModal(${JSON.stringify(emp).replace(/'/g, "&#39;")})' title="Edit">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteEmployee('${emp.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        } else {
            actionsHtml = `<td class="admin-only"></td>`;
        }

        tr.innerHTML = `
            <td class="text-muted">${emp.id}</td>
            <td class="font-semibold">${emp.name}</td>
            <td><span class="badge badge-dept">${emp.department}</span></td>
            <td class="text-muted">${emp.designation}</td>
            <td>${emp.email}</td>
            <td class="font-semibold">${formatCurrency(emp.basic_salary)}</td>
            ${actionsHtml}
        `;
        tbody.appendChild(tr);
    });
}

function openEmployeeModal(employeeData = null) {
    const modal = document.getElementById('employeeModal');
    const form = document.getElementById('employeeForm');
    
    form.reset();
    isEditing = false;
    editId = null;
    document.getElementById('modalTitle').textContent = 'Add Employee';
    document.getElementById('empId').readOnly = false;

    if (employeeData) {
        isEditing = true;
        editId = employeeData.id;
        document.getElementById('modalTitle').textContent = 'Edit Employee';
        document.getElementById('empId').value = employeeData.id;
        document.getElementById('empId').readOnly = true;
        document.getElementById('empName').value = employeeData.name;
        document.getElementById('empDept').value = employeeData.department;
        document.getElementById('empDesignation').value = employeeData.designation;
        document.getElementById('empEmail').value = employeeData.email;
        document.getElementById('empSalary').value = employeeData.basic_salary;
    }

    modal.classList.add('active');
}

async function handleEmployeeSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('saveEmployeeBtn');
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        if (isEditing) {
            await api(`/api/employees/${editId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast('Employee updated successfully');
        } else {
            await api('/api/employees', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast('Employee added successfully');
        }
        
        document.getElementById('employeeModal').classList.remove('active');
        loadEmployees();

    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Employee';
    }
}

async function deleteEmployee(id) {
    if(!confirm(`Are you sure you want to delete employee ${id}? This will also delete their attendance and payroll history.`)) return;
    
    try {
        await api(`/api/employees/${id}`, { method: 'DELETE' });
        showToast('Employee deleted successfully');
        loadEmployees();
    } catch (error) {
        showToast('Failed to delete employee: ' + error.message, 'error');
    }
}
