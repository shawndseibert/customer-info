// Free Address Helper - No API Required
class AddressHelper {
    constructor() {
        this.init();
    }

    init() {
        this.bindLocationButton();
        this.addAddressFormatting();
    }

    bindLocationButton() {
        const locationBtn = document.getElementById('useMyLocation');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => {
                this.getUserLocation();
            });
        }
    }

    getUserLocation() {
        const locationBtn = document.getElementById('useMyLocation');
        
        if (!navigator.geolocation) {
            this.showLocationError('Geolocation is not supported by this browser.');
            return;
        }

        // Show loading state
        locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
        locationBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.handleLocationSuccess(position);
            },
            (error) => {
                this.handleLocationError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }

    async handleLocationSuccess(position) {
        const { latitude, longitude } = position.coords;
        
        try {
            // Use free reverse geocoding service
            const address = await this.reverseGeocode(latitude, longitude);
            const addressField = document.getElementById('address');
            
            if (address && addressField) {
                addressField.value = address;
                addressField.dispatchEvent(new Event('input')); // Trigger auto-save
                this.showLocationSuccess('Address auto-filled using your location!');
            } else {
                this.showLocationError('Could not determine address from your location. Please enter manually.');
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            this.showLocationError('Could not determine address from your location. Please enter manually.');
        }

        this.resetLocationButton();
    }

    async reverseGeocode(lat, lon) {
        try {
            // Using Nominatim (OpenStreetMap) - completely free, no API key required
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'Door-Window-Quote-Form/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding service unavailable');
            }

            const data = await response.json();
            
            if (data && data.display_name) {
                // Parse the address components for a cleaner format
                const address = data.address || {};
                
                let formattedAddress = '';
                if (address.house_number && address.road) {
                    formattedAddress += `${address.house_number} ${address.road}`;
                } else if (address.road) {
                    formattedAddress += address.road;
                }
                
                if (address.city || address.town || address.village) {
                    formattedAddress += `, ${address.city || address.town || address.village}`;
                }
                
                if (address.state) {
                    formattedAddress += `, ${address.state}`;
                }
                
                if (address.postcode) {
                    formattedAddress += ` ${address.postcode}`;
                }

                return formattedAddress || data.display_name;
            }

            return null;
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return null;
        }
    }

    handleLocationError(error) {
        let message = 'Unable to get your location. ';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message += 'Please allow location access and try again.';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Location information is unavailable.';
                break;
            case error.TIMEOUT:
                message += 'Location request timed out.';
                break;
            default:
                message += 'An unknown error occurred.';
                break;
        }

        this.showLocationError(message);
        this.resetLocationButton();
    }

    resetLocationButton() {
        const locationBtn = document.getElementById('useMyLocation');
        if (locationBtn) {
            locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use My Location';
            locationBtn.disabled = false;
        }
    }

    showLocationSuccess(message) {
        this.showLocationMessage(message, 'success');
    }

    showLocationError(message) {
        this.showLocationMessage(message, 'error');
    }

    showLocationMessage(message, type) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `location-notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : '#e53e3e'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            font-size: 0.9rem;
        `;

        document.body.appendChild(notification);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    addAddressFormatting() {
        const addressField = document.getElementById('address');
        if (addressField) {
            // Add helpful placeholder examples
            addressField.addEventListener('focus', () => {
                if (!addressField.value) {
                    addressField.placeholder = 'Example: 123 Main Street, Anytown, CA 12345';
                }
            });

            addressField.addEventListener('blur', () => {
                if (!addressField.value) {
                    addressField.placeholder = 'Enter your full street address, city, state, and ZIP code';
                }
            });
        }
    }
}

// Initialize the address helper
document.addEventListener('DOMContentLoaded', () => {
    new AddressHelper();
});

// Customer Quote Form Management
class CustomerQuoteForm {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
        this.loadFormProgress();
    }

    bindEvents() {
        // Form submission
        document.getElementById('customerQuoteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Auto-save form progress
        const formInputs = document.querySelectorAll('#customerQuoteForm input, #customerQuoteForm select, #customerQuoteForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveFormProgress();
            });
        });

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', (e) => {
            this.formatPhoneNumber(e.target);
        });

        // Real-time validation
        const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });
        });

        // Email validation
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', () => {
            this.validateEmail(emailInput);
        });

        // Service type change handler
        document.getElementById('serviceType').addEventListener('change', (e) => {
            this.handleServiceTypeChange(e.target.value);
        });
    }

    setupFormValidation() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('preferredDate').setAttribute('min', today);
    }

    // Form Progress Saving
    saveFormProgress() {
        const formData = this.getFormData();
        localStorage.setItem('customerQuoteProgress', JSON.stringify(formData));
    }

    loadFormProgress() {
        const savedData = localStorage.getItem('customerQuoteProgress');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.populateForm(data);
                this.showNotification('Your previous form data has been restored', 'info');
            } catch (e) {
                console.error('Error loading saved form data:', e);
            }
        }
    }

    clearFormProgress() {
        localStorage.removeItem('customerQuoteProgress');
    }

    // Form Data Handling
    getFormData() {
        const form = document.getElementById('customerQuoteForm');
        const formData = new FormData(form);
        const data = {
            timestamp: new Date().toISOString(),
            id: this.generateId()
        };

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    populateForm(data) {
        Object.keys(data).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field && data[key]) {
                field.value = data[key];
            }
        });
    }

    // Form Validation
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

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
        this.clearFieldError(emailField);
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
        
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Service Type Handling
    handleServiceTypeChange(serviceType) {
        // Add helpful hints based on service type
        const descriptionField = document.getElementById('description');
        const hints = {
            'new-doors': 'Please specify: front door, back door, interior doors, material preferences (wood, steel, fiberglass), security features needed.',
            'new-windows': 'Please specify: how many windows, which rooms, window types (double-hung, casement, sliding), material preferences (vinyl, wood, aluminum).',
            'door-replacement': 'Please describe: current door type, size, any issues with current door, style preferences for replacement.',
            'window-replacement': 'Please describe: how many windows need replacement, current window types, any issues (drafts, difficulty opening, broken seals).',
            'door-parts': 'Please specify: what parts are needed (locks, handles, hinges, weatherstripping), door type and size.',
            'window-parts': 'Please specify: what parts are needed (screens, locks, weatherstripping, glass), window type and size.',
            'repair': 'Please describe: what needs to be repaired, current issues, when the problem started.',
            'consultation': 'Please describe: what you\'re considering, your goals, and any specific questions you have.'
        };

        if (hints[serviceType]) {
            descriptionField.placeholder = hints[serviceType];
            this.showNotification('Helpful tip added to description field', 'info');
        }
    }

    // Form Submission
    async handleSubmit() {
        const submitBtn = document.querySelector('.submit-btn');
        
        // Validate all required fields
        const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
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
            this.showNotification('Please fix the errors above before submitting', 'error');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const formData = this.getFormData();
            
            // Save to customer submissions (local backup)
            this.saveCustomerSubmission(formData);
            
            // Send data to both Google Sheets and Email (parallel processing)
            const promises = [
                this.sendToGoogleSheets(formData),
                this.sendEmailNotification(formData)
            ];
            
            // Wait for both to complete (but don't fail if one fails)
            await Promise.allSettled(promises);
            
            // Show success message
            this.showSuccessMessage(formData);
            
            // Clear form progress
            this.clearFormProgress();
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showNotification('There was an error submitting your request. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    async sendToGoogleSheets(formData) {
        // Convert customer form data to match admin system format
        const customerData = this.convertToAdminFormat(formData);
        
        console.log('🔍 DEBUG: Original form data:', formData);
        console.log('🔍 DEBUG: Converted customer data:', customerData);
        
        // Use direct form submission method (most reliable for Google Apps Script)
        return this.sendToGoogleSheetsDirectForm(formData);
    }

    // Convert customer form data to admin system format
    convertToAdminFormat(formData) {
        // Parse address into components
        const addressParts = this.parseAddress(formData.address || '');
        
        // Convert urgency to priority (1-5 scale)
        const urgencyToPriority = {
            'emergency': 5,
            'urgent': 4,
            'weeks': 3,
            'month': 2,
            'flexible': 1
        };

        return {
            id: Date.now().toString(),
            firstName: formData.firstName || '',
            lastName: formData.lastName || '',
            phone: formData.phone || '',
            email: formData.email || '',
            address: addressParts.street,
            city: addressParts.city,
            state: addressParts.state,
            zip: addressParts.zip,
            serviceType: getServiceTypeLabel(formData.serviceType),
            status: 'New Lead',
            priority: urgencyToPriority[formData.urgency] || 1,
            notes: this.buildNotesFromForm(formData),
            dateAdded: new Date(formData.timestamp).toLocaleDateString(),
            budget: getBudgetLabel(formData.budget),
            preferredDate: formData.preferredDate || ''
        };
    }

    // Parse address string into components
    parseAddress(addressString) {
        if (!addressString) return { street: '', city: '', state: '', zip: '' };
        
        const parts = addressString.split(',').map(part => part.trim());
        
        if (parts.length >= 3) {
            const street = parts[0];
            const city = parts[1];
            const stateZipPart = parts[2];
            
            // Extract state and zip from "State ZIP" format
            const stateZipMatch = stateZipPart.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
            if (stateZipMatch) {
                return {
                    street: street,
                    city: city,
                    state: stateZipMatch[1],
                    zip: stateZipMatch[2]
                };
            }
        }
        
        // Fallback: return as single street address
        return {
            street: addressString,
            city: '',
            state: '',
            zip: ''
        };
    }

    // Build comprehensive notes from form data
    buildNotesFromForm(formData) {
        const notes = [];
        
        if (formData.description) {
            notes.push(`Description: ${formData.description}`);
        }
        
        if (formData.urgency) {
            notes.push(`Urgency: ${getUrgencyLabel(formData.urgency)}`);
        }
        
        if (formData.contactPreference) {
            notes.push(`Contact Preference: ${getContactPreferenceLabel(formData.contactPreference)}`);
        }
        
        if (formData.contactTime) {
            notes.push(`Best Contact Time: ${getContactTimeLabel(formData.contactTime)}`);
        }
        
        if (formData.heardAbout) {
            notes.push(`How they heard about us: ${getHeardAboutLabel(formData.heardAbout)}`);
        }
        
        if (formData.additionalNotes) {
            notes.push(`Additional Notes: ${formData.additionalNotes}`);
        }
        
        notes.push(`Source: QR Code Form`);
        notes.push(`Submitted: ${new Date(formData.timestamp).toLocaleString()}`);
        
        return notes.join('\n');
    }

    // Fallback method using direct form submission with corrected mapping
    async sendToGoogleSheetsDirectForm(formData) {
        const customerData = this.convertToAdminFormat(formData);
        
        console.log('🔄 DEBUG: Using direct form submission fallback');
        console.log('🔍 DEBUG: CustomerData for form submission:', customerData);
        
        try {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://script.google.com/macros/s/AKfycbxk1iwNaSb0Wlu5f5qFJlXT0OeiQgoe6lzerkpJaHkjF9VDUqgabz2ZZny4B2pAUjvxUg/exec';
            form.style.display = 'none';

            console.log('🔍 DEBUG: Form action URL:', form.action);

            // Add action parameter
            const actionInput = document.createElement('input');
            actionInput.type = 'hidden';
            actionInput.name = 'action';
            actionInput.value = 'addCustomer';
            form.appendChild(actionInput);

            // Add all customer data as hidden form fields with correct names
            Object.keys(customerData).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = customerData[key];
                form.appendChild(input);
                console.log(`🔍 DEBUG: Added form field - ${key}: ${customerData[key]}`);
            });

            // Submit form in hidden iframe to avoid page navigation
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.name = 'google-sheets-submit';
            document.body.appendChild(iframe);
            
            form.target = 'google-sheets-submit';
            document.body.appendChild(form);
            
            console.log('🚀 DEBUG: Submitting form to Google Apps Script...');
            form.submit();
            
            // Clean up after 2 seconds
            setTimeout(() => {
                document.body.removeChild(form);
                document.body.removeChild(iframe);
            }, 2000);

            console.log('✅ Customer data submitted to Google Sheets (direct form method)');
            return { status: 'success', message: 'Form submitted' };
        } catch (error) {
            console.error('❌ Failed to save to Google Sheets:', error);
            throw error;
        }
    }

    async sendEmailNotification(formData) {
        // Send instant email notification using EmailJS
        // You'll need to set up EmailJS account and get your keys
        
        try {
            const emailData = {
                to_email: 'shawn.d.seibert@gmail.com', // Replace with your email
                customer_name: `${formData.firstName} ${formData.lastName}`,
                customer_phone: formData.phone,
                customer_email: formData.email || 'Not provided',
                customer_address: formData.address,
                service_type: getServiceTypeLabel(formData.serviceType),
                urgency: getUrgencyLabel(formData.urgency),
                description: formData.description || 'No description provided',
                budget: getBudgetLabel(formData.budget),
                preferred_date: formData.preferredDate || 'Not specified',
                contact_preference: getContactPreferenceLabel(formData.contactPreference),
                contact_time: getContactTimeLabel(formData.contactTime),
                heard_about: getHeardAboutLabel(formData.heardAbout),
                additional_notes: formData.additionalNotes || 'None',
                submission_time: new Date(formData.timestamp).toLocaleString(),
                form_source: 'QR Code Customer Form'
            };

            // Replace these with your actual EmailJS credentials
            const response = await emailjs.send(
                'service_y7jy0vv',    // Your EmailJS service ID
                'template_wucjydw',   // Your EmailJS template ID
                emailData,
                '-GonV4jpuu4FyT4pz'     // Your EmailJS public key
            );

            console.log('Email notification sent successfully:', response);
            return response;
        } catch (error) {
            console.error('Failed to send email notification:', error);
            // Don't throw error - we still want to show success to customer
            // The form data is still saved to Google Sheets and locally
        }
    }

    saveCustomerSubmission(formData) {
        // Get existing submissions
        const existingSubmissions = JSON.parse(localStorage.getItem('customerSubmissions') || '[]');
        
        // Add new submission
        existingSubmissions.push(formData);
        
        // Save back to localStorage
        localStorage.setItem('customerSubmissions', JSON.stringify(existingSubmissions));
        
        console.log('Customer submission saved:', formData);
    }

    showSuccessMessage(formData) {
        // Hide form
        document.querySelector('.form-container').style.display = 'none';
        document.querySelector('.intro-section').style.display = 'none';
        
        // Show success message
        document.getElementById('successMessage').style.display = 'block';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Track submission analytics (if you add analytics later)
        this.trackSubmission(formData);
    }

    trackSubmission(formData) {
        // Placeholder for analytics tracking
        console.log('Tracking submission:', {
            serviceType: formData.serviceType,
            urgency: formData.urgency,
            budget: formData.budget,
            referralSource: formData.heardAbout,
            timestamp: formData.timestamp
        });
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

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
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
            font-size: 0.9rem;
        `;

        document.body.appendChild(notification);

        // Auto-remove notification
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000);
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

// Global function for "Submit Another" button
function submitAnother() {
    // Hide success message
    document.getElementById('successMessage').style.display = 'none';
    
    // Show form sections
    document.querySelector('.form-container').style.display = 'block';
    document.querySelector('.intro-section').style.display = 'block';
    
    // Reset form
    document.getElementById('customerQuoteForm').reset();
    
    // Clear any errors
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Export function for admin access
function exportCustomerSubmissions() {
    const submissions = JSON.parse(localStorage.getItem('customerSubmissions') || '[]');
    
    if (submissions.length === 0) {
        alert('No customer submissions to export');
        return;
    }
    
    const csvData = convertSubmissionsToCSV(submissions);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function convertSubmissionsToCSV(submissions) {
    const headers = [
        'Submission Date', 'First Name', 'Last Name', 'Phone', 'Email', 'Address',
        'Service Type', 'Urgency', 'Description', 'Budget', 'Preferred Date',
        'Contact Preference', 'Contact Time', 'Heard About Us', 'Additional Notes'
    ];

    const csvRows = [headers.join(',')];

    submissions.forEach(submission => {
        const row = [
            new Date(submission.timestamp).toLocaleString(),
            submission.firstName || '',
            submission.lastName || '',
            submission.phone || '',
            submission.email || '',
            submission.address || '',
            getServiceTypeLabel(submission.serviceType),
            getUrgencyLabel(submission.urgency),
            submission.description || '',
            getBudgetLabel(submission.budget),
            submission.preferredDate || '',
            getContactPreferenceLabel(submission.contactPreference),
            getContactTimeLabel(submission.contactTime),
            getHeardAboutLabel(submission.heardAbout),
            submission.additionalNotes || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`);
        
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

// Label conversion functions
function getServiceTypeLabel(value) {
    const labels = {
        'new-doors': 'New Door Installation',
        'new-windows': 'New Window Installation',
        'door-replacement': 'Replace Existing Door',
        'window-replacement': 'Replace Existing Windows',
        'door-parts': 'Door Hardware/Parts',
        'window-parts': 'Window Hardware/Parts',
        'repair': 'Repair Existing Door/Window',
        'consultation': 'Free Consultation'
    };
    return labels[value] || value || '';
}

function getUrgencyLabel(value) {
    const labels = {
        'flexible': 'Flexible with timing',
        'month': 'Within the next month',
        'weeks': 'Within 2-3 weeks',
        'urgent': 'As soon as possible',
        'emergency': 'Emergency'
    };
    return labels[value] || value || '';
}

function getBudgetLabel(value) {
    const labels = {
        'under-500': 'Under $500',
        '500-1000': '$500 - $1,000',
        '1000-2500': '$1,000 - $2,500',
        '2500-5000': '$2,500 - $5,000',
        '5000-10000': '$5,000 - $10,000',
        'over-10000': 'Over $10,000',
        'unsure': 'Not sure yet'
    };
    return labels[value] || value || '';
}

function getContactPreferenceLabel(value) {
    const labels = {
        'phone': 'Phone Call',
        'text': 'Text Message',
        'email': 'Email',
        'any': 'Any method is fine'
    };
    return labels[value] || value || '';
}

function getContactTimeLabel(value) {
    const labels = {
        'anytime': 'Anytime',
        'morning': 'Morning (8am-12pm)',
        'afternoon': 'Afternoon (12pm-5pm)',
        'evening': 'Evening (5pm-8pm)',
        'weekends': 'Weekends only'
    };
    return labels[value] || value || '';
}

function getHeardAboutLabel(value) {
    const labels = {
        'google': 'Google Search',
        'referral': 'Friend/Family Referral',
        'facebook': 'Facebook',
        'nextdoor': 'Nextdoor',
        'flyer': 'Flyer/Advertisement',
        'drive-by': 'Saw your work in neighborhood',
        'yellowpages': 'Yellow Pages',
        'other': 'Other'
    };
    return labels[value] || value || '';
}

// Add notification animations CSS
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

// Initialize the customer form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS (make sure it's loaded)
    if (typeof emailjs !== 'undefined') {
        emailjs.init('-GonV4jpuu4FyT4pz'); // Replace with your actual public key
        console.log('EmailJS initialized successfully');
    } else {
        console.warn('EmailJS not loaded - email notifications will not work');
    }
    
    window.customerQuoteForm = new CustomerQuoteForm();
    
    // Add keyboard shortcuts for admin access
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+E to export submissions (for admin)
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            exportCustomerSubmissions();
        }
    });
});