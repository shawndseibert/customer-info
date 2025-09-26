/**
 * Universal Theme Manager
 * Handles system preference detection and theme management across all pages
 */
class ThemeManager {
    constructor() {
        this.themes = {
            AUTO: 'auto',
            LIGHT: 'light', 
            DARK: 'dark'
        };
        
        this.currentTheme = this.loadThemePreference();
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupSystemThemeListener();
        this.createThemeToggle();
    }

    loadThemePreference() {
        const saved = localStorage.getItem('themePreference');
        return saved || this.themes.AUTO;
    }

    saveThemePreference(theme) {
        localStorage.setItem('themePreference', theme);
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getEffectiveTheme() {
        if (this.currentTheme === this.themes.AUTO) {
            return this.getSystemTheme();
        }
        return this.currentTheme;
    }

    applyTheme() {
        const body = document.body;
        const effectiveTheme = this.getEffectiveTheme();
        
        // Remove existing theme classes
        body.classList.remove('dark-theme', 'light-theme');
        
        // Apply theme class
        if (effectiveTheme === 'dark') {
            body.classList.add('dark-theme');
        } else {
            body.classList.add('light-theme');
        }

        // Update theme toggle icon if it exists
        this.updateThemeToggleIcon();
        
        // Dispatch theme change event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { 
                theme: effectiveTheme,
                preference: this.currentTheme 
            } 
        }));
    }

    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === this.themes.AUTO) {
                this.applyTheme();
            }
        });
    }

    cycleTheme() {
        const themeOrder = [this.themes.AUTO, this.themes.LIGHT, this.themes.DARK];
        const currentIndex = themeOrder.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        
        this.currentTheme = themeOrder[nextIndex];
        this.saveThemePreference(this.currentTheme);
        this.applyTheme();
        
        this.showThemeNotification();
    }

    setTheme(theme) {
        if (Object.values(this.themes).includes(theme)) {
            this.currentTheme = theme;
            this.saveThemePreference(theme);
            this.applyTheme();
        }
    }

    createThemeToggle() {
        // Check if theme toggle already exists
        let themeToggle = document.getElementById('themeToggle');
        
        if (!themeToggle) {
            // Create theme toggle if it doesn't exist
            themeToggle = document.createElement('button');
            themeToggle.id = 'themeToggle';
            themeToggle.className = 'theme-toggle';
            themeToggle.setAttribute('aria-label', 'Toggle theme');
            
            // Try to add to header or create floating button
            const header = document.querySelector('header');
            if (header) {
                header.appendChild(themeToggle);
            } else {
                // Create floating toggle
                themeToggle.classList.add('floating-theme-toggle');
                document.body.appendChild(themeToggle);
            }
        }

        themeToggle.addEventListener('click', () => this.cycleTheme());
        this.updateThemeToggleIcon();
    }

    updateThemeToggleIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const effectiveTheme = this.getEffectiveTheme();
        let icon, title;

        switch (this.currentTheme) {
            case this.themes.AUTO:
                icon = effectiveTheme === 'dark' ? 'fa-circle-half-stroke' : 'fa-circle-half-stroke';
                title = `Auto (${effectiveTheme === 'dark' ? 'Dark' : 'Light'}) - Click for Light`;
                break;
            case this.themes.LIGHT:
                icon = 'fa-sun';
                title = 'Light Theme - Click for Dark';
                break;
            case this.themes.DARK:
                icon = 'fa-moon';
                title = 'Dark Theme - Click for Auto';
                break;
        }

        themeToggle.innerHTML = `<i class="fas ${icon}"></i>`;
        themeToggle.title = title;
    }

    showThemeNotification() {
        const effectiveTheme = this.getEffectiveTheme();
        let message;

        switch (this.currentTheme) {
            case this.themes.AUTO:
                message = `Auto theme (currently ${effectiveTheme})`;
                break;
            case this.themes.LIGHT:
                message = 'Light theme';
                break;
            case this.themes.DARK:
                message = 'Dark theme';
                break;
        }

        // Show notification if available
        if (typeof this.showNotification === 'function') {
            this.showNotification(message, 'info');
        } else {
            // Fallback: create temporary toast
            this.showToast(message);
        }
    }

    showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.theme-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = 'theme-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Hide toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Base theme CSS that works across all pages
const baseThemeCSS = `
/* Base theme variables */
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --text-primary: #2d3748;
    --text-secondary: #4a5568;
    --border-color: #e2e8f0;
    --shadow: rgba(0, 0, 0, 0.1);
}

body.dark-theme {
    --bg-primary: #1a202c;
    --bg-secondary: #2d3748;
    --text-primary: #f7fafc;
    --text-secondary: #e2e8f0;
    --border-color: #4a5568;
    --shadow: rgba(0, 0, 0, 0.3);
}

/* Theme toggle styles */
.theme-toggle {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.theme-toggle:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
}

.theme-toggle i {
    font-size: 1.2rem;
}

.floating-theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
}

/* Toast notification styles */
.theme-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: var(--bg-primary);
    color: var(--text-primary);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--shadow);
    border: 1px solid var(--border-color);
    z-index: 1001;
    transition: all 0.3s ease;
    opacity: 0;
}

.theme-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
}

/* Dark theme for gradient backgrounds */
body.dark-theme {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%) !important;
}

/* Ensure form elements work with CSS variables */
body.dark-theme input,
body.dark-theme textarea,
body.dark-theme select {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--border-color);
}

body.dark-theme input::placeholder,
body.dark-theme textarea::placeholder {
    color: var(--text-secondary);
}
`;

// Auto-inject base theme CSS
function injectBaseThemeCSS() {
    const styleElement = document.createElement('style');
    styleElement.textContent = baseThemeCSS;
    document.head.appendChild(styleElement);
}

// Initialize theme manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    injectBaseThemeCSS();
    window.themeManager = new ThemeManager();
});

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}