document.addEventListener('DOMContentLoaded', function() {

    // --- RESPONSIVE HAMBURGER MENU ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // --- HEADER SCROLL EFFECT ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- EMAIL COPY BUTTON ---
    /*const copyBtn = document.getElementById('copy-email-btn');
    const emailSpan = document.getElementById('email');
    copyBtn.addEventListener('click', () => {
        const email = emailSpan.textContent;
        navigator.clipboard.writeText(email).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Email';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy email: ', err);
        });
    });*/

    // --- GSAP SCROLL ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero .fade-in', {
        opacity: 0, y: 30, duration: 1, delay: 0.5, stagger: 0.2
    });
    gsap.utils.toArray('.fade-in-up').forEach((elem) => {
        gsap.from(elem, {
            scrollTrigger: {
                trigger: elem,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            opacity: 0, y: 50, duration: 1,
        });
    });

    // --- THREE.JS LIGHT BEAM ANIMATION ---
    if (typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const canvasContainer = document.querySelector('.hero-visual');
        const canvas = document.getElementById('three-canvas');

        const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Shader code for the glowing beam
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            varying vec2 vUv;
            uniform float uTime;
            
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            void main() {
                float time = uTime * 0.5;
                
                // Create vertical bands that move and fade
                float alpha = (1.0 - vUv.y) * 0.8 + 0.2; // Fade out at the top
                alpha *= vUv.y * 0.8 + 0.2; // Fade out at the bottom

                float noiseValue = noise(vec2(vUv.x * 2.0, vUv.y * 4.0 + time));
                alpha *= noiseValue * 0.5 + 0.5;

                // Add some horizontal glowing lines
                float lines = sin((vUv.y * 20.0) - (time * 2.0)) * 0.5 + 0.5;
                lines = pow(lines, 4.0);
                
                vec3 color = vec3(0.39, 1.0, 0.85); // Corresponds to #64ffda
                gl_FragColor = vec4(color * lines, alpha * (lines + 0.1));
            }
        `;

        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 10, 32, 64, true);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const beam = new THREE.Mesh(geometry, material);
        scene.add(beam);
        
        const clock = new THREE.Clock();

        function animate() {
            const elapsedTime = clock.getElapsedTime();
            material.uniforms.uTime.value = elapsedTime;
            
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        animate();
        
        // Handle window resizing
        window.addEventListener('resize', () => {
            const width = canvasContainer.clientWidth;
            const height = canvasContainer.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }


});
