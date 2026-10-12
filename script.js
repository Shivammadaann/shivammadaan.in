document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveal content as it enters the viewport, with a graceful fallback.
    const targets = document.querySelectorAll(".observer-target");
    if ("IntersectionObserver" in window && !reduceMotion) {
        const observer = new IntersectionObserver((entries, activeObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("scroll-visible");
                    entry.target.classList.remove("scroll-hidden");
                    activeObserver.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: "0px 0px -4% 0px",
            threshold: 0.08
        });

        targets.forEach((target) => observer.observe(target));
    } else {
        targets.forEach((target) => {
            target.classList.add("scroll-visible");
            target.classList.remove("scroll-hidden");
        });
    }

    // Ease the card toward its pointer-driven tilt rather than snapping to each event.
    const card = document.querySelector(".tilt-card");
    const canTilt = window.matchMedia("(min-width: 768px)").matches && !reduceMotion;
    if (card && canTilt) {
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let active = false;
        let frame = null;

        const animateTilt = () => {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            const scale = active ? 1.008 : 1;
            card.style.transform = `perspective(1400px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale3d(${scale}, ${scale}, ${scale})`;

            if (!active && Math.abs(currentX) < 0.015 && Math.abs(currentY) < 0.015) {
                currentX = 0;
                currentY = 0;
                card.style.transform = "";
                frame = null;
                return;
            }
            frame = requestAnimationFrame(animateTilt);
        };

        card.addEventListener("pointermove", (event) => {
            if (event.pointerType !== "mouse") return;
            const bounds = card.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            targetX = y * -3.5;
            targetY = x * 3.5;
            active = true;
            if (frame === null) frame = requestAnimationFrame(animateTilt);
        }, { passive: true });

        card.addEventListener("pointerleave", () => {
            active = false;
            targetX = 0;
            targetY = 0;
            if (frame === null) frame = requestAnimationFrame(animateTilt);
        }, { passive: true });
    }

    // Image modal with a soft entrance, scroll lock, and Escape key support.
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    let closeTimer = null;

    if (!modal || !modalImg) return;

    window.openModal = (src) => {
        window.clearTimeout(closeTimer);
        modalImg.src = src;
        modal.classList.remove("hidden");
        modal.classList.add("opacity-0");
        modalImg.classList.remove("scale-100");
        modalImg.classList.add("scale-95");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => requestAnimationFrame(() => {
            modal.classList.remove("opacity-0");
            modalImg.classList.remove("scale-95");
            modalImg.classList.add("scale-100");
        }));
    };

    const closeModal = () => {
        if (modal.classList.contains("hidden")) return;
        modal.classList.add("opacity-0");
        modalImg.classList.remove("scale-100");
        modalImg.classList.add("scale-95");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        closeTimer = window.setTimeout(() => modal.classList.add("hidden"), reduceMotion ? 0 : 320);
    };

    modal.addEventListener("click", closeModal);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
    });
});
