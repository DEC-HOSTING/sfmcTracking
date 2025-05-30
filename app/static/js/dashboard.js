/**
 * TaskMaster Dashboard - Modern JavaScript Interface
 * Handles all dashboard interactions, API calls, and UI updates
 */

class DashboardApp {
    constructor() {
        this.categories = [];
        this.tasks = [];
        this.currentUser = null;
        this.chatMessages = [];
        
        this.init();
    }
    
    async init() {
        try {
            // Show loading overlay
            this.showLoading();
            
            // Check authentication
            await this.checkAuth();
            
            // Initialize UI components
            this.initializeEventListeners();
            this.initializeModals();
            this.initializeChatInput();
            
            // Load initial data
            await this.loadCategories();
            await this.loadTasks();
            
            // Hide loading overlay
            this.hideLoading();
            
            console.log('Dashboard initialized successfully');
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showToast('Failed to initialize dashboard', 'error');
            this.hideLoading();
        }
    }
    
    // Authentication Methods
    async checkAuth() {
        try {
            const response = await fetch('/auth/check', {
                credentials: 'same-origin'
            });
            const data = await response.json();
            
            if (!data.authenticated) {
                window.location.href = '/';
                return;
            }
            
            this.currentUser = data.user;
            console.log('User authenticated:', this.currentUser);
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/';
        }
    }
    
    async logout() {
        try {            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = '/';
            } else {
                this.showToast('Logout failed', 'error');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            this.showToast('Logout failed', 'error');
        }
    }
    
    // UI Initialization
    initializeEventListeners() {
        // Header actions
        document.getElementById('newTaskBtn').addEventListener('click', () => this.showTaskModal());
        document.getElementById('askAIBtn').addEventListener('click', () => this.focusChatInput());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Sidebar actions
        document.getElementById('newCategoryBtn').addEventListener('click', () => this.showCategoryModal());
        document.getElementById('generateTasksBtn').addEventListener('click', () => this.generateTasksWithAI());
        
        // Chat form
        document.getElementById('chatForm').addEventListener('submit', (e) => this.handleChatSubmit(e));
        
        // Quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.target.dataset.prompt;
                if (prompt) {
                    document.getElementById('chatInput').value = prompt + ' ';
                    document.getElementById('chatInput').focus();
                }
            });
        });
        
        // Auto-resize chat input
        const chatInput = document.getElementById('chatInput');
        chatInput.addEventListener('input', () => {
            this.autoResizeTextarea(chatInput);
            this.updateCharCount();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    initializeModals() {
        // Task modal
        const taskModal = document.getElementById('taskModalOverlay');
        const taskForm = document.getElementById('taskForm');
        
        document.getElementById('closeTaskModal').addEventListener('click', () => this.hideTaskModal());
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.hideTaskModal());
        taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        
        // Category modal
        const categoryModal = document.getElementById('categoryModalOverlay');
        const categoryForm = document.getElementById('categoryForm');
        
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.hideCategoryModal());
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.hideCategoryModal());
        categoryForm.addEventListener('submit', (e) => this.handleCategorySubmit(e));
        
        // Close modals on overlay click
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) this.hideTaskModal();
        });
        categoryModal.addEventListener('click', (e) => {
            if (e.target === categoryModal) this.hideCategoryModal();
        });
    }
    
    initializeChatInput() {
        const chatInput = document.getElementById('chatInput');
        
        // Auto-resize
        this.autoResizeTextarea(chatInput);
        
        // Enter to send, Shift+Enter for new line
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('chatForm').dispatchEvent(new Event('submit'));
            }
        });
        
        // Character counter
        this.updateCharCount();
    }
    
    // Data Loading Methods
    async loadCategories() {
        try {
            const response = await fetch('/api/categories', {
                credentials: 'same-origin'
            });
            const data = await response.json();
            
            if (data.success) {
                this.categories = data.categories;
                this.renderCategories();
                this.updateCategorySelect();
            } else {
                throw new Error(data.message || 'Failed to load categories');
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.showToast('Failed to load categories', 'error');
        }
    }
      async loadTasks() {
        try {
            const response = await fetch('/api/tasks', {
                credentials: 'same-origin'
            });
            const data = await response.json();
            
            if (data.success) {
                this.tasks = data.tasks;
                this.renderTasks();
            } else {
                throw new Error(data.message || 'Failed to load tasks');
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.showToast('Failed to load tasks', 'error');
        }
    }
    
    // Rendering Methods
    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        
        if (this.categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No categories yet. Create your first category to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.categories.map(category => `
            <div class="category-item" data-category-id="${category.id}">
                <div class="category-header" onclick="dashboard.toggleCategory(${category.id})">
                    <div class="category-info">
                        <div class="category-color" style="background: ${category.color}"></div>
                        <span class="category-name">${this.escapeHtml(category.name)}</span>
                    </div>
                    <div class="category-stats">
                        <span>${category.completed_count}/${category.task_count}</span>
                        <span class="category-toggle">▶</span>
                    </div>
                </div>
                <div class="category-tasks">
                    <div class="tasks-list" data-category-id="${category.id}">
                        <!-- Tasks will be rendered here -->
                    </div>
                    <div class="task-add">
                        <input type="text" class="task-add-input" placeholder="Add new task..." 
                               onkeydown="dashboard.handleQuickTaskAdd(event, ${category.id})">
                        <button class="task-add-btn" onclick="dashboard.addQuickTask(${category.id})">Add</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderTasks() {
        this.categories.forEach(category => {
            const tasksContainer = document.querySelector(`[data-category-id="${category.id}"] .tasks-list`);
            if (!tasksContainer) return;
            
            const categoryTasks = this.tasks.filter(task => task.category_id === category.id);
            
            if (categoryTasks.length === 0) {
                tasksContainer.innerHTML = '<div class="empty-state">No tasks in this category</div>';
                return;
            }
            
            tasksContainer.innerHTML = categoryTasks.map(task => `
                <div class="task-item" data-task-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" 
                           ${task.done ? 'checked' : ''} 
                           onchange="dashboard.toggleTask(${task.id})">
                    <div class="task-content">
                        <div class="task-title ${task.done ? 'completed' : ''}">${this.escapeHtml(task.title)}</div>
                        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="task-action" onclick="dashboard.editTask(${task.id})" title="Edit">✏️</button>
                        <button class="task-action" onclick="dashboard.deleteTask(${task.id})" title="Delete">🗑️</button>
                    </div>
                </div>
            `).join('');
        });
    }
    
    updateCategorySelect() {
        const select = document.getElementById('taskCategory');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select category...</option>' +
            this.categories.map(category => 
                `<option value="${category.id}">${this.escapeHtml(category.name)}</option>`
            ).join('');
    }
    
    // Task Management
    async createTask(taskData) {
        try {            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(taskData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.tasks.push(data.task);
                this.renderTasks();
                this.showToast('Task created successfully', 'success');
                return true;
            } else {
                throw new Error(data.message || 'Failed to create task');
            }
        } catch (error) {
            console.error('Failed to create task:', error);
            this.showToast('Failed to create task', 'error');
            return false;
        }
    }
    
    async toggleTask(taskId) {
        try {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;
              const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ done: !task.done })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update local task
                const taskIndex = this.tasks.findIndex(t => t.id === taskId);
                this.tasks[taskIndex] = data.task;
                this.renderTasks();
            } else {
                throw new Error(data.message || 'Failed to update task');
            }
        } catch (error) {
            console.error('Failed to toggle task:', error);
            this.showToast('Failed to update task', 'error');
        }
    }
    
    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        try {            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.renderTasks();
                this.showToast('Task deleted successfully', 'success');
            } else {
                throw new Error(data.message || 'Failed to delete task');
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
            this.showToast('Failed to delete task', 'error');
        }
    }
    
    async addQuickTask(categoryId) {
        const input = document.querySelector(`[data-category-id="${categoryId}"] .task-add-input`);
        const title = input.value.trim();
        
        if (!title) return;
        
        const success = await this.createTask({
            title,
            category_id: categoryId,
            priority: 'medium'
        });
        
        if (success) {
            input.value = '';
        }
    }
    
    handleQuickTaskAdd(event, categoryId) {
        if (event.key === 'Enter') {
            this.addQuickTask(categoryId);
        }
    }
    
    // Category Management
    async createCategory(categoryData) {
        try {            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify(categoryData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.categories.push(data.category);
                this.renderCategories();
                this.updateCategorySelect();
                this.showToast('Category created successfully', 'success');
                return true;
            } else {
                throw new Error(data.message || 'Failed to create category');
            }
        } catch (error) {
            console.error('Failed to create category:', error);
            this.showToast('Failed to create category', 'error');
            return false;
        }
    }
    
    toggleCategory(categoryId) {
        const categoryItem = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (categoryItem) {
            categoryItem.classList.toggle('expanded');
        }
    }
    
    // Chat Management
    async sendMessage(message, generateTasks = false) {
        try {
            this.addMessageToChat('user', message);
            this.showTypingIndicator();
              const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    message,
                    generate_tasks: generateTasks
                })
            });
            
            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.success) {
                this.addMessageToChat('assistant', data.message);
                
                // Handle task generation
                if (data.created_tasks && data.created_tasks.length > 0) {
                    this.tasks.push(...data.created_tasks);
                    this.renderTasks();
                    this.showToast(`Created ${data.created_tasks.length} tasks`, 'success');
                }
                
                if (data.created_categories && data.created_categories.length > 0) {
                    this.categories.push(...data.created_categories);
                    this.renderCategories();
                    this.updateCategorySelect();
                    this.showToast(`Created ${data.created_categories.length} categories`, 'success');
                }
                
            } else {
                throw new Error(data.message || 'Chat failed');
            }
        } catch (error) {
            console.error('Chat failed:', error);
            this.hideTypingIndicator();
            this.addMessageToChat('assistant', 'I apologize, but I\'m experiencing technical difficulties. Please try again later.');
        }
    }
    
    addMessageToChat(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        
        // Hide welcome message after first user message
        if (role === 'user' && welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}`;
        messageElement.innerHTML = `
            <div class="message-avatar">
                ${role === 'user' ? '👤' : '🤖'}
            </div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(content)}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-text">AI is typing</div>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    async generateTasksWithAI() {
        const prompt = 'Create a comprehensive to-do list with multiple categories for organizing daily life and productivity';
        await this.sendMessage(prompt, true);
    }
    
    // Event Handlers
    async handleChatSubmit(event) {
        event.preventDefault();
        
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Check if this should generate tasks
        const generateTasks = /create|generate|make.*list|todo|task/i.test(message);
        
        chatInput.value = '';
        this.autoResizeTextarea(chatInput);
        this.updateCharCount();
        
        await this.sendMessage(message, generateTasks);
    }
    
    async handleTaskSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category_id: parseInt(formData.get('category_id')),
            priority: formData.get('priority')
        };
        
        const success = await this.createTask(taskData);
        if (success) {
            this.hideTaskModal();
            form.reset();
        }
    }
    
    async handleCategorySubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const categoryData = {
            name: formData.get('name'),
            color: formData.get('categoryColor')
        };
        
        const success = await this.createCategory(categoryData);
        if (success) {
            this.hideCategoryModal();
            form.reset();
        }
    }
    
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + K: Focus chat input
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.focusChatInput();
        }
        
        // Ctrl/Cmd + N: New task
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            this.showTaskModal();
        }
        
        // Escape: Close modals
        if (event.key === 'Escape') {
            this.hideAllModals();
        }
    }
    
    // Modal Management
    showTaskModal() {
        document.getElementById('taskModalOverlay').classList.add('active');
        document.getElementById('taskTitle').focus();
    }
    
    hideTaskModal() {
        document.getElementById('taskModalOverlay').classList.remove('active');
    }
    
    showCategoryModal() {
        document.getElementById('categoryModalOverlay').classList.add('active');
        document.getElementById('categoryName').focus();
    }
    
    hideCategoryModal() {
        document.getElementById('categoryModalOverlay').classList.remove('active');
    }
    
    hideAllModals() {
        document.getElementById('taskModalOverlay').classList.remove('active');
        document.getElementById('categoryModalOverlay').classList.remove('active');
    }
    
    // Utility Methods
    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }
    
    focusChatInput() {
        document.getElementById('chatInput').focus();
    }
    
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    updateCharCount() {
        const chatInput = document.getElementById('chatInput');
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = chatInput.value.length;
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✅' : 
                    type === 'error' ? '❌' : 
                    type === 'warning' ? '⚠️' : 'ℹ️';
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardApp;
}
