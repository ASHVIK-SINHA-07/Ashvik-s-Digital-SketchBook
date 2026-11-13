//  01. INITIALIZATION 

document.addEventListener("DOMContentLoaded", () => {

    initNavigation();
    initScrollAnimations();
    initInteractions();

});


//  02. NAVIGATION 

function initNavigation() {
    const currentPage = window.location.pathname.replace(/\/$/, "/index.html");

    document.querySelectorAll("nav a[href]").forEach((link) => {
        const destination = new URL(link.href);
        const isCurrentPage = destination.origin === window.location.origin &&
            destination.pathname === currentPage;

        link.classList.toggle("active", isCurrentPage);

        if (isCurrentPage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}


//  03. SCROLL ANIMATIONS 

function initScrollAnimations() {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (motionPreference.matches || !("IntersectionObserver" in window) ||
        !("animate" in Element.prototype)) {
        return;
    }

    const animations = new Set();
    const observer = new IntersectionObserver((entries) => {
        entries.filter((entry) => entry.isIntersecting).forEach((entry, index) => {

            // Keep content visible by default, including when animations are unavailable.
            if (!motionPreference.matches) {
                const animation = entry.target.animate(
                    [
                        { opacity: 0.6, translate: "0 12px" },
                        { opacity: 1, translate: "0 0" }
                    ],
                    {
                        duration: 450,
                        delay: Math.min(index * 65, 195),
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        fill: "backwards"
                    }
                );
                animations.add(animation);
                animation.onfinish = animation.oncancel = () => animations.delete(animation);
            }

            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(
        "#hero-section > *, .page-hero > *, .featured-card, .skill-list, .log-link, .quick-link"
    ).forEach((element) => {
        observer.observe(element);
    });

    motionPreference.addEventListener("change", (event) => {
        if (!event.matches) return;
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
        animations.clear();
    });
}


//  04. INTERACTIONS 

function initInteractions() {
    const form = document.querySelector('.contact-form form[action="#"]');
    if (!form) return;

    const nameInput = form.querySelector('[name="username"]');
    const emailInput = form.querySelector('[name="email"]');
    const messageInput = form.querySelector('[name="message"]');
    if (!nameInput || !emailInput || !messageInput) return;

    const feedback = document.createElement("p");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    form.append(feedback);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        [nameInput, messageInput].forEach((input) => {
            input.setCustomValidity(input.value.trim() ? "" : "Please enter more than spaces.");
        });
        if (!form.reportValidity()) return;

        // There is no form backend yet. Offer an email draft without claiming delivery.
        const subject = encodeURIComponent(`Digital Desk — Message from ${nameInput.value.trim()}`);
        const body = encodeURIComponent(
            `Name: ${nameInput.value.trim()}\nEmail: ${emailInput.value.trim()}\n\n${messageInput.value.trim()}`
        );
        const emailLink = document.createElement("a");
        emailLink.href = `mailto:ashviksinha.dev@gmail.com?subject=${subject}&body=${body}`;
        emailLink.textContent = "Open your email app to send this message.";
        feedback.replaceChildren("This form cannot send messages directly. ", emailLink);
    });

    form.addEventListener("input", (event) => {
        if (event.target === nameInput || event.target === messageInput) {
            event.target.setCustomValidity("");
        }
        feedback.replaceChildren();
    });
}
