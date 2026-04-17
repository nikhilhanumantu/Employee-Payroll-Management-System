const API_URL = 'http://localhost:5000';

// Central API fetch wrapper handling tokens
async function api(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Handle unauthorized (expired token)
    if (response.status === 401 && !endpoint.includes('/login')) {
        logout();
        throw new Error('Session expired');
    }

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }
    
    return data;
}

// Auth state management
function checkAuth() {
    const token = sessionStorage.getItem('token');
    const user = getUser();
    if (!token && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('register.html') && !window.location.pathname.endsWith('/')) {
        window.location.href = 'index.html';
    }

    
    // Update UI with user info
    if (user) {
        const welcomeEl = document.getElementById('user-welcome');
        const roleEl = document.getElementById('user-role');
        const emailEl = document.getElementById('user-email');
        if(welcomeEl) welcomeEl.textContent = user.name;
        if(roleEl) roleEl.textContent = user.name.split(' ')[0] + ' (' + user.role + ')';
        if(emailEl) emailEl.textContent = user.email;

        // Hide Admin-only UI for employees
        if(user.role !== 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        }
    }
}

function getUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}

// UI Utilities
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return alert(message);

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle success-icon' : 'fa-exclamation-circle error-icon';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Side navigation active state
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Set active nav item
    const currentPath = window.location.pathname.split('/').pop();
    if(currentPath && document.querySelector('.nav-menu')) {
        document.querySelectorAll('.nav-item').forEach(el => {
            const href = el.getAttribute('href');
            if (href === currentPath) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    // Modal close global handlers
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if(modal) modal.classList.remove('active');
        });
    });

    // Notification dropdown toggle
    const notifIcon = document.querySelector('.notification-icon');
    const notifDropdown = document.querySelector('.notifications-dropdown');
    
    if (notifIcon && notifDropdown) {
        notifIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('active');
            if (notifDropdown.classList.contains('active')) {
                fetchNotifications();
            }
        });

        document.addEventListener('click', () => {
            notifDropdown.classList.remove('active');
        });

        notifDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Initial fetch of notifications count
    if (getUser()) {
        fetchNotifications();
        // Check every minute
        setInterval(fetchNotifications, 60000);
    }
});

async function fetchNotifications() {
    try {
        const notifications = await api('/api/notifications');
        renderNotifications(notifications);
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
    }
}

function renderNotifications(notifications) {
    const list = document.querySelector('.notifications-list');
    const dot = document.querySelector('.notification-dot');
    if (!list) return; // Stability fix for pages without notifications UI

    list.innerHTML = '';
    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (dot) {
        dot.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    if (notifications.length === 0) {
        list.innerHTML = '<div class="p-4 text-center text-muted">No notifications</div>';
        return;
    }

    notifications.forEach(n => {
        const item = document.createElement('div');
        item.className = `notification-item ${n.is_read ? '' : 'unread'}`;
        
        let iconClass = 'fa-info-circle text-blue-500';
        if (n.type === 'success') iconClass = 'fa-check-circle text-green-500';
        if (n.type === 'warning') iconClass = 'fa-exclamation-triangle text-yellow-500';
        if (n.type === 'danger') iconClass = 'fa-times-circle text-red-500';

        item.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <div class="notification-content">
                <p>${n.message}</p>
                <span>${new Date(n.created_at).toLocaleString()}</span>
            </div>
        `;

        item.onclick = () => markAsRead(n.id);
        list.appendChild(item);
    });
}

async function markAsRead(id) {
    try {
        await api(`/api/notifications/${id}/read`, { method: 'PUT' });
        fetchNotifications();
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

async function markAllAsRead() {
    try {
        await api('/api/notifications/read-all', { method: 'PUT' });
        fetchNotifications();
    } catch (error) {
        console.error('Failed to mark all as read:', error);
    }
}

