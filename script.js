document.addEventListener("DOMContentLoaded", () => {
    // Keep one consistent public navigation across every static website page.
    const navContent = document.querySelector('.navbar .nav-content');
    if (navContent) {
        const normalizedPath = window.location.pathname
            .toLowerCase()
            .replace(/\/+$/, '')
            .replace(/\.html$/, '');

        let activeSection = 'residential';
        if (normalizedPath.includes('faq')) activeSection = 'faq';
        else if (
            normalizedPath.includes('why-cleaning-heroes') ||
            normalizedPath.includes('best-cleaning-company') ||
            normalizedPath.includes('cleaning-heroes-facts')
        ) activeSection = 'why';
        else if (normalizedPath.includes('commercial-cleaning')) activeSection = 'commercial';
        else if (normalizedPath === '/join') activeSection = 'join';
        else if (normalizedPath === '/referral') activeSection = 'referral';

        const navItems = [
            { key: 'faq', label: 'FAQ', href: '/faq' },
            { key: 'why', label: 'Why Us', href: '/why-cleaning-heroes.html' },
            { key: 'join', label: 'Join Our Team', href: '/join' },
            { key: 'referral', label: 'Refer & Earn', href: '/referral' },
            { key: 'commercial', label: 'Commercial', href: '/commercial-cleaning' },
            { key: 'residential', label: 'Residential Quote', href: '/#quote-section' }
        ];

        const navLinks = navItems.map((item) => {
            const isActive = item.key === activeSection;
            return `<a href="${item.href}" class="site-nav-link${isActive ? ' is-active' : ''}"${isActive ? ' aria-current="page"' : ''}>${item.label}</a>`;
        }).join('');

        const activeLabel = navItems.find((item) => item.key === activeSection)?.label || 'Menu';
        navContent.innerHTML = `
            <div class="logo-wrapper">
                <a href="/" class="site-logo-link" aria-label="Cleaning Heroes home">
                    <img src="/assets/images/logo.png" alt="Cleaning Heroes Logo" class="nav-logo">
                    <span class="logo-text">Cleaning <span>Heroes</span></span>
                </a>
            </div>
            <div class="site-nav-actions">
                <a href="tel:8438942440" class="site-nav-phone"><span aria-hidden="true">📞</span> (843) 894-2440</a>
                <button class="site-nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav-menu">${activeLabel}<span aria-hidden="true">⌄</span></button>
                <div class="site-nav-menu" id="site-nav-menu">${navLinks}</div>
            </div>`;

        const menuToggle = navContent.querySelector('.site-nav-toggle');
        const menu = navContent.querySelector('.site-nav-menu');
        menuToggle?.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
        menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
            menu.classList.remove('is-open');
            menuToggle?.setAttribute('aria-expanded', 'false');
        }));
    }

    // 1. Set current year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // First-party conversion and campaign attribution. This also emits standard
    // dataLayer/gtag events when an analytics provider is connected later.
    const CONVERSION_URL = 'https://cleaning-heroes-crm.vercel.app/api/conversions';
    const ATTRIBUTION_KEY = 'cleaning_heroes_attribution_v1';
    const VISITOR_KEY = 'cleaning_heroes_visitor_v1';
    const SESSION_KEY = 'cleaning_heroes_session_v1';

    const getIdentifier = (storage, key) => {
        try {
            let value = storage.getItem(key);
            if (!value) {
                value = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
                storage.setItem(key, value);
            }
            return value;
        } catch {
            return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
    };

    const captureAttribution = () => {
        const params = new URLSearchParams(window.location.search);
        let stored = {};
        try { stored = JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || '{}'); } catch { stored = {}; }
        const current = {
            utmSource: params.get('utm_source') || '',
            utmMedium: params.get('utm_medium') || '',
            utmCampaign: params.get('utm_campaign') || '',
            utmTerm: params.get('utm_term') || '',
            utmContent: params.get('utm_content') || '',
            gclid: params.get('gclid') || '',
            fbclid: params.get('fbclid') || '',
            landingPage: window.location.href,
            referrer: document.referrer || ''
        };
        const hasCampaign = Boolean(current.utmSource || current.utmMedium || current.utmCampaign || current.gclid || current.fbclid);
        const attribution = Object.fromEntries(Object.entries(hasCampaign || !stored.landingPage ? current : stored).filter(([, value]) => Boolean(value)));
        try { localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution)); } catch { /* storage may be disabled */ }
        return attribution;
    };

    const attribution = captureAttribution();
    const sessionId = getIdentifier(sessionStorage, SESSION_KEY);
    const visitorId = getIdentifier(localStorage, VISITOR_KEY);

    const analyticsEvent = (eventName, details = {}) => {
        const eventDetails = {
            event_category: 'conversion',
            page_path: window.location.pathname,
            ...details
        };
        if (typeof window.gtag === 'function') window.gtag('event', eventName, eventDetails);
        else {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: eventName, ...eventDetails });
        }
    };

    const trackConversion = (eventName, details = {}) => {
        analyticsEvent(eventName, details);
        const payload = {
            eventName,
            pagePath: window.location.pathname,
            pageTitle: document.title,
            sessionId,
            visitorId,
            attribution,
            ...details
        };
        fetch(CONVERSION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        }).catch(() => { /* analytics must never interrupt the visitor */ });
    };

    document.addEventListener('click', (event) => {
        const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!link) return;
        const href = link.getAttribute('href') || '';
        if (href.toLowerCase().startsWith('tel:')) trackConversion('phone_click', { action: 'phone_link' });
        if (href.toLowerCase().startsWith('sms:')) trackConversion('text_click', { action: 'text_link' });
    });

    // 2. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Intersection Observer for Fade-In Animations
    const faders = document.querySelectorAll('.fade-in');
    
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // 4. Form Submission Handling
    const CRM_INTAKE_URL = 'https://cleaning-heroes-crm.vercel.app/api/intake/quote';
    const TURNSTILE_SITE_KEY = '0x4AAAAAAFBbvfihGi-MWMqv';
    let turnstileScriptPromise;

    const loadTurnstile = () => {
        if (window.turnstile) return Promise.resolve(window.turnstile);
        if (turnstileScriptPromise) return turnstileScriptPromise;

        turnstileScriptPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-cleaning-heroes-turnstile]');
            const script = existingScript || document.createElement('script');

            const handleReady = () => {
                if (window.turnstile) resolve(window.turnstile);
                else reject(new Error('Security verification did not load'));
            };

            if (existingScript) {
                existingScript.addEventListener('load', handleReady, { once: true });
                existingScript.addEventListener('error', reject, { once: true });
                return;
            }

            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.dataset.cleaningHeroesTurnstile = 'true';
            script.addEventListener('load', handleReady, { once: true });
            script.addEventListener('error', reject, { once: true });
            document.head.appendChild(script);
        });

        return turnstileScriptPromise;
    };

    const addSecurityVerification = async (formElement) => {
        const submitBtn = formElement.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        submitBtn.disabled = true;
        const securityWrap = document.createElement('div');
        securityWrap.className = 'quote-form-security';
        securityWrap.setAttribute('aria-label', 'Security verification');
        securityWrap.style.margin = '0.75rem 0 1rem';
        formElement.insertBefore(securityWrap, submitBtn);

        try {
            const turnstile = await loadTurnstile();
            formElement.dataset.turnstileWidgetId = turnstile.render(securityWrap, {
                sitekey: TURNSTILE_SITE_KEY,
                callback: (token) => {
                    formElement.dataset.turnstileToken = token;
                    submitBtn.disabled = false;
                },
                'expired-callback': () => {
                    formElement.dataset.turnstileToken = '';
                    submitBtn.disabled = true;
                },
                'error-callback': () => {
                    formElement.dataset.turnstileToken = '';
                    submitBtn.disabled = true;
                }
            });
        } catch (error) {
            console.error('Security verification error:', error);
            securityWrap.textContent = 'Security verification is temporarily unavailable. Please call or text us for help.';
        }
    };

    const forms = [
        { 
            id: 'lead-form', 
            type: 'residential'
        },
        { 
            id: 'commercial-form', 
            type: 'commercial'
        }
    ];

    const buildAddressId = (formElement, fieldName) => `${formElement.id}-${fieldName}`;

    const syncFormattedAddress = (formElement) => {
        const street = formElement.querySelector('[name="street"]')?.value?.trim() || '';
        const apt = formElement.querySelector('[name="apt"]')?.value?.trim() || '';
        const city = formElement.querySelector('[name="city"]')?.value?.trim() || '';
        const state = formElement.querySelector('[name="state"]')?.value?.trim() || '';
        const zip = formElement.querySelector('[name="zip"]')?.value?.trim() || '';
        const addressInput = formElement.querySelector('[name="address"]');

        if (addressInput) {
            addressInput.value = [street, apt, city, state, zip].filter(Boolean).join(', ');
        }
    };

    const enhanceResidentialAddressFields = (formElement) => {
        if (!formElement || formElement.id !== 'lead-form') return;
        if (formElement.querySelector('[name="street"]')) return;

        const addressInput = formElement.querySelector('input[name="address"]');
        if (!addressInput) return;

        const addressGroup = addressInput.closest('.form-group');
        if (!addressGroup) return;

        addressInput.type = 'hidden';

        addressGroup.innerHTML = `
            <label>Service Address <span style="font-weight: 400; color: var(--text-light);">(optional)</span></label>
            <p style="font-size: 0.85rem; color: var(--text-light); margin: 0 0 0.75rem;">Share what feels comfortable now. The more specific the location, the cleaner the quote we can build.</p>
            <input type="hidden" name="address" value="">
            <div class="form-row">
                <div class="form-group" style="flex: 2; margin-bottom: 1rem;">
                    <label for="${buildAddressId(formElement, 'street')}">Street Address</label>
                    <input type="text" id="${buildAddressId(formElement, 'street')}" name="street" placeholder="123 Main Street">
                </div>
                <div class="form-group" style="flex: 1; margin-bottom: 1rem;">
                    <label for="${buildAddressId(formElement, 'apt')}">Apt / Unit</label>
                    <input type="text" id="${buildAddressId(formElement, 'apt')}" name="apt" placeholder="Unit 2">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="${buildAddressId(formElement, 'city')}">City</label>
                    <input type="text" id="${buildAddressId(formElement, 'city')}" name="city" placeholder="Pawleys Island">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="${buildAddressId(formElement, 'state')}">State</label>
                    <input type="text" id="${buildAddressId(formElement, 'state')}" name="state" placeholder="SC" maxlength="2">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="${buildAddressId(formElement, 'zip')}">ZIP</label>
                    <input type="text" id="${buildAddressId(formElement, 'zip')}" name="zip" placeholder="29585">
                </div>
            </div>
        `;

        formElement.querySelectorAll('[name="street"], [name="apt"], [name="city"], [name="state"], [name="zip"]').forEach((field) => {
            field.addEventListener('input', () => syncFormattedAddress(formElement));
        });
    };

    forms.forEach(formConfig => {
        const formElement = document.getElementById(formConfig.id);
        if (formElement) {
            enhanceResidentialAddressFields(formElement);
            addSecurityVerification(formElement);
            const successMsg = document.getElementById('form-success');
            let formStarted = false;
            let vacationInquiryTracked = false;
            const isVacationInquiry = () => {
                const service = formElement.querySelector('[name="service"]')?.value || '';
                return /vacation|rental|turnover/i.test(`${window.location.pathname} ${service}`);
            };
            formElement.addEventListener('focusin', () => {
                if (!formStarted) {
                    formStarted = true;
                    trackConversion('quote_form_started', { formType: isVacationInquiry() ? 'vacation' : formConfig.type, serviceType: formElement.querySelector('[name="service"]')?.value || '' });
                }
                if (!vacationInquiryTracked && isVacationInquiry()) {
                    vacationInquiryTracked = true;
                    trackConversion('vacation_rental_inquiry', { formType: formConfig.type, action: 'quote_form_started' });
                }
            });

            formElement.addEventListener('submit', async (e) => {
                e.preventDefault();
                syncFormattedAddress(formElement);

                const turnstileToken = formElement.dataset.turnstileToken;
                if (!turnstileToken) {
                    alert('Please complete the security check before requesting your quote.');
                    return;
                }
                
                // Disable button during submission
                const submitBtn = formElement.querySelector('button[type="submit"]');
                const originalButtonText = submitBtn.innerText;
                submitBtn.innerText = 'Sending...';
                submitBtn.disabled = true;

                const formData = new FormData(formElement);
                const crmPayload = Object.fromEntries(formData.entries());
                if (crmPayload.squareFootage && !crmPayload.square_footage) {
                    crmPayload.square_footage = crmPayload.squareFootage;
                }
                crmPayload.formType = isVacationInquiry() ? 'vacation' : formConfig.type;
                crmPayload.source = window.location.href;
                crmPayload.turnstileToken = turnstileToken;
                crmPayload.attribution = attribution;
                crmPayload.sessionId = sessionId;
                crmPayload.visitorId = visitorId;

                try {
                    const crmResponse = await fetch(CRM_INTAKE_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(crmPayload)
                    });

                    if (!crmResponse.ok) {
                        throw new Error('CRM intake failed');
                    }
                } catch (error) {
                    console.error('CRM intake error:', error);
                    const widgetId = formElement.dataset.turnstileWidgetId;
                    if (window.turnstile && widgetId) window.turnstile.reset(widgetId);
                    formElement.dataset.turnstileToken = '';
                    submitBtn.innerText = originalButtonText;
                    submitBtn.disabled = true;
                    alert('Sorry, we could not send your request. Please call or text us and we will help right away.');
                    return;
                }

                formElement.classList.add('hidden');
                successMsg.classList.remove('hidden');
                analyticsEvent('quote_form_completed', { form_type: crmPayload.formType, service_type: crmPayload.service || '' });
            });
        }
    });
});
