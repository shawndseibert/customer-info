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
        // Form submission
        document.getElementById('customerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Clear form
        document.getElementById('clearForm').addEventListener('click', () => {
            this.clearForm();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterCustomers();
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterCustomers();
        });

        // Export data
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        // Import QR code submissions
        document.getElementById('importSubmissions').addEventListener('click', () => {
            this.importCustomerSubmissions();
        });

        // Modal events
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('editCustomer').addEventListener('click', () => {
            this.editCustomer();
        });

        document.getElementById('deleteCustomer').addEventListener('click', () => {
            this.deleteCustomer();
        });

        // Close modal when clicking outside
        document.getElementById('customerModal').addEventListener('click', (e) => {
            if (e.target.id === 'customerModal') {
                this.closeModal();
            }
        });

        // Auto-save form data on input changes
        const formInputs = document.querySelectorAll('#customerForm input, #customerForm select, #customerForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.autoSaveFormData();
            });
        });

        // Load auto-saved data on page load
        this.loadAutoSavedData();
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
        this.renderCustomers();
        this.updateStats();
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
    }

    updateCustomer(id, customerData) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
            this.customers[index] = { ...this.customers[index], ...customerData };
            this.saveCustomers();
        }
    }

    deleteCustomer() {
        if (this.currentEditingId && confirm('Are you sure you want to delete this customer?')) {
            this.customers = this.customers.filter(c => c.id !== this.currentEditingId);
            this.saveCustomers();
            this.closeModal();
            this.renderCustomers();
            this.updateStats();
            this.showNotification('Customer deleted successfully', 'success');
        }
    }

    // Data Storage
    loadCustomers() {
        const stored = localStorage.getItem('customers');
        return stored ? JSON.parse(stored) : [];
    }

    saveCustomers() {
        localStorage.setItem('customers', JSON.stringify(this.customers));
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
    }

    createCustomerCard(customer) {
        const createdDate = new Date(customer.createdAt).toLocaleDateString();
        const priorityClass = `priority-${customer.priority || 'medium'}`;
        const statusClass = `status-${customer.status || 'initial'}`;
        
        return `
            <div class="customer-card" data-customer-id="${customer.id}">
                <div class="priority-badge ${priorityClass}">
                    ${(customer.priority || 'medium').toUpperCase()}
                </div>
                <div class="customer-card-header">
                    <div>
                        <div class="customer-name">${customer.firstName} ${customer.lastName}</div>
                        <div class="customer-phone">${customer.phone}</div>
                    </div>
                    <div class="customer-service">${this.getServiceTypeLabel(customer.serviceType)}</div>
                </div>
                <div class="customer-details">
                    <div><strong>Email:</strong> ${customer.email || 'Not provided'}</div>
                    <div><strong>Status:</strong> <span class="status-badge ${statusClass}">${this.getStatusLabel(customer.status)}</span></div>
                    <div><strong>Budget:</strong> ${this.getBudgetLabel(customer.budget)}</div>
                    <div><strong>Added:</strong> ${createdDate}</div>
                </div>
                ${customer.notes ? `<div class="customer-notes">"${customer.notes}"</div>` : ''}
                ${customer.meetingDate ? `<div class="customer-meeting"><strong>Next Meeting:</strong> ${new Date(customer.meetingDate).toLocaleString()}</div>` : ''}
            </div>
        `;
    }

    // Filtering and Search
    getFilteredCustomers() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        return this.customers.filter(customer => {
            const matchesSearch = !searchTerm || 
                customer.firstName.toLowerCase().includes(searchTerm) ||
                customer.lastName.toLowerCase().includes(searchTerm) ||
                customer.phone.includes(searchTerm) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
                (customer.notes && customer.notes.toLowerCase().includes(searchTerm)) ||
                this.getServiceTypeLabel(customer.serviceType).toLowerCase().includes(searchTerm);

            const matchesStatus = !statusFilter || customer.status === statusFilter;

            return matchesSearch && matchesStatus;
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
                        <span class="detail-value priority-badge priority-${customer.priority || 'medium'}">${(customer.priority || 'medium').toUpperCase()}</span>
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
                        <span class="detail-value">${customer.notes}</span>
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
            this.closeModal();
            document.getElementById('customerForm').scrollIntoView({ behavior: 'smooth' });
        }
    }

    closeModal() {
        document.getElementById('customerModal').style.display = 'none';
        this.currentEditingId = null;
    }

    // Form Management
    populateForm(customer) {
        const form = document.getElementById('customerForm');
        Object.keys(customer).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = customer[key] || '';
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

        document.getElementById('totalCustomers').textContent = totalCustomers;
        document.getElementById('activeProjects').textContent = activeProjects;
        document.getElementById('completedProjects').textContent = completedProjects;
        document.getElementById('followUpNeeded').textContent = followUpNeeded;
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

        return {
            id: submission.id || this.generateId(),
            firstName: submission.firstName || '',
            lastName: submission.lastName || '',
            phone: submission.phone || '',
            email: submission.email || '',
            address: submission.address || '',
            serviceType: submission.serviceType || '',
            priority: urgencyToPriority[submission.urgency] || 'medium',
            status: 'initial',
            productDetails: submission.description || '',
            budget: submission.budget || '',
            preferredDate: submission.preferredDate || '',
            notes: this.buildNotesFromSubmission(submission),
            referralSource: submission.heardAbout || '',
            createdAt: submission.timestamp || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            meetingDate: '', // Will be scheduled later
            // Add QR code source indicator
            source: 'QR Code Form'
        };
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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.customerManager = new CustomerManager();
});