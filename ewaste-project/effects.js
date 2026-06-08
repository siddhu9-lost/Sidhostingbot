/* EcoCycle Visual Effects Engine 
   Handles mouse-parallax, button ripples, UI sounds, and Particle Systems
*/

// 1. Interactive Button Ripples
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;
        let ripple = document.createElement('span');
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        ripple.style.position = 'absolute';
        ripple.style.background = 'rgba(255,255,255,0.4)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = 'ripple 0.6s linear';
        this.appendChild(ripple);
        
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.innerHTML = `@keyframes ripple { 0% { width: 0; height: 0; opacity: 0.5; } 100% { width: 400px; height: 400px; opacity: 0; } }`;
            document.head.appendChild(style);
        }
        setTimeout(() => ripple.remove(), 600);
    });
});

// 2. Glassmorphism Parallax Effect
document.addEventListener("mousemove", (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.005;
    const container = document.querySelector('.container');
    if(container) {
        container.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
});

// 3. Auto-hiding Header on Scroll
let lastScroll = 0;
window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    const nav = document.querySelector("nav");
    if(nav) {
        if (currentScroll > lastScroll && currentScroll > 50) {
            nav.style.transform = "translateY(-100%)";
        } else {
            nav.style.transform = "translateY(0)";
            nav.style.transition = "transform 0.4s ease";
        }
    }
    lastScroll = currentScroll;
});

// 4. Confetti Engine (Dynamic Celebration)
window.fireConfetti = function() {
    const colors = ['#00f2fe', '#4facfe', '#f0abfc', '#ffffff'];
    for (let i = 0; i < 60; i++) {
        createParticle(colors[Math.floor(Math.random() * colors.length)]);
    }
};

function createParticle(color) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.top = '50%';
    particle.style.left = '50%';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.backgroundColor = color;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    document.body.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 5 + Math.random() * 15;
    const tx = Math.cos(angle) * velocity * 20;
    const ty = Math.sin(angle) * velocity * 20 - 100;

    particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
        duration: 1000 + Math.random() * 500,
        easing: 'cubic-bezier(0, .9, .57, 1)'
    }).onfinish = () => particle.remove();
}
