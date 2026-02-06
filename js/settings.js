/**
 * Site Settings Manager
 * Load and save settings from localStorage
 */

const SiteSettings = {
    defaultSettings: {
        site: {
            name: 'Aquarium Studio',
            logo: '🐟',
            tagline: '專業水族用品'
        },
        contact: {
            phone: '0912-345-678',
            lineId: '@yasonok02061',
            lineUrl: 'https://line.me/ti/p/@yasonok02061',
            address: '台灣水族用品店',
            email: 'yasonok@hotmail.com'
        }
    },
    
    load: function() {
        try {
            const stored = localStorage.getItem('siteSettings');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults for new fields
                return {
                    ...this.defaultSettings,
                    contact: {
                        ...this.defaultSettings.contact,
                        ...parsed
                    }
                };
            }
        } catch(e) {
            console.error('Error loading settings:', e);
        }
        return this.defaultSettings;
    },
    
    save: function(settings) {
        try {
            localStorage.setItem('siteSettings', JSON.stringify(settings));
            return true;
        } catch(e) {
            console.error('Error saving settings:', e);
            return false;
        }
    },
    
    getPhone: function() {
        return this.load().contact.phone;
    },
    
    getLineId: function() {
        return this.load().contact.lineId;
    },
    
    getLineUrl: function() {
        return this.load().contact.lineUrl;
    },
    
    getEmail: function() {
        return this.load().contact.email;
    },
    
    getAddress: function() {
        return this.load().contact.address;
    }
};

// Make it globally available
window.SiteSettings = SiteSettings;
