const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const normalButton = document.getElementById('normalButton');
const sunRaysButton = document.getElementById('sunRaysButton');
const blackHoleButton = document.getElementById('blackHoleButton');
const clearButton = document.getElementById('clearButton');



let particlesArray = [];

let animationId = null;

let mouse = {
    x: null,
    y: null,
    // radius: (canvas.height/100) * (canvas.width/100)
    radius: (canvas.height / 80) * (canvas.width / 80)

}

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;

})

// create Particles class to create randomized Particle objects to populate the particles array
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }
    // draw individual particles
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false)
        ctx.fillStyle = 'rgb(230, 165, 80)';
        ctx.fill()
    }

    // check particle position, check mouse position and then draw the particle accordingly
    // black hole flag will change direction of particles, so instead of pushing away they'll get pulled in 
    update(isBlackHole) {
        // draw the particle
        this.draw();

        // bounce the particles off the boundaries
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY
        }
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy)
        // if below condition is met, it means there is a collision between mouse radius and the particle
        if (distance < mouse.radius + this.size) {
            // check for which direction the collision has happened and push it in the opposite direction
            // extra check is added to see if the particle is within 10 times its size from the edges to create
            // a boundary for collision
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                if (isBlackHole) {
                    this.x -= 10;
                } else {
                    this.x += 5;
                }
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                if (isBlackHole) {
                    this.x += 10;
                } else {
                    this.x -= 5;
                }

            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                if (isBlackHole) {
                    this.y += 10;
                } else {
                    this.y -= 5
                }
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                if (isBlackHole) {
                    this.y -= 10;
                } else {
                    this.y += 5;
                }

            }
        }

        // particle collision logic
        // disabled in black hole mode
        if (!isBlackHole) {
            for (let k = 0; k < particlesArray.length; k++) {
                let dx1 = particlesArray[k].x - this.x;
                let dy1 = particlesArray[k].y - this.y;
                let distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
                if (distance1 < this.size) {
                    if (particlesArray[k].x < this.x && this.x < canvas.width - this.size * 10) {
                        this.x += 10
                        this.directionX = -this.directionX
                    }
                    if (particlesArray[k].x > this.x && this.x > this.size * 10) {
                        this.x -= 10;
                        this.directionX = -this.directionX
                    }
                    if (particlesArray[k].y > this.y && this.y > this.size * 10) {
                        this.y -= 10
                        this.directionY = -this.directionY
                    }
                    if (particlesArray[k].y < this.y && this.y < canvas.height - this.size * 10) {
                        this.y += 10;
                        this.directionY = -this.directionY
                    }
                }
            }
        }
        
        // move the particle
        this.x += this.directionX;
        this.y += this.directionY;

    }
}

// create particle array
function init() {
    // particlesArray = [];
    if (particlesArray?.length <= 0) {
        const numberOfParticles = (canvas.height * canvas.width) / 5000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 5) + 1;
            let x = Math.random() * ((innerWidth - (size * 2)) - (size * 2)) + (size * 2);
            let y = Math.random() * ((innerHeight - (size * 2)) - (size * 2)) + (size * 2);
            let directionX = (Math.random() * 5) - 2.5;
            let directionY = (Math.random() * 5) - 2.5;
            let color = `rgba(0,0,0,${1 - size})`;
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color))
        }
    }

}

// to animate the particle movement
function animate(sunriseFunc, isBlackHole) {
    animationId = requestAnimationFrame(() => animate(sunriseFunc, isBlackHole));
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(isBlackHole);
    }
    connect();
    sunriseFunc();
}

// to create lines between particles when they get close to each other
function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x
            let dy = particlesArray[a].y - particlesArray[b].y
            let distance = (dx * dx + dy * dy)
            opacityValue = 1 - (distance / 20000);
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                ctx.strokeStyle = `rgba(230, 165, 80,${opacityValue})`;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
                ctx.stroke();
            }
        }
    }
}


// create the sun rays effect
const sunrise = () => {
    let opacityValue = 1;
    for (let i = 0; i < particlesArray.length; i++) {
        let dx = mouse.x - particlesArray[i].x;
        let dy = mouse.y - particlesArray[i].y;
        let distance = dx * dx + dy * dy;
        opacityValue = 1 - (distance / 100000)
        ctx.strokeStyle = `rgba(230, 165, 80, ${opacityValue})`
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y)
        ctx.lineTo(particlesArray[i].x, particlesArray[i].y)
        ctx.stroke();
    }
}

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
})

window.addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    mouse.radius = ((canvas.width / 100) * (canvas.height / 100))
})



function dummy() {
    return;
}


normalButton.addEventListener('click', () => {
    window.cancelAnimationFrame(animationId)
    init();
    animate(dummy, false);
})

sunRaysButton.addEventListener('click', () => {
    window.cancelAnimationFrame(animationId);
    init();
    animate(sunrise, false);
});

blackHoleButton.addEventListener('click', () => {
    window.cancelAnimationFrame(animationId);
    init();
    animate(dummy, true)
})

clearButton.addEventListener('click', () => {
    particlesArray = [];
})

