document.addEventListener("DOMContentLoaded", () => {
    // 1. Set current year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

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
            const successMsg = document.getElementById('form-success');

            formElement.addEventListener('submit', async (e) => {
                e.preventDefault();
                syncFormattedAddress(formElement);
                
                // Disable button during submission
                const submitBtn = formElement.querySelector('button[type="submit"]');
                const originalButtonText = submitBtn.innerText;
                submitBtn.innerText = 'Sending...';
                submitBtn.disabled = true;

                const formData = new FormData(formElement);
                const crmPayload = Object.fromEntries(formData.entries());
                crmPayload.formType = formConfig.type;
                crmPayload.source = window.location.href;

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
                    submitBtn.innerText = originalButtonText;
                    submitBtn.disabled = false;
                    alert('Sorry, we could not send your request. Please call or text us and we will help right away.');
                    return;
                }

                formElement.classList.add('hidden');
                successMsg.classList.remove('hidden');
            });
        }
    });
});
