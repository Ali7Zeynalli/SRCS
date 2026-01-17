/**
 * Simple client-side I18N engine for S-RCS Website
 */

const AVAILABLE_LANGUAGES = ['en', 'az', 'tr', 'de', 'ru'];
const DEFAULT_LANGUAGE = 'en';

class I18n {
    constructor() {
        this.language = this.getPreferredLanguage();
        this.data = {};
        // Delay observer setup until DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
             this.setupObserver();
        });
    }

    getPreferredLanguage() {
        const stored = localStorage.getItem('s-rcs-lang');
        if (stored && AVAILABLE_LANGUAGES.includes(stored)) {
            return stored;
        }
        
        const browser = navigator.language.slice(0, 2);
        if (AVAILABLE_LANGUAGES.includes(browser)) {
            return browser;
        }

        return DEFAULT_LANGUAGE;
    }

    async setLanguage(lang) {
        if (!AVAILABLE_LANGUAGES.includes(lang)) return;
        
        this.language = lang;
        localStorage.setItem('s-rcs-lang', lang);
        
        // Update html lang attribute
        document.documentElement.lang = lang;
        
        await this.loadLocale(lang);
        this.translatePage();
        this.updateActiveFlag(lang);

        // Dispatch event for other scripts (like Docs loader)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    setupObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check the node itself
                        if (node.hasAttribute('data-i18n')) {
                            this.translateElement(node);
                        }
                        // Check children
                        node.querySelectorAll('[data-i18n]').forEach((child) => {
                            this.translateElement(child);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    translateElement(element) {
        const key = element.getAttribute('data-i18n');
        const translation = this.getValue(key);
        
        if (translation !== null && translation !== undefined) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.tagName === 'IMG') {
               element.alt = translation;
            } else {
                element.innerHTML = translation; // Allow HTML in translations
            }
        }
    }

    async loadLocale(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) throw new Error(`Could not load ${lang}.json`);
            this.data = await response.json();
        } catch (error) {
            console.error('I18n Load Error:', error);
        }
    }

    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            this.translateElement(element);
        });
    }

    getValue(key) {
        return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), this.data);
    }

    updateActiveFlag(lang) {
        const langEl = document.getElementById('current-lang');
        if (langEl) {
            langEl.textContent = lang.toUpperCase();
        } else {
            // Might not be loaded yet
            console.log('Language UI element not found, retrying...');
        }
    }
}

// Initialize
window.i18n = new I18n();

// Expose global function to change language easily from UI
window.changeLanguage = (lang) => {
    window.i18n.setLanguage(lang);
};

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.setLanguage(window.i18n.language);
});
