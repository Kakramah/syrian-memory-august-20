/**
 * SYRIAN MEMORY AUGUST 20 — DIGITAL MUSEUM INTERACTION ENGINE
 * Identity & Art Direction: Khaldoun Akramah x Antigravity
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. SPOTLIGHT GLOW CURSOR (Desktop only)
    const cursor = document.getElementById('spotlight-cursor');
    if (cursor && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = -999, mouseY = -999;
        let currentX = -999, currentY = -999;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        const renderCursor = () => {
            currentX += (mouseX - currentX) * 0.15;
            currentY += (mouseY - currentY) * 0.15;
            cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);
    }

    // 2. DOT NAVIGATION & TIMELINE TRACKING (IntersectionObserver)
    const sections = document.querySelectorAll('section[id]');
    const navDots = document.querySelectorAll('.nav-dot');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navDots.forEach((dot) => {
                    if (dot.getAttribute('data-target') === currentId) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach((sec) => sectionObserver.observe(sec));

    // Handle Dot Navigation Click
    navDots.forEach((dot) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = dot.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. LIGHTBOX VIEWER
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const visualFrames = document.querySelectorAll('.visual-frame');

    const openLightbox = (src, captionText) => {
        lightboxImg.src = src;
        lightboxCaption.textContent = captionText;
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
        lightboxCaption.textContent = '';
        document.body.style.overflow = '';
    };

    visualFrames.forEach((frame) => {
        frame.addEventListener('click', () => {
            const imgSrc = frame.getAttribute('data-lightbox');
            const caption = frame.querySelector('.visual-caption-tag')?.textContent || 'اللوحة التوثيقية';
            if (imgSrc) {
                openLightbox(imgSrc, caption);
            }
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal || e.target.classList.contains('lightbox-backdrop')) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    // 4. MEMORIAL PLEDGE FORM (Web3Forms AJAX submission)
    const pledgeForm = document.getElementById('pledge-form');
    const formFeedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('btn-submit-pledge');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

    if (pledgeForm) {
        pledgeForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous feedback
            formFeedback.className = 'form-feedback';
            formFeedback.textContent = '';

            // Disable submit button & show loading state
            submitBtn.disabled = true;
            const originalBtnText = btnText ? btnText.textContent : 'تسجيل وتخليد الشهادة';
            if (btnText) {
                btnText.textContent = 'جاري تدوين الشهادة في سجل الذاكرة...';
            }

            const formData = new FormData(pledgeForm);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const result = await response.json();

                if (response.status === 200 && result.success) {
                    formFeedback.classList.add('success');
                    formFeedback.innerHTML = `
                        <strong>تم تدوين شهادتك وعهدك الوطني في سجل الذاكرة بنجاح.</strong><br>
                        الرحمة للشهداء، وعاشت سوريا حرة أبية عزيزة وموحدة.
                    `;
                    pledgeForm.reset();
                } else {
                    formFeedback.classList.add('error');
                    formFeedback.textContent = result.message || 'تعذر إرسال البيانات حالياً، يرجى المحاولة بعد قليل.';
                }
            } catch (error) {
                formFeedback.classList.add('error');
                formFeedback.textContent = 'حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.';
            } finally {
                submitBtn.disabled = false;
                if (btnText) {
                    btnText.textContent = originalBtnText;
                }
            }
        });
    }
});
