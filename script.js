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
            type: 'residential',
            url: 'https://script.google.com/macros/s/AKfycbzizY-hkownFjkT5seKO6GRDpQ_e5bjScKsXVHk-9hKF8PK9hwbR45yESXrMaXeiljh/exec'
        },
        { 
            id: 'commercial-form', 
            type: 'commercial',
            url: 'https://script.google.com/macros/s/AKfycbxg7DSemUfjCHfeM74Bq9jXi46EZXFHJwSa0VeTX-ZQ5Qd1Q7xzBl34KNZoZOQ3q-o1/exec'
        }
    ];

    forms.forEach(formConfig => {
        const formElement = document.getElementById(formConfig.id);
        if (formElement) {
            const successMsg = document.getElementById('form-success');

            formElement.addEventListener('submit', async (e) => {
                e.preventDefault();
                
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

                // Use a hidden iframe for the actual submission to fully bypass CORS issues
                let iframe = document.getElementById('hidden_iframe');
                if(!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.name = 'hidden_iframe';
                    iframe.id = 'hidden_iframe';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    
                    // When the iframe finishes loading the Google Apps Script invisible response
                    iframe.onload = () => {
                        // Confirm this button is currently processing a submit
                        if(submitBtn.disabled === true) {
                            formElement.classList.add('hidden');
                            successMsg.classList.remove('hidden');
                        }
                    };
                }

                // Native submit
                formElement.action = formConfig.url;
                formElement.target = 'hidden_iframe';
                formElement.submit();
            });
        }
    });
});
