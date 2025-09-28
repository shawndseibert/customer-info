// Customer Information Management System
class CustomerManager {
    constructor() {
        this.customers = this.loadCustomers();
        this.currentEditingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCustomers();
        this.updateStats();
        this.setupFormValidation();
    }

    // Event Bindings
    bindEvents() {
        // Helper function to safely add event listeners
        const safeAddEventListener = (elementId, event, handler) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`Element with ID '${elementId}' not found`);
            }
        };

        // Form submission
        safeAddEventListener('customerForm', 'submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Clear form
        safeAddEventListener('clearForm', 'click', () => {
            this.clearForm();
        });

        // Search functionality
        safeAddEventListener('searchInput', 'input', (e) => {
            this.filterCustomers();
        });

        // Status filter
        safeAddEventListener('statusFilter', 'change', () => {
            this.filterCustomers();
        });

        // Priority filter
        safeAddEventListener('priorityFilter', 'change', () => {
            this.filterCustomers();
        });

        // Export data
        safeAddEventListener('exportData', 'click', () => {
            this.exportData();
        });

        // Import QR code submissions
        safeAddEventListener('importSubmissions', 'click', () => {
            this.importCustomerSubmissions();
        });

        // Import from Google Sheets
        safeAddEventListener('syncGoogleSheets', 'click', () => {
            this.syncFromGoogleSheets();
        });

        // Push to Google Sheets
        safeAddEventListener('pushToGoogleSheets', 'click', () => {
            this.pushAllToGoogleSheets();
        });

        // Deduplicate customers
        safeAddEventListener('deduplicateCustomers', 'click', () => {
            if (confirm('This will merge duplicate customers based on phone numbers. This action cannot be undone. Continue?')) {
                this.deduplicateCustomers();
            }
        });

        // Remove all leads
        safeAddEventListener('removeAllLeads', 'click', () => {
            if (confirm('⚠️ WARNING: This will permanently delete ALL customer records from local storage!\n\nThis action cannot be undone. Are you sure you want to continue?')) {
                this.removeAllLeads();
            }
        });

        // Generate test customer
        const testCustomerIcon = document.getElementById('generateTestCustomer');
        if (testCustomerIcon) {
            console.log('Test customer icon found, adding click listener');
            console.log('Icon element:', testCustomerIcon);
            
            // Add multiple event listeners to debug
            testCustomerIcon.addEventListener('click', (e) => {
                console.log('CLICK EVENT FIRED!', e);
                e.preventDefault();
                e.stopPropagation();
                this.generateTestCustomer();
            });
            
            testCustomerIcon.addEventListener('mousedown', (e) => {
                console.log('MOUSEDOWN EVENT FIRED!', e);
            });
            
            testCustomerIcon.addEventListener('mouseup', (e) => {
                console.log('MOUSEUP EVENT FIRED!', e);
            });
            
        } else {
            console.error('Test customer icon not found!');
        }

        // Modal events
        const closeButton = document.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closeModal();
            });
        }

        safeAddEventListener('closeModal', 'click', () => {
            this.closeModal();
        });

        safeAddEventListener('editCustomer', 'click', () => {
            this.editCustomer();
        });

        safeAddEventListener('deleteCustomer', 'click', () => {
            this.deleteCustomer();
        });

        // Close modal when clicking outside
        const customerModal = document.getElementById('customerModal');
        if (customerModal) {
            customerModal.addEventListener('click', (e) => {
                if (e.target.id === 'customerModal') {
                    this.closeModal();
                }
            });
        }

        // Auto-save form data on input changes
        const formInputs = document.querySelectorAll('#customerForm input, #customerForm select, #customerForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.autoSaveFormData();
            });
        });

        // Load auto-saved data on page load
        this.loadAutoSavedData();

        // Bind stat card click events for filtering
        this.bindStatCardEvents();

        // Initialize theme toggle
        this.initializeThemeIntegration();
    }

    // Bind stat card click events for filtering
    bindStatCardEvents() {
        const statCards = document.querySelectorAll('.clickable-stat');
        statCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const filterValue = card.getAttribute('data-filter');
                this.filterCustomersByStatCard(filterValue, card);
            });
        });

        // Bind priority card click events
        const priorityCards = document.querySelectorAll('.clickable-priority');
        priorityCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const priorityValue = card.getAttribute('data-priority');
                this.filterCustomersByPriority(priorityValue, card);
            });
        });
    }

    // Filter customers based on stat card selection
    filterCustomersByStatCard(filterValue, clickedCard) {
        // Update the status filter dropdown
        const statusFilter = document.getElementById('statusFilter');
        
        // Remove active class from all stat cards
        document.querySelectorAll('.clickable-stat').forEach(card => {
            card.classList.remove('active');
        });
        
        // Add active class to clicked card
        clickedCard.classList.add('active');
        
        // Set the filter dropdown value and trigger filtering
        if (filterValue === '') {
            // Show all customers - reset both status and priority filters
            statusFilter.value = '';
            const priorityFilter = document.getElementById('priorityFilter');
            priorityFilter.value = '';
            // Remove active class from all priority cards too
            document.querySelectorAll('.clickable-priority').forEach(card => {
                card.classList.remove('active');
            });
            this.showNotification('Showing all customers', 'info');
        } else if (filterValue === 'in-progress,scheduled') {
            // Active projects: in-progress and scheduled
            statusFilter.value = 'in-progress'; // Set to one of the active statuses
            this.filterCustomersByMultipleStatuses(['in-progress', 'scheduled']);
            this.showNotification('Showing active projects (In Progress & Scheduled)', 'info');
            return; // Skip the normal filtering since we're doing custom multi-status filtering
        } else {
            // Single status filter
            statusFilter.value = filterValue;
            const statusLabels = {
                'completed': 'completed projects',
                'follow-up': 'customers needing follow-up'
            };
            this.showNotification(`Showing ${statusLabels[filterValue] || filterValue}`, 'info');
        }
        
        // Trigger the normal filter function
        this.filterCustomers();
    }

    // Filter customers by multiple statuses (for active projects)
    filterCustomersByMultipleStatuses(statuses) {
        const customers = this.getAllCustomers();
        const filteredCustomers = customers.filter(customer => 
            statuses.includes(customer.status)
        );
        this.displayCustomers(filteredCustomers);
    }

    // Filter customers by priority
    filterCustomersByPriority(priorityValue, clickedCard) {
        // Update the priority filter dropdown
        const priorityFilter = document.getElementById('priorityFilter');
        
        // Remove active class from all priority cards
        document.querySelectorAll('.clickable-priority').forEach(card => {
            card.classList.remove('active');
        });
        
        // Add active class to clicked card
        clickedCard.classList.add('active');
        
        // Set the priority filter dropdown value and trigger filtering
        priorityFilter.value = priorityValue;
        
        const priorityLabels = {
            'emergency': 'emergency priority customers',
            'high': 'high priority customers',
            'medium': 'medium priority customers',
            'low': 'low priority customers'
        };
        
        this.showNotification(`Showing ${priorityLabels[priorityValue]}`, 'info');
        
        // Trigger the normal filter function
        this.filterCustomers();
    }

    // Initialize theme toggle functionality
    initializeThemeIntegration() {
        // Listen for theme changes from the universal theme manager
        window.addEventListener('themeChanged', (e) => {
            const { theme, preference } = e.detail;
            let message;
            
            switch (preference) {
                case 'auto':
                    message = `Auto theme (currently ${theme})`;
                    break;
                case 'light':
                    message = 'Light theme';
                    break;
                case 'dark':
                    message = 'Dark theme';
                    break;
            }
            
            if (message) {
                this.showNotification(message, 'info');
            }
        });
        
        // Migrate old theme preference to new system
        const oldTheme = localStorage.getItem('adminTheme');
        if (oldTheme && oldTheme !== 'auto') {
            localStorage.setItem('themePreference', oldTheme);
            localStorage.removeItem('adminTheme');
        }
    }

    // Form Validation
    setupFormValidation() {
        const form = document.getElementById('customerForm');
        const inputs = form.querySelectorAll('input[required], select[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', (e) => {
            this.formatPhoneNumber(e.target);
        });

        // Email validation
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', () => {
            this.validateEmail(emailInput);
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        this.clearFieldError(field);

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    validateEmail(emailField) {
        const email = emailField.value.trim();
        if (email && !this.isValidEmail(email)) {
            this.showFieldError(emailField, 'Please enter a valid email address');
            return false;
        }
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        input.value = value;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        field.style.borderColor = '#e53e3e';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#e53e3e';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        field.style.borderColor = '#e2e8f0';
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Form Handling
    handleFormSubmit() {
        const formData = this.getFormData();
        
        // Validate all required fields
        const form = document.getElementById('customerForm');
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        let isFormValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        // Validate email if provided
        const emailField = document.getElementById('email');
        if (!this.validateEmail(emailField)) {
            isFormValid = false;
        }

        if (!isFormValid) {
            this.showNotification('Please fix the errors before submitting', 'error');
            return;
        }

        if (this.currentEditingId) {
            this.updateCustomer(this.currentEditingId, formData);
            this.showNotification('Customer updated successfully!', 'success');
        } else {
            this.addCustomer(formData);
            this.showNotification('Customer added successfully!', 'success');
        }

        this.clearForm();
        this.clearAutoSavedData();
        // Note: renderCustomers() and updateStats() are now called by saveCustomers()
    }

    getFormData() {
        const form = document.getElementById('customerForm');
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Add timestamp and ID
        data.id = this.currentEditingId || this.generateId();
        data.createdAt = this.currentEditingId ? 
            this.customers.find(c => c.id === this.currentEditingId)?.createdAt || new Date().toISOString() :
            new Date().toISOString();
        data.updatedAt = new Date().toISOString();

        return data;
    }

    // Auto-save functionality
    autoSaveFormData() {
        const formData = this.getFormData();
        localStorage.setItem('customerFormAutoSave', JSON.stringify(formData));
    }

    loadAutoSavedData() {
        const autoSavedData = localStorage.getItem('customerFormAutoSave');
        if (autoSavedData) {
            const data = JSON.parse(autoSavedData);
            this.populateForm(data);
            this.showNotification('Auto-saved data restored', 'info');
        }
    }

    clearAutoSavedData() {
        localStorage.removeItem('customerFormAutoSave');
    }

    // Customer Management
    addCustomer(customerData) {
        this.customers.push(customerData);
        this.saveCustomers();
        
        // Automatically sync new customer to Google Sheets
        this.syncToGoogleSheets(customerData);
    }

    updateCustomer(id, customerData) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            this.customers[index] = { ...this.customers[index], ...customerData };
            this.saveCustomers();
            
            // Sync update to Google Sheets
            this.updateCustomerInGoogleSheets(this.customers[index]);
        }
    }

    deleteCustomer() {
        if (this.currentEditingId && confirm('Are you sure you want to delete this customer?')) {
            this.customers = this.customers.filter(c => c.id !== this.currentEditingId);
            this.saveCustomers();
            this.closeModal();
            // Note: renderCustomers() and updateStats() are now called by saveCustomers()
            this.showNotification('Customer deleted successfully', 'success');
        }
    }

    // Quick Actions
    updateCustomerStatus(customerId, newStatus) {
        const customerIndex = this.customers.findIndex(c => c.id === customerId);
        if (customerIndex !== -1) {
            this.customers[customerIndex].status = newStatus;
            this.customers[customerIndex].updatedAt = new Date().toISOString();
            this.saveCustomers();
            // Note: renderCustomers() and updateStats() are now called by saveCustomers()
            this.showNotification(`Status updated to "${this.getStatusLabel(newStatus)}"`, 'success');
            
            // Sync status update to Google Sheets
            this.updateCustomerInGoogleSheets(this.customers[customerIndex]);
        }
    }

    quickEdit(customerId) {
        this.currentEditingId = customerId;
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            this.populateForm(customer);
            document.getElementById('customerForm').scrollIntoView({ behavior: 'smooth' });
            
            // Update form button text
            const submitBtn = document.querySelector('#customerForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Customer';
            }
            
            // Update form title
            const formTitle = document.querySelector('.form-section h2');
            if (formTitle) {
                formTitle.innerHTML = `<i class="fas fa-user-edit"></i> Edit ${customer.firstName} ${customer.lastName}`;
            }
        }
    }

    markContacted(customerId) {
        const customerIndex = this.customers.findIndex(c => c.id === customerId);
        if (customerIndex !== -1) {
            const customer = this.customers[customerIndex];
            const currentDate = new Date().toISOString();
            
            if (customer.contacted) {
                // Customer is already contacted - remove contacted status
                customer.contacted = false;
                customer.contactedDate = null;
                
                // Remove contact note from notes (find and remove the most recent one)
                if (customer.notes) {
                    customer.notes = customer.notes
                        .replace(/\s*\|\s*Contacted on \d{1,2}\/\d{1,2}\/\d{4}$/, '') // Remove trailing contact note
                        .replace(/^Contacted on \d{1,2}\/\d{1,2}\/\d{4}\s*\|\s*/, '') // Remove leading contact note
                        .replace(/\s*\|\s*Contacted on \d{1,2}\/\d{1,2}\/\d{4}\s*\|\s*/, ' | '); // Remove middle contact note
                    
                    // Clean up empty notes
                    if (customer.notes.trim() === '') {
                        customer.notes = '';
                    }
                }
                
                customer.updatedAt = currentDate;
                
                this.saveCustomers();
                this.renderCustomers();
                this.updateStats();
                this.showNotification(`${customer.firstName} ${customer.lastName} contact status removed`, 'info');
                
            } else {
                // Mark customer as contacted
                customer.contacted = true;
                customer.contactedDate = currentDate;
                
                // Update status if it's still initial
                if (customer.status === 'initial' || !customer.status) {
                    customer.status = 'quoted';
                }
                
                // Add contact note
                const contactNote = `Contacted on ${new Date().toLocaleDateString()}`;
                customer.notes = customer.notes ? `${customer.notes} | ${contactNote}` : contactNote;
                customer.updatedAt = currentDate;
                
                this.saveCustomers();
                this.renderCustomers();
                this.updateStats();
                this.showNotification(`${customer.firstName} ${customer.lastName} marked as contacted`, 'success');
            }
        }
    }

    // Data Storage
    loadCustomers() {
        const stored = localStorage.getItem('customers');
        return stored ? JSON.parse(stored) : [];
    }

    saveCustomers() {
        localStorage.setItem('customers', JSON.stringify(this.customers));
        // Refresh customer display to update colors
        this.renderCustomers();
        this.updateStats();
    }

    // Rendering
    renderCustomers() {
        const customerList = document.getElementById('customerList');
        const filteredCustomers = this.getFilteredCustomers();

        if (filteredCustomers.length === 0) {
            customerList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No customers found</h3>
                    <p>Add your first customer using the form on the left</p>
                </div>
            `;
            return;
        }

        const customersHTML = filteredCustomers.map(customer => this.createCustomerCard(customer)).join('');
        customerList.innerHTML = customersHTML;

        // Add click events to customer cards
        customerList.querySelectorAll('.customer-card').forEach(card => {
            card.addEventListener('click', () => {
                const customerId = card.dataset.customerId;
                this.showCustomerDetails(customerId);
            });
        });

        // Add status change event listeners
        customerList.querySelectorAll('.quick-status-update').forEach(select => {
            select.addEventListener('change', (e) => {
                const customerId = e.target.dataset.customerId;
                const newStatus = e.target.value;
                this.updateCustomerStatus(customerId, newStatus);
            });
        });
    }

    createCustomerCard(customer) {
        const createdDate = new Date(customer.createdAt).toLocaleDateString();
        const priorityClass = `priority-${customer.priority || 'medium'}`;
        const statusClass = `status-${customer.status || 'initial'}`;
        
        return `
            <div class="customer-card ${customer.contacted ? 'contacted' : ''}" data-customer-id="${customer.id}" data-priority="${customer.priority || 'medium'}" data-status="${customer.status || 'initial'}">
                <div class="customer-card-header">
                    <div class="customer-info">
                        <div class="customer-name">${customer.firstName} ${customer.lastName}</div>
                        <div class="customer-phone">${customer.phone}</div>
                    </div>
                    <div class="customer-badge-row">
                        <div class="customer-service">${this.getServiceTypeLabel(customer.serviceType)}</div>
                        <div class="priority-badge ${priorityClass}">
                            ${(customer.priority || 'medium').toUpperCase()}
                        </div>
                        ${customer.contacted ? '<div class="contacted-indicator"><i class="fas fa-phone"></i> CONTACTED</div>' : ''}
                    </div>
                </div>
                <div class="customer-details">
                    <div><strong>Email:</strong> ${customer.email || 'Not provided'}</div>
                    <div class="status-row">
                        <strong>Status:</strong> 
                        <select class="quick-status-update" data-customer-id="${customer.id}" onclick="event.stopPropagation()">
                            <option value="initial" ${(customer.status || 'initial') === 'initial' ? 'selected' : ''}>Initial Contact</option>
                            <option value="quoted" ${customer.status === 'quoted' ? 'selected' : ''}>Quote Provided</option>
                            <option value="scheduled" ${customer.status === 'scheduled' ? 'selected' : ''}>Work Scheduled</option>
                            <option value="in-progress" ${customer.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${customer.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="follow-up" ${customer.status === 'follow-up' ? 'selected' : ''}>Follow-up Needed</option>
                        </select>
                    </div>
                    <div><strong>Budget:</strong> ${this.getBudgetLabel(customer.budget)}</div>
                    <div><strong>Added:</strong> ${createdDate}</div>
                </div>
                ${customer.notes ? `<div class="customer-notes">${this.formatCustomerNotes(customer.notes)}</div>` : ''}
                ${customer.meetingDate ? `<div class="customer-meeting"><strong>Next Meeting:</strong> ${new Date(customer.meetingDate).toLocaleString()}</div>` : ''}
                <div class="customer-actions" onclick="event.stopPropagation()">
                    <button class="action-btn edit-btn" onclick="window.customerManager.quickEdit('${customer.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${customer.contacted ? 
                        `<button class="action-btn contact-btn contacted" onclick="window.customerManager.markContacted('${customer.id}')">
                            <i class="fas fa-phone-slash"></i> Remove Contacted
                        </button>` :
                        `<button class="action-btn contact-btn" onclick="window.customerManager.markContacted('${customer.id}')">
                            <i class="fas fa-phone"></i> Mark Contacted
                        </button>`
                    }
                </div>
            </div>
        `;
    }

    // Filtering and Search
    getFilteredCustomers() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;

        return this.customers.filter(customer => {
            const matchesSearch = !searchTerm || 
                customer.firstName.toLowerCase().includes(searchTerm) ||
                customer.lastName.toLowerCase().includes(searchTerm) ||
                customer.phone.includes(searchTerm) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
                (customer.notes && customer.notes.toLowerCase().includes(searchTerm)) ||
                this.getServiceTypeLabel(customer.serviceType).toLowerCase().includes(searchTerm);

            const matchesStatus = !statusFilter || customer.status === statusFilter;
            const matchesPriority = !priorityFilter || customer.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        }).sort((a, b) => {
            // Sort by priority first, then by creation date
            const priorityOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;
            
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    filterCustomers() {
        this.renderCustomers();
    }

    // Modal Functions
    showCustomerDetails(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;

        // Debug: Check priority field
        console.log('Customer priority debug:', {
            id: customer.id,
            priority: customer.priority,
            allFields: Object.keys(customer),
            customerData: customer
        });

        this.currentEditingId = customerId;
        const modal = document.getElementById('customerModal');
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');

        modalTitle.textContent = `${customer.firstName} ${customer.lastName}`;

        modalBody.innerHTML = `
            <div class="detail-section">
                <h4><i class="fas fa-address-card"></i> Contact Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Full Name</span>
                        <span class="detail-value">${customer.firstName} ${customer.lastName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Phone</span>
                        <span class="detail-value">${customer.phone}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Email</span>
                        <span class="detail-value">${customer.email || 'Not provided'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Address</span>
                        <span class="detail-value">${customer.address || 'Not provided'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-tools"></i> Service Details</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Service Type</span>
                        <span class="detail-value">${this.getServiceTypeLabel(customer.serviceType)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Priority</span>
                        <span class="detail-value priority-badge-inline priority-${customer.priority || 'medium'}">${(customer.priority || 'medium').toUpperCase()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status</span>
                        <span class="detail-value status-badge status-${customer.status || 'initial'}">${this.getStatusLabel(customer.status)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Budget Range</span>
                        <span class="detail-value">${this.getBudgetLabel(customer.budget)}</span>
                    </div>
                </div>
                ${customer.productDetails ? `
                    <div class="detail-item">
                        <span class="detail-label">Product Details</span>
                        <span class="detail-value">${customer.productDetails}</span>
                    </div>
                ` : ''}
            </div>

            <div class="detail-section">
                <h4><i class="fas fa-calendar-alt"></i> Timeline & Notes</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Preferred Start Date</span>
                        <span class="detail-value">${customer.preferredDate ? new Date(customer.preferredDate).toLocaleDateString() : 'Not specified'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Next Meeting</span>
                        <span class="detail-value">${customer.meetingDate ? new Date(customer.meetingDate).toLocaleString() : 'Not scheduled'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Referral Source</span>
                        <span class="detail-value">${this.getReferralLabel(customer.referralSource)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date Added</span>
                        <span class="detail-value">${new Date(customer.createdAt).toLocaleString()}</span>
                    </div>
                </div>
                ${customer.notes ? `
                    <div class="detail-item">
                        <span class="detail-label">Notes</span>
                        <span class="detail-value">${this.formatCustomerNotes(customer.notes)}</span>
                    </div>
                ` : ''}
            </div>
        `;

        modal.style.display = 'block';
    }

    editCustomer() {
        const customer = this.customers.find(c => c.id === this.currentEditingId);
        if (customer) {
            this.populateForm(customer);
            this.closeModal(false); // Don't clear editing ID when closing modal for editing
            document.getElementById('customerForm').scrollIntoView({ behavior: 'smooth' });
            
            // Update form button text to show we're editing
            const submitBtn = document.querySelector('#customerForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Customer';
            }
        }
    }

    closeModal(clearEditingId = true) {
        document.getElementById('customerModal').style.display = 'none';
        if (clearEditingId) {
            this.currentEditingId = null;
        }
    }

    // Form Management
    populateForm(customer) {
        const form = document.getElementById('customerForm');
        Object.keys(customer).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.tagName === 'SELECT') {
                    // Handle select fields specially
                    if (key === 'serviceType') {
                        // For service type, try to find the exact match first
                        let valueToSet = customer[key] || '';
                        
                        // If the stored value doesn't match any option, try to find by label
                        const option = Array.from(field.options).find(opt => 
                            opt.value === valueToSet || 
                            opt.textContent === valueToSet ||
                            this.getServiceTypeLabel(opt.value) === valueToSet
                        );
                        
                        if (option) {
                            field.value = option.value;
                        } else {
                            console.warn('Could not find matching service type option for:', valueToSet);
                            field.value = '';
                        }
                    } else {
                        field.value = customer[key] || '';
                    }
                } else {
                    field.value = customer[key] || '';
                }
            }
        });
        
        // Update form title
        const formTitle = document.querySelector('.form-section h2');
        formTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit Customer';
        
        // Update button text
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update Customer Information';
    }

    clearForm() {
        document.getElementById('customerForm').reset();
        this.currentEditingId = null;
        
        // Reset form title
        const formTitle = document.querySelector('.form-section h2');
        formTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New Customer';
        
        // Reset button text
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-save"></i> Save Customer Information';
        
        // Clear any validation errors
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
        
        const errorFields = document.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
            field.style.borderColor = '#e2e8f0';
        });
    }

    // Statistics
    updateStats() {
        const totalCustomers = this.customers.length;
        const activeProjects = this.customers.filter(c => ['scheduled', 'in-progress'].includes(c.status)).length;
        const completedProjects = this.customers.filter(c => c.status === 'completed').length;
        const followUpNeeded = this.customers.filter(c => c.status === 'follow-up').length;

        // Update main stats
        document.getElementById('totalCustomers').textContent = totalCustomers;
        document.getElementById('activeProjects').textContent = activeProjects;
        document.getElementById('completedProjects').textContent = completedProjects;
        document.getElementById('followUpNeeded').textContent = followUpNeeded;

        // Update status breakdown
        const statusCounts = {
            initial: this.customers.filter(c => c.status === 'initial').length,
            quoted: this.customers.filter(c => c.status === 'quoted').length,
            scheduled: this.customers.filter(c => c.status === 'scheduled').length,
            inProgress: this.customers.filter(c => c.status === 'in-progress').length,
            completed: this.customers.filter(c => c.status === 'completed').length,
            followUp: this.customers.filter(c => c.status === 'follow-up').length
        };

        // Update status elements
        const statusElement = (id, count) => {
            const element = document.getElementById(id);
            if (element) element.textContent = count;
        };

        statusElement('statusInitial', statusCounts.initial);
        statusElement('statusQuoted', statusCounts.quoted);
        statusElement('statusScheduled', statusCounts.scheduled);
        statusElement('statusInProgress', statusCounts.inProgress);
        statusElement('statusCompleted', statusCounts.completed);
        statusElement('statusFollowUp', statusCounts.followUp);

        // Update priority breakdown
        const priorityCounts = {
            emergency: this.customers.filter(c => c.priority === 'emergency').length,
            high: this.customers.filter(c => c.priority === 'high').length,
            medium: this.customers.filter(c => c.priority === 'medium').length,
            low: this.customers.filter(c => c.priority === 'low').length
        };

        // Update priority elements
        const priorityElement = (id, count) => {
            const element = document.getElementById(id);
            if (element) element.textContent = count;
        };

        priorityElement('priorityEmergency', priorityCounts.emergency);
        priorityElement('priorityHigh', priorityCounts.high);
        priorityElement('priorityMedium', priorityCounts.medium);
        priorityElement('priorityLow', priorityCounts.low);
    }

    // Deduplication utility
    deduplicateCustomers() {
        console.log('Starting deduplication process...');
        const originalCount = this.customers.length;
        const phoneMap = new Map();
        const duplicatesFound = [];
        
        // Group customers by phone number
        this.customers.forEach((customer, index) => {
            const phone = customer.phone?.replace(/\D/g, ''); // Remove non-digits for comparison
            if (phone && phoneMap.has(phone)) {
                const existing = phoneMap.get(phone);
                duplicatesFound.push({
                    original: existing,
                    duplicate: { customer, index }
                });
            } else if (phone) {
                phoneMap.set(phone, { customer, index });
            }
        });
        
        if (duplicatesFound.length === 0) {
            this.showNotification('No duplicates found!', 'success');
            return;
        }
        
        // Merge duplicates (keep the most recent or most complete data)
        const indicesToRemove = [];
        let mergedCount = 0;
        
        duplicatesFound.forEach(({ original, duplicate }) => {
            const originalCustomer = original.customer;
            const duplicateCustomer = duplicate.customer;
            
            // Determine which has more recent data
            const originalDate = new Date(originalCustomer.updatedAt || originalCustomer.createdAt || 0);
            const duplicateDate = new Date(duplicateCustomer.updatedAt || duplicateCustomer.createdAt || 0);
            
            if (duplicateDate > originalDate) {
                // Replace original with duplicate data but keep the better ID format
                const bestId = this.chooseBestId(originalCustomer.id, duplicateCustomer.id);
                this.customers[original.index] = { ...duplicateCustomer, id: bestId };
                indicesToRemove.push(duplicate.index);
            } else {
                // Keep original, just remove duplicate
                indicesToRemove.push(duplicate.index);
            }
            mergedCount++;
        });
        
        // Remove duplicates (sort indices in reverse order to avoid index shifting)
        indicesToRemove.sort((a, b) => b - a).forEach(index => {
            this.customers.splice(index, 1);
        });
        
        this.saveCustomers();
        this.renderCustomers();
        this.updateStats();
        
        this.showNotification(
            `Deduplication complete! Removed ${indicesToRemove.length} duplicates from ${originalCount} customers.`,
            'success'
        );
        
        console.log(`Deduplication results: ${originalCount} → ${this.customers.length} customers`);
    }
    
    chooseBestId(id1, id2) {
        // Prefer alphanumeric IDs over pure numeric IDs
        const isNumeric1 = /^\d+$/.test(id1);
        const isNumeric2 = /^\d+$/.test(id2);
        
        if (isNumeric1 && !isNumeric2) return id2; // Prefer alphanumeric
        if (!isNumeric1 && isNumeric2) return id1; // Prefer alphanumeric
        
        // If both are same type, prefer the shorter one (more recent alphanumeric IDs are typically shorter)
        return id1.length <= id2.length ? id1 : id2;
    }

    // Remove all customer leads
    removeAllLeads() {
        console.log('Removing all customer leads from local storage...');
        const originalCount = this.customers.length;
        
        // Clear the customers array
        this.customers = [];
        
        // Clear both localStorage keys
        localStorage.removeItem('customerSubmissions');
        localStorage.removeItem('customers');
        
        // Save the empty state and update display
        this.saveCustomers();
        
        // Show success notification
        this.showNotification(
            `Successfully removed all ${originalCount} customer records. You can now import fresh data from Google Sheets.`,
            'success'
        );
        
        console.log(`Removed ${originalCount} customer records from local storage`);
    }

    // Data Export
    exportData() {
        if (this.customers.length === 0) {
            this.showNotification('No data to export', 'warning');
            return;
        }

        const csvData = this.convertToCSV(this.customers);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customer-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    // Import Customer Submissions from QR Code Form
    importCustomerSubmissions() {
        const submissions = JSON.parse(localStorage.getItem('customerSubmissions') || '[]');
        
        if (submissions.length === 0) {
            this.showNotification('No QR code submissions found to import', 'info');
            return;
        }

        let importedCount = 0;
        let skippedCount = 0;

        submissions.forEach(submission => {
            // Check if this submission already exists (by phone number and timestamp)
            const existingCustomer = this.customers.find(c => 
                c.phone === submission.phone && 
                Math.abs(new Date(c.createdAt) - new Date(submission.timestamp)) < 60000 // Within 1 minute
            );

            if (!existingCustomer) {
                // Convert submission format to customer format
                const customerData = this.convertSubmissionToCustomer(submission);
                this.customers.push(customerData);
                importedCount++;
            } else {
                skippedCount++;
            }
        });

        if (importedCount > 0) {
            this.saveCustomers();
            this.renderCustomers();
            this.updateStats();
            
            // Clear imported submissions to avoid re-importing
            localStorage.removeItem('customerSubmissions');
            
            this.showNotification(
                `Successfully imported ${importedCount} new leads from QR code submissions!` + 
                (skippedCount > 0 ? ` (${skippedCount} duplicates skipped)` : ''), 
                'success'
            );
        } else {
            this.showNotification(
                skippedCount > 0 ? 'All submissions were already imported' : 'No new submissions to import', 
                'info'
            );
        }
    }

    convertSubmissionToCustomer(submission) {
        // Map customer form fields to admin system fields
        const urgencyToPriority = {
            'flexible': 'low',
            'month': 'low',
            'weeks': 'medium',
            'urgent': 'high',
            'emergency': 'emergency'
        };

        // Parse address into components for Google Sheets compatibility
        const addressParts = this.parseAddress(submission.address || '');

        return {
            id: submission.id || this.generateId(),
            firstName: submission.firstName || '',
            lastName: submission.lastName || '',
            phone: submission.phone || '',
            email: submission.email || '',
            address: submission.address || '',
            city: addressParts.city,
            state: addressParts.state,
            zip: addressParts.zip,
            serviceType: submission.serviceType || '',
            priority: urgencyToPriority[submission.urgency] || 'medium',
            status: 'initial',
            notes: submission.description || this.buildNotesFromSubmission(submission),
            budget: submission.budget || '',
            preferredDate: submission.preferredDate || '',
            referralSource: submission.heardAbout || '',
            createdAt: submission.timestamp || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            meetingDate: '', // Will be scheduled later
            // Legacy fields for backward compatibility
            productDetails: submission.description || '',
            // Add QR code source indicator
            source: 'QR Code Form'
        };
    }

    parseAddress(addressString) {
        // Try to parse city, state, zip from address string
        // Handles formats like: "123 Main St, Springfield, IL 62701"
        const parts = {
            city: '',
            state: '',
            zip: ''
        };
        
        if (!addressString) return parts;
        
        // Look for zip code (5 digits, optionally followed by dash and 4 more digits)
        const zipMatch = addressString.match(/\b(\d{5}(?:-\d{4})?)\b/);
        if (zipMatch) {
            parts.zip = zipMatch[1];
        }
        
        // Look for state (2 letter abbreviation before zip, or at end)
        const stateMatch = addressString.match(/\b([A-Z]{2})\b(?:\s+\d{5}|\s*$)/);
        if (stateMatch) {
            parts.state = stateMatch[1];
        }
        
        // Extract city (word before state, after last comma)
        const cityStateZipPattern = /,\s*([^,]+?)\s*,?\s*[A-Z]{2}/;
        const cityMatch = addressString.match(cityStateZipPattern);
        if (cityMatch) {
            parts.city = cityMatch[1].trim();
        } else {
            // Fallback: try to extract city from last comma-separated part
            const commaParts = addressString.split(',');
            if (commaParts.length >= 2) {
                const lastPart = commaParts[commaParts.length - 1].trim();
                const secondLastPart = commaParts[commaParts.length - 2].trim();
                
                // If last part has state/zip, city is in second to last part
                if (lastPart.match(/[A-Z]{2}|\d{5}/)) {
                    parts.city = secondLastPart;
                }
            }
        }
        
        return parts;
    }

    buildNotesFromSubmission(submission) {
        let notes = [];
        
        if (submission.urgency) {
            notes.push(`Urgency: ${this.getUrgencyLabel(submission.urgency)}`);
        }
        
        if (submission.contactPreference && submission.contactPreference !== 'any') {
            notes.push(`Prefers contact by: ${this.getContactPreferenceLabel(submission.contactPreference)}`);
        }
        
        if (submission.contactTime && submission.contactTime !== 'anytime') {
            notes.push(`Best contact time: ${this.getContactTimeLabel(submission.contactTime)}`);
        }
        
        if (submission.additionalNotes) {
            notes.push(`Additional notes: ${submission.additionalNotes}`);
        }
        
        notes.push('Source: QR Code Submission');
        
        return notes.join(' | ');
    }

    getUrgencyLabel(value) {
        const labels = {
            'flexible': 'Flexible with timing',
            'month': 'Within the next month',
            'weeks': 'Within 2-3 weeks',
            'urgent': 'As soon as possible',
            'emergency': 'Emergency'
        };
        return labels[value] || value || '';
    }

    getContactPreferenceLabel(value) {
        const labels = {
            'phone': 'Phone Call',
            'text': 'Text Message',
            'email': 'Email',
            'any': 'Any method is fine'
        };
        return labels[value] || value || '';
    }

    getContactTimeLabel(value) {
        const labels = {
            'anytime': 'Anytime',
            'morning': 'Morning (8am-12pm)',
            'afternoon': 'Afternoon (12pm-5pm)',
            'evening': 'Evening (5pm-8pm)',
            'weekends': 'Weekends only'
        };
        return labels[value] || value || '';
    }

    convertToCSV(data) {
        const headers = [
            'First Name', 'Last Name', 'Phone', 'Email', 'Address',
            'Service Type', 'Priority', 'Status', 'Product Details',
            'Budget', 'Preferred Date', 'Meeting Date', 'Notes',
            'Referral Source', 'Created Date', 'Updated Date'
        ];

        const csvRows = [headers.join(',')];

        data.forEach(customer => {
            const row = [
                customer.firstName || '',
                customer.lastName || '',
                customer.phone || '',
                customer.email || '',
                customer.address || '',
                this.getServiceTypeLabel(customer.serviceType),
                customer.priority || '',
                this.getStatusLabel(customer.status),
                customer.productDetails || '',
                this.getBudgetLabel(customer.budget),
                customer.preferredDate || '',
                customer.meetingDate || '',
                customer.notes || '',
                this.getReferralLabel(customer.referralSource),
                new Date(customer.createdAt).toLocaleString(),
                new Date(customer.updatedAt).toLocaleString()
            ].map(field => `"${String(field).replace(/"/g, '""')}"`);
            
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getServiceTypeLabel(value) {
        const labels = {
            'new-doors': 'New Doors',
            'new-windows': 'New Windows',
            'door-replacement': 'Door Replacement',
            'window-replacement': 'Window Replacement',
            'door-parts': 'Door Parts',
            'window-parts': 'Window Parts',
            'repair': 'Repair Services',
            'consultation': 'Consultation'
        };
        return labels[value] || value || 'Not specified';
    }

    // Format customer notes for better readability
    formatCustomerNotes(notes) {
        if (!notes || notes.trim() === '') return '';
        
        // Split on common separators and clean up
        let formattedNotes = notes
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        
        // Check if notes contain structured data from customer form
        if (formattedNotes.includes('Urgency:') || formattedNotes.includes('Contact Preference:')) {
            // Format structured notes with line breaks
            formattedNotes = formattedNotes
                .replace(/Urgency:/g, '<br>Urgency:')
                .replace(/Contact Preference:/g, '<br>Contact Preference:')
                .replace(/Best Contact Time:/g, '<br>Best Contact Time:')
                .replace(/How they heard about us:/g, '<br>How they heard about us:')
                .replace(/Additional Notes:/g, '<br>Additional Notes:')
                .replace(/Source:/g, '<br>Source:')
                .replace(/Form Submitted:/g, '<br>Form Submitted:')
                .replace(/Submitted:/g, '<br>Submitted:')
                .replace(/^\s*<br>/, ''); // Remove leading line break
        }
        
        return formattedNotes;
    }

    getStatusLabel(value) {
        const labels = {
            'initial': 'Initial Contact',
            'quoted': 'Quote Provided',
            'scheduled': 'Work Scheduled',
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'follow-up': 'Follow-up Needed'
        };
        return labels[value] || value || 'Initial Contact';
    }

    getBudgetLabel(value) {
        const labels = {
            'under-500': 'Under $500',
            '500-1000': '$500 - $1,000',
            '1000-2500': '$1,000 - $2,500',
            '2500-5000': '$2,500 - $5,000',
            '5000-10000': '$5,000 - $10,000',
            'over-10000': 'Over $10,000'
        };
        return labels[value] || 'Not specified';
    }

    getReferralLabel(value) {
        const labels = {
            'google': 'Google Search',
            'referral': 'Customer Referral',
            'facebook': 'Facebook',
            'yellowpages': 'Yellow Pages',
            'flyer': 'Flyer/Advertisement',
            'repeat': 'Repeat Customer',
            'other': 'Other'
        };
        return labels[value] || 'Not specified';
    }

    // Google Sheets Integration
    async syncFromGoogleSheets() {
        this.showNotification('Syncing data from Google Sheets...', 'info');
        
        try {
            // Use JSONP to bypass CORS restrictions
            const data = await this.fetchGoogleSheetsDataViaJSONP();
            
            if (!data) {
                throw new Error('No data received from Google Sheets');
            }
            
            if (data && data.status === 'success' && data.data && Array.isArray(data.data)) {
                let importedCount = 0;
                let updatedCount = 0;
                let skippedCount = 0;

                data.data.forEach(sheetRow => {
                    if (!sheetRow.firstName || !sheetRow.phone) {
                        skippedCount++;
                        return;
                    }

                    // Check if customer already exists by ID first, then by phone number
                    let existingCustomerIndex = this.customers.findIndex(c => c.id === sheetRow.id);
                    if (existingCustomerIndex === -1) {
                        existingCustomerIndex = this.customers.findIndex(c => c.phone === sheetRow.phone);
                    }
                    
                    const customerData = this.convertSheetRowToCustomer(sheetRow);

                    if (existingCustomerIndex !== -1) {
                        // Update existing customer if the sheet data is newer
                        const existingCustomer = this.customers[existingCustomerIndex];
                        const sheetDate = new Date(sheetRow.timestamp || sheetRow.createdAt || 0);
                        const existingDate = new Date(existingCustomer.updatedAt || existingCustomer.createdAt || 0);
                        
                        if (sheetDate > existingDate) {
                            // Use the Google Sheets ID to ensure consistency
                            this.customers[existingCustomerIndex] = { ...existingCustomer, ...customerData, id: customerData.id };
                            updatedCount++;
                        } else {
                            skippedCount++;
                        }
                    } else {
                        // Add new customer
                        this.customers.push(customerData);
                        importedCount++;
                    }
                });

                if (importedCount > 0 || updatedCount > 0) {
                    this.saveCustomers();
                    this.renderCustomers(); 
                    this.updateStats();
                    
                    let message = [];
                    if (importedCount > 0) message.push(`${importedCount} new leads imported`);
                    if (updatedCount > 0) message.push(`${updatedCount} leads updated`);
                    if (skippedCount > 0) message.push(`${skippedCount} duplicates/older records skipped`);
                    
                    this.showNotification(`Google Sheets sync complete! ${message.join(', ')}.`, 'success');
                } else {
                    this.showNotification('No new data found in Google Sheets.', 'info');
                }
            } else {
                throw new Error('Invalid response format from Google Sheets');
            }

        } catch (error) {
            // Check if it's a CORS/localhost issue
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' || 
                               window.location.hostname === '';
            
            let message = 'Google Sheets automatic sync is not available.';
            if (isLocalhost) {
                console.info('Google Sheets sync disabled for local development - this is expected behavior.');
                message += ' When running locally, please use the CSV import feature below to import your Google Sheets data.';
            } else {
                console.error('Google Sheets sync error:', error);
                message += '\n\nTroubleshooting steps:\n1. Verify the Google Apps Script is deployed as a web app\n2. Ensure "Execute as: Me" and "Who has access: Anyone"\n3. Test the script URL directly in a browser\n4. Check script permissions and sharing settings\n\nAlternative: Use the CSV import feature below.';
            }
            
            this.showNotification(message, 'warning');
            this.showCSVImportOption();
            
            // Test URL accessibility for debugging
            this.testGoogleSheetsURL();
        }
    }

    // Sync new customer TO Google Sheets
    async syncToGoogleSheets(customerData) {
        try {
            // Don't sync if running locally
            if (window.location.protocol === 'file:') {
                console.info('Google Sheets sync disabled for local development');
                return;
            }

            console.log('Syncing new customer to Google Sheets:', customerData);
            
            // Use JSONP to send data to Google Apps Script
            const result = await this.sendCustomerToGoogleSheets(customerData);
            
            if (result.success) {
                this.showNotification('Customer synced to Google Sheets!', 'success');
            } else if (result.duplicate) {
                console.info('Customer already exists in Google Sheets');
                this.showNotification('Customer saved locally. Already exists in Google Sheets.', 'info');
            } else {
                console.warn('Failed to sync customer to Google Sheets');
                this.showNotification('Customer saved locally. Google Sheets sync failed.', 'warning');
            }
        } catch (error) {
            console.error('Error syncing to Google Sheets:', error);
            this.showNotification('Customer saved locally. Google Sheets sync failed.', 'warning');
        }
    }

    // Update existing customer in Google Sheets
    async updateCustomerInGoogleSheets(customerData) {
        try {
            // Don't sync if running locally
            if (window.location.protocol === 'file:') {
                console.info('Google Sheets update disabled for local development');
                return;
            }

            console.log('Updating customer in Google Sheets:', customerData);
            
            // Use form submission to send update to Google Apps Script
            const result = await this.sendCustomerUpdateToGoogleSheets(customerData);
            
            if (result.success) {
                this.showNotification('Customer updated in Google Sheets!', 'success');
            } else {
                console.warn('Failed to update customer in Google Sheets');
                this.showNotification('Customer updated locally. Google Sheets update failed.', 'warning');
            }
        } catch (error) {
            console.error('Error updating customer in Google Sheets:', error);
            this.showNotification('Customer updated locally. Google Sheets update failed.', 'warning');
        }
    }

    sendCustomerToGoogleSheets(customerData) {
        return new Promise((resolve, reject) => {
            const callbackName = 'googleSheetsAddCallback_' + Date.now();
            
            // Create global callback
            window[callbackName] = (response) => {
                console.log('Google Sheets add response:', response);
                cleanup();
                
                if (response && response.status === 'success') {
                    resolve({ success: true, duplicate: false });
                } else if (response && response.status === 'duplicate') {
                    resolve({ success: false, duplicate: true });
                } else {
                    resolve({ success: false, duplicate: false });
                }
            };
            
            const cleanup = () => {
                delete window[callbackName];
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
            
            // Create script element for JSONP
            const script = document.createElement('script');
            
            // Prepare customer data as URL parameters
            const params = new URLSearchParams({
                action: 'addCustomer',
                callback: callbackName,
                id: customerData.id,
                firstName: customerData.firstName || '',
                lastName: customerData.lastName || '',
                phone: customerData.phone || '',
                email: customerData.email || '',
                address: customerData.address || '',
                city: customerData.city || '',
                state: customerData.state || '',
                zip: customerData.zip || '',
                serviceType: customerData.serviceType || customerData.service || '',
                status: customerData.status || '',
                priority: customerData.priority || '',
                notes: customerData.notes || '',
                dateAdded: customerData.dateAdded || new Date().toISOString(),
                budget: customerData.budget || '',
                preferredDate: customerData.preferredDate || '',
                productDetails: customerData.productDetails || ''
            });
            
            script.src = `https://script.google.com/macros/s/AKfycbxk1iwNaSb0Wlu5f5qFJlXT0OeiQgoe6lzerkpJaHkjF9VDUqgabz2ZZny4B2pAUjvxUg/exec?${params.toString()}`;
            
            script.onerror = () => {
                console.error('Failed to load Google Apps Script for adding customer');
                cleanup();
                resolve({ success: false, duplicate: false });
            };
            
            // Set timeout for request
            setTimeout(() => {
                console.warn('Google Sheets add request timed out');
                cleanup();
                resolve({ success: false, duplicate: false });
            }, 10000); // 10 second timeout
            
            document.head.appendChild(script);
        });
    }

    // Send customer update to Google Sheets via JSONP
    sendCustomerUpdateToGoogleSheets(customerData) {
        return new Promise((resolve, reject) => {
            const callbackName = 'googleSheetsUpdateCallback_' + Date.now();
            
            // Create global callback
            window[callbackName] = (response) => {
                console.log('Google Sheets update response:', response);
                cleanup();
                
                if (response && response.status === 'success') {
                    resolve({ success: true });
                } else {
                    resolve({ success: false });
                }
            };
            
            const cleanup = () => {
                delete window[callbackName];
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
            
            // Create script element for JSONP
            const script = document.createElement('script');
            
            // Prepare customer data as URL parameters
            const params = new URLSearchParams({
                action: 'updateCustomer',
                callback: callbackName,
                id: customerData.id,
                firstName: customerData.firstName || '',
                lastName: customerData.lastName || '',
                phone: customerData.phone || '',
                email: customerData.email || '',
                address: customerData.address || '',
                city: customerData.city || '',
                state: customerData.state || '',
                zip: customerData.zip || '',
                serviceType: customerData.serviceType || customerData.service || '',
                status: customerData.status || '',
                priority: customerData.priority || '',
                notes: customerData.notes || '',
                dateAdded: customerData.dateAdded || new Date().toISOString(),
                budget: customerData.budget || '',
                preferredDate: customerData.preferredDate || '',
                productDetails: customerData.productDetails || ''
            });
            
            script.src = `https://script.google.com/macros/s/AKfycbxk1iwNaSb0Wlu5f5qFJlXT0OeiQgoe6lzerkpJaHkjF9VDUqgabz2ZZny4B2pAUjvxUg/exec?${params.toString()}`;
            
            script.onerror = () => {
                console.error('Failed to load Google Apps Script for updating customer');
                cleanup();
                resolve({ success: false });
            };
            
            // Set timeout for request
            setTimeout(() => {
                console.warn('Google Sheets update request timed out');
                cleanup();
                resolve({ success: false });
            }, 10000); // 10 second timeout
            
            document.head.appendChild(script);
        });
    }

    // Push all local customers TO Google Sheets
    async pushAllToGoogleSheets() {
        if (this.customers.length === 0) {
            this.showNotification('No customers to push to Google Sheets.', 'info');
            return;
        }

        this.showNotification(`Pushing ${this.customers.length} customers to Google Sheets...`, 'info');
        
        let successCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        for (const customer of this.customers) {
            try {
                const result = await this.sendCustomerToGoogleSheets(customer);
                if (result.success) {
                    successCount++;
                } else if (result.duplicate) {
                    duplicateCount++;
                } else {
                    errorCount++;
                }
                
                // Small delay between requests to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error('Error pushing customer:', customer.id, error);
                errorCount++;
            }
        }

        // Show detailed results
        const total = this.customers.length;
        let message = '';
        
        if (successCount > 0) {
            message += `✅ Added ${successCount} new customers`;
        }
        if (duplicateCount > 0) {
            message += (message ? ', ' : '') + `📋 ${duplicateCount} already existed`;
        }
        if (errorCount > 0) {
            message += (message ? ', ' : '') + `❌ ${errorCount} failed`;
        }
        
        if (successCount === total) {
            this.showNotification(`${message} to Google Sheets!`, 'success');
        } else if (successCount > 0 || duplicateCount === total) {
            this.showNotification(`${message}. Push complete!`, 'info');
        } else {
            this.showNotification(`${message}. Check your connection.`, 'error');
        }
    }

    convertSheetRowToCustomer(sheetRow) {
        // Handle priority: if it's numeric (1-5), convert to text; if it's urgency text, map it; otherwise use existing priority text
        let priority = 'medium'; // default
        if (sheetRow.priority) {
            // If priority is numeric (1-5), convert to text
            if (!isNaN(sheetRow.priority)) {
                priority = this.mapNumericPriorityToText(sheetRow.priority);
            } else {
                // If priority is already text, use it directly
                priority = sheetRow.priority.toLowerCase();
            }
        } else if (sheetRow.urgency) {
            // Fallback: convert urgency to priority
            priority = this.mapUrgencyToPriority(sheetRow.urgency);
        }

        return {
            id: sheetRow.id || this.generateId(), // Use existing Google Sheets ID if available
            firstName: sheetRow.firstName || '',
            lastName: sheetRow.lastName || '', 
            phone: sheetRow.phone || '',
            email: sheetRow.email || '',
            address: this.combineAddress(sheetRow),
            serviceType: sheetRow.serviceType || '',
            priority: priority,
            status: this.mapStatusToSystemStatus(sheetRow.status),
            productDetails: sheetRow.productDetails || '', // Use the properly separated productDetails field
            budget: sheetRow.budget || '', 
            preferredDate: sheetRow.preferredDate || '',
            meetingDate: sheetRow.meetingDate || '',
            notes: sheetRow.notes || '', // Use the cleaned notes field (without description)
            referralSource: sheetRow.heardAbout || sheetRow.referralSource || '',
            createdAt: sheetRow.timestamp || sheetRow.dateAdded || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: 'Google Sheets Import'
        };
    }

    combineAddress(sheetRow) {
        // Combine address components from Google Sheets into a single address string
        let addressParts = [];
        
        if (sheetRow.address) addressParts.push(sheetRow.address);
        if (sheetRow.city) addressParts.push(sheetRow.city);
        if (sheetRow.state) addressParts.push(sheetRow.state);
        if (sheetRow.zip) addressParts.push(sheetRow.zip);
        
        return addressParts.join(', ') || '';
    }

    mapStatusToSystemStatus(status) {
        if (!status) return 'initial';
        
        // Convert status to lowercase for comparison
        const statusLower = status.toLowerCase();
        
        // Map various status values to system standards
        const statusMap = {
            'new lead': 'initial',
            'initial contact': 'initial',
            'initial': 'initial',
            'quote provided': 'quoted',
            'quoted': 'quoted',
            'work scheduled': 'scheduled',
            'scheduled': 'scheduled',
            'in progress': 'in-progress',
            'in-progress': 'in-progress',
            'completed': 'completed',
            'follow-up needed': 'follow-up',
            'follow-up': 'follow-up'
        };
        
        return statusMap[statusLower] || 'initial';
    }

    mapUrgencyToPriority(urgency) {
        const urgencyMap = {
            'flexible': 'low',
            'month': 'low', 
            'weeks': 'medium',
            'urgent': 'high',
            'emergency': 'emergency'
        };
        return urgencyMap[urgency] || 'medium';
    }

    // Convert numeric priority (1-5) back to text labels
    mapNumericPriorityToText(numericPriority) {
        const priorityMap = {
            '1': 'low',
            '2': 'low', 
            '3': 'medium',
            '4': 'high',
            '5': 'emergency',
            1: 'low',
            2: 'low', 
            3: 'medium',
            4: 'high',
            5: 'emergency'
        };
        return priorityMap[numericPriority] || 'medium';
    }

    // Parse priority from CSV/Google Sheets row - handles both numeric and text priorities
    parsePriorityFromRow(row) {
        const priorityValue = row['priority'] || row['Priority'] || row['urgency'] || row['Urgency'];
        
        if (!priorityValue) {
            return 'medium'; // default
        }
        
        // If it's numeric (1-5), convert to text
        if (!isNaN(priorityValue)) {
            return this.mapNumericPriorityToText(priorityValue);
        }
        
        // If it's urgency text, map it to priority
        if (['flexible', 'month', 'weeks', 'urgent', 'emergency'].includes(priorityValue.toLowerCase())) {
            return this.mapUrgencyToPriority(priorityValue);
        }
        
        // If it's already priority text, use it (ensure lowercase)
        return priorityValue.toLowerCase();
    }

    // Test Data Generation
    generateTestCustomer() {
        const testCustomer = {
            id: this.generateId(),
            firstName: this.getRandomFirstName(),
            lastName: this.getRandomLastName(),
            phone: this.getRandomPhoneNumber(),
            email: this.getRandomEmail(),
            address: this.getRandomAddress(),
            serviceType: this.getRandomServiceType(),
            priority: this.getRandomPriority(),
            status: this.getRandomStatus(),
            productDetails: this.getRandomProductDetails(),
            budget: this.getRandomBudget(),
            preferredDate: this.getRandomPreferredDate(),
            notes: this.getRandomNotes(),
            referralSource: this.getRandomReferralSource(),
            createdAt: this.getRandomCreatedDate(),
            updatedAt: new Date().toISOString(),
            meetingDate: this.getRandomMeetingDate(),
            source: 'Test Data'
        };

        this.customers.push(testCustomer);
        this.saveCustomers();
        this.renderCustomers();
        this.updateStats();
        
        this.showNotification(
            `Test customer "${testCustomer.firstName} ${testCustomer.lastName}" generated successfully!`,
            'success'
        );
    }

    getRandomFirstName() {
        const names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Ashley', 'William', 'Jessica', 'Richard', 'Amanda', 'Thomas', 'Jennifer', 'Christopher', 'Melissa', 'Daniel', 'Michelle', 'Matthew', 'Kimberly', 'Anthony', 'Donna', 'Mark', 'Nancy', 'Donald', 'Carol', 'Steven', 'Sandra'];
        return names[Math.floor(Math.random() * names.length)];
    }

    getRandomLastName() {
        const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
        return names[Math.floor(Math.random() * names.length)];
    }

    getRandomPhoneNumber() {
        const areaCodes = ['615', '629', '931', '423', '865', '731', '901', '256', '205', '334'];
        const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
        const exchange = Math.floor(Math.random() * 900) + 100;
        const number = Math.floor(Math.random() * 9000) + 1000;
        return `(${areaCode}) ${exchange}-${number}`;
    }

    getRandomEmail() {
        const firstNames = ['john', 'jane', 'mike', 'sarah', 'david', 'lisa', 'bob', 'emily', 'tom', 'anna'];
        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const number = Math.floor(Math.random() * 999) + 1;
        return `${firstName}${number}@${domain}`;
    }

    getRandomAddress() {
        const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Park Ave', 'First St', 'Second St', 'Church St', 'Mill Rd', 'Hill St', 'Valley Dr', 'Ridge Rd', 'River St'];
        const cities = ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson', 'Johnson City', 'Bartlett', 'Hendersonville', 'Kingsport', 'Collierville', 'Cleveland', 'Smyrna'];
        
        const houseNumber = Math.floor(Math.random() * 9999) + 1;
        const street = streets[Math.floor(Math.random() * streets.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const zip = Math.floor(Math.random() * 90000) + 10000;
        
        return `${houseNumber} ${street}, ${city}, TN ${zip}`;
    }

    getRandomServiceType() {
        const services = ['new-doors', 'new-windows', 'door-replacement', 'window-replacement', 'door-parts', 'window-parts', 'repair', 'consultation'];
        return services[Math.floor(Math.random() * services.length)];
    }

    getRandomPriority() {
        const priorities = ['low', 'medium', 'high', 'emergency'];
        const weights = [30, 50, 15, 5]; // More medium/low priority customers
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < priorities.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return priorities[i];
            }
        }
        return 'medium';
    }

    getRandomStatus() {
        const statuses = ['initial', 'quoted', 'scheduled', 'in-progress', 'completed', 'follow-up'];
        const weights = [40, 25, 15, 10, 8, 2]; // More new leads
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < statuses.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return statuses[i];
            }
        }
        return 'initial';
    }

    getRandomProductDetails() {
        const details = [
            'Standard front door replacement',
            'Bay window installation - living room',
            'Sliding patio door repair',
            'Kitchen window replacement (2 windows)',
            'Entry door with sidelights',
            'Basement window replacement',
            'French doors to backyard',
            'Storm door installation',
            'Window trim repair',
            'Custom wood door refinishing',
            'Double-hung windows (4 total)',
            'Garage door weather stripping',
            'Master bedroom window upgrade',
            'Bathroom window privacy glass',
            'Screen door replacement'
        ];
        return details[Math.floor(Math.random() * details.length)];
    }

    getRandomBudget() {
        const budgets = ['under-500', '500-1000', '1000-2500', '2500-5000', '5000-10000', 'over-10000'];
        const weights = [10, 20, 30, 25, 10, 5];
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < budgets.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return budgets[i];
            }
        }
        return '1000-2500';
    }

    getRandomPreferredDate() {
        if (Math.random() < 0.3) return ''; // 30% have no preferred date
        
        const today = new Date();
        const futureDate = new Date(today.getTime() + (Math.random() * 90 * 24 * 60 * 60 * 1000)); // Random date within 90 days
        return futureDate.toISOString().split('T')[0];
    }

    getRandomNotes() {
        const notes = [
            'Customer prefers morning appointments',
            'Has a dog - please call before arriving',
            'Interested in energy-efficient options',
            'Previous work done by another company',
            'Needs quote for insurance claim',
            'Wants to match existing style',
            'Budget is flexible for quality work',
            'Referred by neighbor who was very satisfied',
            'Looking for quick turnaround',
            'Prefers local/family business',
            'Wants environmentally friendly materials',
            'Has specific brand preferences',
            '',
            '',
            '' // Some customers have no notes
        ];
        return notes[Math.floor(Math.random() * notes.length)];
    }

    getRandomReferralSource() {
        const sources = ['google', 'facebook', 'referral', 'yellowpages', 'flyer', 'repeat', 'other'];
        const weights = [35, 20, 25, 5, 5, 8, 2];
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < sources.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return sources[i];
            }
        }
        return 'google';
    }

    getRandomCreatedDate() {
        const today = new Date();
        const pastDate = new Date(today.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000)); // Random date within last 30 days
        return pastDate.toISOString();
    }

    getRandomMeetingDate() {
        if (Math.random() < 0.7) return ''; // 70% have no meeting scheduled
        
        const today = new Date();
        const futureDate = new Date(today.getTime() + (Math.random() * 14 * 24 * 60 * 60 * 1000)); // Random date within 14 days
        return futureDate.toISOString();
    }

    // JSONP method to bypass CORS
    fetchGoogleSheetsDataViaJSONP() {
        return new Promise((resolve, reject) => {
            // Check if running locally
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' || 
                               window.location.hostname === '';
            
            if (isLocalhost) {
                reject(new Error('Google Sheets sync is not available when running locally due to CORS restrictions. Please use the CSV import feature instead.'));
                return;
            }
            
            // Create a unique callback name
            const callbackName = 'googleSheetsCallback_' + Date.now();
            
            console.log('Attempting to load Google Sheets data via JSONP...');
            console.log('Callback name:', callbackName);
            
            // Create script tag for JSONP
            const script = document.createElement('script');
            script.src = `https://script.google.com/macros/s/AKfycbxk1iwNaSb0Wlu5f5qFJlXT0OeiQgoe6lzerkpJaHkjF9VDUqgabz2ZZny4B2pAUjvxUg/exec?action=getData&callback=${callbackName}`;
            
            // Set up callback function
            window[callbackName] = (data) => {
                console.log('Google Sheets callback received:', data);
                
                // Clean up
                document.head.removeChild(script);
                delete window[callbackName];
                
                if (data && data.status === 'success') {
                    console.log('Google Sheets data loaded successfully:', data.data?.length, 'customers');
                    resolve(data);
                } else {
                    console.error('Invalid Google Sheets response:', data);
                    reject(new Error(`Invalid response from Google Sheets: ${data?.message || 'Unknown error'}`));
                }
            };
            
            // Set up timeout (30 seconds)
            const timeout = setTimeout(() => {
                console.warn('Google Sheets request timed out');
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error('Google Sheets request timed out. The script may be slow to respond or unavailable.'));
            }, 30000);
            
            // Handle script loading errors
            script.onerror = (event) => {
                console.error('Script loading error:', event);
                clearTimeout(timeout);
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error('Google Sheets sync is currently unavailable. This may be due to:\n• Script not deployed or permissions changed\n• Network connectivity issues\n• Service temporarily down\n\nPlease use the CSV import/export feature as an alternative.'));
            };
            
            // Update callback to clear timeout
            const originalCallback = window[callbackName];
            window[callbackName] = (data) => {
                clearTimeout(timeout);
                if (originalCallback) originalCallback(data);
            };
            
            console.log('Loading script:', script.src);
            
            // First, let's test with a simple test action
            const testCallbackName = 'testCallback_' + Date.now();
            const testScript = document.createElement('script');
            testScript.src = `https://script.google.com/macros/s/AKfycbxk1iwNaSb0Wlu5f5qFJlXT0OeiQgoe6lzerkpJaHkjF9VDUqgabz2ZZny4B2pAUjvxUg/exec?action=test&callback=${testCallbackName}`;
            
            window[testCallbackName] = (testData) => {
                console.log('Google Apps Script test response:', testData);
                document.head.removeChild(testScript);
                delete window[testCallbackName];
                
                // Now load the actual data
                document.head.appendChild(script);
            };
            
            testScript.onerror = () => {
                console.error('Google Apps Script test failed - proceeding with main request anyway');
                document.head.removeChild(testScript);
                delete window[testCallbackName];
                document.head.appendChild(script);
            };
            
            console.log('Testing Google Apps Script first...');
            document.head.appendChild(testScript);
            
            // Set timeout
            setTimeout(() => {
                if (window[callbackName]) {
                    document.head.removeChild(script);
                    delete window[callbackName];
                    reject(new Error('Google Sheets request timed out'));
                }
            }, 15000); // 15 second timeout
        });
    }

    // Alternative method using iframe for CORS-free requests
    async fetchGoogleSheetsDataViaIframe() {
        return new Promise((resolve, reject) => {
            // Create hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = `https://script.google.com/macros/s/AKfycbxk1iwNaSb0Wlu5f5qFJlXT0OeiQgoe6lzerkpJaHkjF9VDUqgabz2ZZny4B2pAUjvxUg/exec?action=getData&format=html`;
            
            let timeoutId;
            
            iframe.onload = () => {
                try {
                    // Try to access iframe content (will work if same-origin or properly configured)
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const content = iframeDoc.body.textContent || iframeDoc.body.innerText;
                    
                    if (content) {
                        const data = JSON.parse(content);
                        resolve(data);
                    } else {
                        reject(new Error('No data found in response'));
                    }
                } catch (error) {
                    console.warn('Iframe method failed:', error);
                    reject(error);
                } finally {
                    clearTimeout(timeoutId);
                    document.body.removeChild(iframe);
                }
            };
            
            iframe.onerror = () => {
                clearTimeout(timeoutId);
                document.body.removeChild(iframe);
                reject(new Error('Failed to load Google Sheets data via iframe'));
            };
            
            // Set timeout
            timeoutId = setTimeout(() => {
                document.body.removeChild(iframe);
                reject(new Error('Request timed out'));
            }, 10000);
            
            document.body.appendChild(iframe);
        });
    }

    // Fallback CSV import method
    async syncViaManualCSVImport() {
        // Show the CSV import option directly
        this.showCSVImportOption();
        return Promise.resolve(); // Don't throw error, just show the option
    }

    // Test Google Apps Script URL accessibility
    async testGoogleSheetsURL() {
        const testUrl = 'https://script.google.com/macros/s/AKfycbxk1iwNaSb0Wlu5f5qFJlXT0OeiQgoe6lzerkpJaHkjF9VDUqgabz2ZZny4B2pAUjvxUg/exec?action=test';
        
        try {
            console.log('Testing Google Apps Script URL:', testUrl);
            const response = await fetch(testUrl, { mode: 'no-cors' });
            console.log('Test response received (no-cors mode)');
            return true;
        } catch (error) {
            console.error('URL test failed:', error);
            return false;
        }
    }

    showCSVImportOption() {
        // Create a temporary import option
        const importDiv = document.createElement('div');
        importDiv.innerHTML = `
            <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <h4 style="color: #2d3748; margin-bottom: 12px;">📊 Manual Import Option</h4>
                <p style="color: #4a5568; margin-bottom: 12px;">Since automatic sync failed, you can manually import your Google Sheets data:</p>
                <ol style="color: #4a5568; margin-bottom: 12px; padding-left: 20px;">
                    <li>Open your Google Sheet</li>
                    <li>Go to File → Download → Comma-separated values (.csv)</li>
                    <li>Use the file input below to upload the CSV</li>
                </ol>
                <input type="file" id="csvFileInput" accept=".csv" style="margin-bottom: 8px;">
                <button onclick="window.customerManager.importCSVFile()" style="background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Import CSV</button>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #e2e8f0; color: #4a5568; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 8px;">Cancel</button>
            </div>
        `;
        
        // Insert after the customer list controls
        const controlsSection = document.querySelector('.customer-controls');
        if (controlsSection) {
            controlsSection.insertAdjacentElement('afterend', importDiv);
        }
    }

    importCSVFile() {
        const fileInput = document.getElementById('csvFileInput');
        const file = fileInput?.files[0];
        
        if (!file) {
            this.showNotification('Please select a CSV file first', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvData = e.target.result;
                const rows = this.parseCSV(csvData);
                const customerData = this.convertCSVToCustomers(rows);
                
                if (customerData.length > 0) {
                    this.importCustomersFromCSV(customerData);
                    // Remove the import option div
                    document.querySelector('#csvFileInput').closest('div').remove();
                } else {
                    this.showNotification('No valid customer data found in CSV', 'warning');
                }
            } catch (error) {
                console.error('CSV import error:', error);
                this.showNotification('Failed to parse CSV file. Please check the format.', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                rows.push(row);
            }
        }
        
        return rows;
    }

    convertCSVToCustomers(rows) {
        return rows.map(row => {
            const address = row['address'] || row['Address'] || '';
            const addressParts = this.parseAddress(address);
            
            return {
                id: row['id'] || row['ID'] || this.generateId(), // Use existing ID if available
                firstName: row['firstName'] || row['First Name'] || '',
                lastName: row['lastName'] || row['Last Name'] || '',
                phone: row['phone'] || row['Phone'] || '',
                email: row['email'] || row['Email'] || '',
                address: address,
                city: row['city'] || row['City'] || addressParts.city,
                state: row['state'] || row['State'] || addressParts.state,
                zip: row['zip'] || row['Zip'] || addressParts.zip,
                serviceType: row['serviceType'] || row['Service Type'] || '',
                priority: this.parsePriorityFromRow(row),
                status: row['status'] || row['Status'] || 'initial',
                notes: row['notes'] || row['Notes'] || row['description'] || row['Description'] || row['additionalNotes'] || row['Additional Notes'] || '',
                budget: row['budget'] || row['Budget'] || '',
                preferredDate: row['preferredDate'] || row['Preferred Date'] || '',
                referralSource: row['heardAbout'] || row['Heard About'] || '',
                createdAt: row['timestamp'] || row['Timestamp'] || row['dateAdded'] || row['Date Added'] || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                meetingDate: row['meetingDate'] || row['Meeting Date'] || '',
                // Legacy fields for backward compatibility
                productDetails: row['description'] || row['Description'] || '',
                source: 'CSV Import'
            };
        }).filter(customer => customer.firstName && customer.phone); // Only valid entries
    }

    importCustomersFromCSV(customerData) {
        let importedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        customerData.forEach(newCustomer => {
            const existingIndex = this.customers.findIndex(c => c.phone === newCustomer.phone);
            
            if (existingIndex !== -1) {
                // Update existing customer
                this.customers[existingIndex] = { ...this.customers[existingIndex], ...newCustomer, id: this.customers[existingIndex].id };
                updatedCount++;
            } else {
                // Add new customer
                this.customers.push(newCustomer);
                importedCount++;
            }
        });

        if (importedCount > 0 || updatedCount > 0) {
            this.saveCustomers();
            this.renderCustomers();
            this.updateStats();
            
            let message = [];
            if (importedCount > 0) message.push(`${importedCount} new customers imported`);
            if (updatedCount > 0) message.push(`${updatedCount} customers updated`);
            
            this.showNotification(`CSV import complete! ${message.join(', ')}.`, 'success');
        } else {
            this.showNotification('No new customer data found in CSV.', 'info');
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: '#38a169',
            error: '#e53e3e',
            warning: '#d69e2e',
            info: '#3182ce'
        };
        return colors[type] || colors.info;
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);

// Initialize the application when the DOM is loaded AND admin content is visible
document.addEventListener('DOMContentLoaded', () => {
    // Check if admin content is visible, if not wait for it
    function initializeWhenReady() {
        const adminContent = document.getElementById('adminContent');
        if (adminContent && adminContent.style.display !== 'none') {
            console.log('Admin content is visible, initializing CustomerManager');
            window.customerManager = new CustomerManager();
        } else {
            console.log('Admin content not visible yet, waiting...');
            setTimeout(initializeWhenReady, 100);
        }
    }
    
    initializeWhenReady();
});

// Also provide a global function to initialize after password is entered
window.initializeCustomerManager = function() {
    if (!window.customerManager) {
        console.log('Initializing CustomerManager after password entry');
        window.customerManager = new CustomerManager();
    }
};