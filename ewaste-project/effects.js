/* 
   EcoCycle Visual Effects Engine 
   Handles mouse-parallax, button ripples, and UI sounds
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
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// 2. Glassmorphism Parallax Effect
document.addEventListener("mousemove", (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    document.querySelector('.container').style.transform = 
        `translate(${moveX}px, ${moveY}px)`;
});

// 3. Auto-hiding Header on Scroll
let lastScroll = 0;
window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    const nav = document.querySelector("nav");
    if (currentScroll > lastScroll) {
        nav.style.transform = "translateY(-100%)";
    } else {
        nav.style.transform = "translateY(0)";
    }
    lastScroll = currentScroll;
});
