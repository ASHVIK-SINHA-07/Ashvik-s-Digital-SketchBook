// 01. START AFTER THE PAGE HAS LOADED

document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initScrollAnimations();
    initInteractions();
});


// 02. HIGHLIGHT THE CURRENT PAGE IN THE NAVIGATION

function initNavigation() {
    let currentPage = window.location.pathname;

    // A folder URL opens index.html, so treat both URLs as the same page.
    if (currentPage.endsWith("/")) {
        currentPage = currentPage + "index.html";
    }

    const navigationLinks = document.querySelectorAll("nav a[href]");

    for (const link of navigationLinks) {
        const destination = new URL(link.href);
        const isSameWebsite = destination.origin === window.location.origin;
        const isSamePage = destination.pathname === currentPage;

        if (isSameWebsite && isSamePage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
        }
    }
}


// 03. ANIMATE CONTENT WHEN IT SCROLLS INTO VIEW

function initScrollAnimations() {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Leave content visible if the user prefers less motion or animations aren't supported.
    if (motionPreference.matches) {
        return;
    }
    if (!("IntersectionObserver" in window)) {
        return;
    }
    if (!("animate" in Element.prototype)) {
        return;
    }

    // A Set keeps track of animations that are still running.
    const runningAnimations = new Set();
    const observer = new IntersectionObserver(animateVisibleElements, { threshold: 0.1 });

    function animateVisibleElements(entries) {
        let visibleIndex = 0;

        for (const entry of entries) {
            if (!entry.isIntersecting) {
                continue;
            }

            if (!motionPreference.matches) {
                // Stagger elements that appear together, with a maximum delay of 195ms.
                const delay = Math.min(visibleIndex * 65, 195);
                const animation = entry.target.animate(
                    [
                        { opacity: 0.6, translate: "0 12px" },
                        { opacity: 1, translate: "0 0" }
                    ],
                    {
                        duration: 450,
                        delay: delay,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        fill: "backwards"
                    }
                );

                runningAnimations.add(animation);

                function removeFinishedAnimation() {
                    runningAnimations.delete(animation);
                }

                animation.onfinish = removeFinishedAnimation;
                animation.oncancel = removeFinishedAnimation;
            }

            // Each element only animates once.
            observer.unobserve(entry.target);
            visibleIndex = visibleIndex + 1;
        }
    }

    const elementsToAnimate = document.querySelectorAll(
        "#hero-section > *, .page-hero > *, .featured-card, .skill-list, .log-link, .quick-link"
    );

    for (const element of elementsToAnimate) {
        observer.observe(element);
    }

    motionPreference.addEventListener("change", function (event) {
        if (event.matches) {
            observer.disconnect();

            for (const animation of runningAnimations) {
                animation.cancel();
            }

            runningAnimations.clear();
        }
    });
}


// 04. PREPARE AN EMAIL FROM THE CONTACT FORM

function initInteractions() {
    const form = document.querySelector('.contact-form form[action="#"]');

    // Some pages don't have a contact form.
    if (!form) {
        return;
    }

    const nameInput = form.querySelector('[name="username"]');
    const emailInput = form.querySelector('[name="email"]');
    const messageInput = form.querySelector('[name="message"]');

    if (!nameInput || !emailInput || !messageInput) {
        return;
    }

    const feedback = document.createElement("p");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    form.append(feedback);

    form.addEventListener("submit", prepareEmail);
    form.addEventListener("input", clearFeedback);

    function prepareEmail(event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        // Required fields must contain more than just spaces.
        if (name === "") {
            nameInput.setCustomValidity("Please enter more than spaces.");
        } else {
            nameInput.setCustomValidity("");
        }

        if (message === "") {
            messageInput.setCustomValidity("Please enter more than spaces.");
        } else {
            messageInput.setCustomValidity("");
        }

        if (!form.reportValidity()) {
            return;
        }

        // Encode the text so spaces, line breaks, and special characters work in the link.
        const subject = encodeURIComponent("Digital Desk — Message from " + name);
        const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message);
        const emailLink = document.createElement("a");
        emailLink.href = "mailto:ashviksinha.dev@gmail.com?subject=" + subject + "&body=" + body;
        emailLink.textContent = "Open your email app to send this message.";

        // The form has no backend, so the visitor sends the message from their email app.
        feedback.replaceChildren("This form cannot send messages directly. ", emailLink);
    }

    function clearFeedback(event) {
        if (event.target === nameInput || event.target === messageInput) {
            event.target.setCustomValidity("");
        }

        feedback.replaceChildren();
    }
}
