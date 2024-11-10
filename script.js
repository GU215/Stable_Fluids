"use strict"

main();

async function main() {
    const c = document.getElementById("gl");
    const gl = c.getContext("webgl2");
    const ext = gl.getExtension("EXT_color_buffer_float");
    const ext2 = gl.getExtension("OES_texture_float_linear");

    const pixelRatio = 0.25;
    c.width = window.innerWidth * pixelRatio;
    c.height = window.innerHeight * pixelRatio;
    const maxV = Math.max(c.width, c.height);
    const minV = Math.min(c.width, c.height);
    const aspect = c.width / c.height;
    const aspX = Math.max(aspect, 1);
    const aspY = Math.max(1 / aspect, 1);
    const fA = maxV / minV;
    let touch;
    let mouse = [0, 0, 0, 0];
    let isMove = false;
    let time = 0;
    const dt = 1 / 60;

    c.addEventListener('mousemove', function (e) {
        e.preventDefault();
        isMove = true;
        mouse[2] = (((e.offsetX / (minV / pixelRatio)) * 2 - aspX) - mouse[0]) * fA;
        mouse[3] = (((e.offsetY / (minV / pixelRatio)) * -2 + aspY) - mouse[1]) * fA;
        mouse[0] = (e.offsetX / (minV / pixelRatio)) * 2 - aspX;
        mouse[1] = (e.offsetY / (minV / pixelRatio)) * -2 + aspY;
        console.log(mouse[2], mouse[3])
        const timer = setTimeout(() => {
            isMove = false;
        }, 100);
    }, true);

    c.addEventListener("mouseleave", function (e) {
        e.preventDefault();
        mouse[2] = 0;
        mouse[3] = 0;
    })

    c.addEventListener('touchmove', function (e) {
        touch = e.changedTouches[0];
        e.preventDefault();
        isMove = true;
        mouse[2] = (((touch.pageX / (minV / pixelRatio)) * 2 - aspX) - mouse[0]) * fA;
        mouse[3] = (((touch.pageY / (minV / pixelRatio)) * -2 + aspY) - mouse[1]) * fA;
        mouse[0] = (touch.pageX / (minV / pixelRatio)) * 2 - aspX;
        mouse[1] = (touch.pageY / (minV / pixelRatio)) * -2 + aspY;
        const timer = setTimeout(() => {
            isMove = false;
        }, 100);
    }, true);

    c.addEventListener("touchend", function (e) {
        e.preventDefault();
        mouse[2] = 0;
        mouse[3] = 0;
    })

    const vertexshadersource = document.getElementById("vs");
    const init_fragmentshadersource = document.getElementById("init_fs");
    const force_fragmentshadersource = document.getElementById("force_fs");
    const velocity_fragmentshadersource = document.getElementById("velocity_fs");
    const divergence_fragmentshadersource = document.getElementById("divergence_fs");
    const poisson_fragmentshadersource = document.getElementById("poisson_fs");
    const pressure_fragmentshadersource = document.getElementById("pressure_fs");
    const output_fragmentshadersource = document.getElementById("output_fs");
    const init_uniLocation = [];
    const input_uniLocation = [];
    const force_uniLocation = [];
    const velocity_uniLocation = [];
    const divergence_uniLocation = [];
    const poisson_uniLocation = [];
    const pressure_uniLocation = [];
    const output_uniLocation = [];

    function GLCreateShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const SSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (SSuccess) {
            return shader;
        }
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    function GLCreateProgram(vertexshader, fragmentshader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexshader);
        gl.attachShader(program, fragmentshader);
        gl.linkProgram(program);
        const PSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (PSuccess) {
            return program;
        }
        console.log(gl.getProgramInfoLog(shader));
        gl.deleteProgram(program);
    }

    function GLCreateTexture() {
        let t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        return t;
    }

    function setVAO(posAttribLocation, texAttribLocation) {
        const VAO = gl.createVertexArray();
        const PosBuffer = gl.createBuffer();
        gl.bindVertexArray(VAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, PosBuffer);
        gl.enableVertexAttribArray(posAttribLocation);
        gl.enableVertexAttribArray(texAttribLocation)
        gl.vertexAttribPointer(texAttribLocation, 2, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(posAttribLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Positions), gl.STATIC_DRAW);
        gl.bindVertexArray(null);
        return VAO;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.TEXTURE_2D);

    const vertexshader = GLCreateShader(gl.VERTEX_SHADER, vertexshadersource.innerHTML);
    const init_fragmentshader = GLCreateShader(gl.FRAGMENT_SHADER, init_fragmentshadersource.innerHTML);
    const force_fragmentshader = GLCreateShader(gl.FRAGMENT_SHADER, force_fragmentshadersource.innerHTML);
    const velocity_fragmentshader = GLCreateShader(gl.FRAGMENT_SHADER, velocity_fragmentshadersource.innerHTML);
    const divergence_fragmentshader = GLCreateShader(gl.FRAGMENT_SHADER, divergence_fragmentshadersource.innerHTML);
    const poisson_fragmentshader = GLCreateShader(gl.FRAGMENT_SHADER, poisson_fragmentshadersource.innerHTML);
    const pressure_fragmentshader = GLCreateShader(gl.FRAGMENT_SHADER, pressure_fragmentshadersource.innerHTML);
    const output_fragmentshader = GLCreateShader(gl.FRAGMENT_SHADER, output_fragmentshadersource.innerHTML);

    const init_prg = GLCreateProgram(vertexshader, init_fragmentshader);
    const force_prg = GLCreateProgram(vertexshader, force_fragmentshader);
    const velocity_prg = GLCreateProgram(vertexshader, velocity_fragmentshader);
    const divergence_prg = GLCreateProgram(vertexshader, divergence_fragmentshader);
    const poisson_prg = GLCreateProgram(vertexshader, poisson_fragmentshader);
    const pressure_prg = GLCreateProgram(vertexshader, pressure_fragmentshader);
    const output_prg = GLCreateProgram(vertexshader, output_fragmentshader);

    const Positions = [
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0
    ]

    const textures = [];
    const framebuffers = [];
    gl.activeTexture(gl.TEXTURE0);
    for (let i = 0; i < 2; ++i) {
        const texture = GLCreateTexture();
        textures.push(texture);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const fbo = gl.createFramebuffer();
        framebuffers.push(fbo);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, c.width, c.height, 0, gl.RGBA, gl.FLOAT, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    const pixels = new Uint8Array(c.width * c.height * 4);
    const px = 1 / c.width;
    const py = 1 / c.height;
    const circleX = -0.3;
    const circleY = 0.25;
    const minP = Math.min(px, py);
    for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
            const id = (x + c.width * y) * 4;
            const top = (py * (y - 1) + 1) >> 0;
            const bottom = (2 - py * (y + 1.05)) >> 0;
            const left = (px * (x - 1) + 1) >> 0;
            const right = (2 - px * (x + 1.05)) >> 0;
            const circle = Math.sqrt((minP * x - circleX - 0.5) ** 2 + (minP * y - circleY) ** 2) > 0.01;
            pixels[id + 0] = top * bottom * left * right * 255;
            pixels[id + 1] = 0;
            pixels[id + 2] = 0;
            pixels[id + 3] = 0;
        }
    }
    const cT2 = GLCreateTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cT2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, c.width, c.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.useProgram(init_prg);
    const init_posAttribLocation = gl.getAttribLocation(init_prg, "position");
    const init_texAttribLocation = gl.getAttribLocation(init_prg, "a_texCoord");
    init_uniLocation[0] = gl.getUniformLocation(init_prg, "isFlip");
    init_uniLocation[1] = gl.getUniformLocation(init_prg, "calcTex");
    init_uniLocation[2] = gl.getUniformLocation(init_prg, "resolution");
    force_uniLocation[3] = gl.getUniformLocation(force_prg, "dt");
    gl.uniform1f(init_uniLocation[0], 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(init_uniLocation[1], 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform2fv(init_uniLocation[2], [c.width, c.height]);
    gl.uniform1f(init_uniLocation[3], dt);
    const initVAO = setVAO(init_posAttribLocation, init_texAttribLocation);

    gl.useProgram(force_prg);
    const force_posAttribLocation = gl.getAttribLocation(force_prg, "position");
    const force_texAttribLocation = gl.getAttribLocation(force_prg, "a_texCoord");
    force_uniLocation[0] = gl.getUniformLocation(force_prg, "isFlip");
    force_uniLocation[1] = gl.getUniformLocation(force_prg, "calcTex");
    force_uniLocation[2] = gl.getUniformLocation(force_prg, "resolution");
    force_uniLocation[3] = gl.getUniformLocation(force_prg, "dt");
    force_uniLocation[4] = gl.getUniformLocation(force_prg, "mouse");
    gl.uniform1f(force_uniLocation[0], 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(force_uniLocation[1], 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform2fv(force_uniLocation[2], [c.width, c.height]);
    gl.uniform1f(force_uniLocation[3], dt);
    gl.uniform4fv(force_uniLocation[4], mouse);
    const forceVAO = setVAO(force_posAttribLocation, force_texAttribLocation);

    gl.useProgram(velocity_prg);
    const velocity_posAttribLocation = gl.getAttribLocation(velocity_prg, "position");
    const velocity_texAttribLocation = gl.getAttribLocation(velocity_prg, "a_texCoord");
    velocity_uniLocation[0] = gl.getUniformLocation(velocity_prg, "isFlip");
    velocity_uniLocation[1] = gl.getUniformLocation(velocity_prg, "calcTex");
    velocity_uniLocation[2] = gl.getUniformLocation(velocity_prg, "resolution");
    velocity_uniLocation[3] = gl.getUniformLocation(velocity_prg, "dt");
    gl.uniform1f(velocity_uniLocation[0], 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(velocity_uniLocation[1], 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform2fv(velocity_uniLocation[2], [c.width, c.height]);
    gl.uniform1f(velocity_uniLocation[3], dt);
    const velocityVAO = setVAO(velocity_posAttribLocation, velocity_texAttribLocation);

    gl.useProgram(divergence_prg);
    const divergence_posAttribLocation = gl.getAttribLocation(divergence_prg, "position");
    const divergence_texAttribLocation = gl.getAttribLocation(divergence_prg, "a_texCoord");
    divergence_uniLocation[0] = gl.getUniformLocation(divergence_prg, "isFlip");
    divergence_uniLocation[1] = gl.getUniformLocation(divergence_prg, "calcTex");
    divergence_uniLocation[2] = gl.getUniformLocation(divergence_prg, "resolution");
    divergence_uniLocation[3] = gl.getUniformLocation(divergence_prg, "dt");
    gl.uniform1f(divergence_uniLocation[0], 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(divergence_uniLocation[1], 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform2fv(divergence_uniLocation[2], [c.width, c.height]);
    gl.uniform1f(divergence_uniLocation[3], dt);
    const divergenceVAO = setVAO(divergence_posAttribLocation, divergence_texAttribLocation);

    gl.useProgram(poisson_prg);
    const poisson_posAttribLocation = gl.getAttribLocation(poisson_prg, "position");
    const poisson_texAttribLocation = gl.getAttribLocation(poisson_prg, "a_texCoord");
    poisson_uniLocation[0] = gl.getUniformLocation(poisson_prg, "isFlip");
    poisson_uniLocation[1] = gl.getUniformLocation(poisson_prg, "calcTex");
    poisson_uniLocation[2] = gl.getUniformLocation(poisson_prg, "resolution");
    poisson_uniLocation[3] = gl.getUniformLocation(poisson_prg, "dt");
    gl.uniform1f(poisson_uniLocation[0], 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(poisson_uniLocation[1], 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform2fv(poisson_uniLocation[2], [c.width, c.height]);
    gl.uniform1f(poisson_uniLocation[3], dt);
    const poissonVAO = setVAO(poisson_posAttribLocation, poisson_texAttribLocation);

    gl.useProgram(pressure_prg);
    const pressure_posAttribLocation = gl.getAttribLocation(pressure_prg, "position");
    const pressure_texAttribLocation = gl.getAttribLocation(pressure_prg, "a_texCoord");
    pressure_uniLocation[0] = gl.getUniformLocation(pressure_prg, "isFlip");
    pressure_uniLocation[1] = gl.getUniformLocation(pressure_prg, "calcTex");
    pressure_uniLocation[2] = gl.getUniformLocation(pressure_prg, "resolution");
    pressure_uniLocation[3] = gl.getUniformLocation(pressure_prg, "dt");
    pressure_uniLocation[4] = gl.getUniformLocation(pressure_prg, "calcTex2");
    gl.uniform1f(pressure_uniLocation[0], 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(pressure_uniLocation[1], 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform2fv(pressure_uniLocation[2], [c.width, c.height]);
    gl.uniform1f(pressure_uniLocation[3], dt);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cT2);
    gl.uniform1i(pressure_uniLocation[4], 1);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    const pressureVAO = setVAO(pressure_posAttribLocation, pressure_texAttribLocation);

    gl.useProgram(output_prg);
    const output_posAttribLocation = gl.getAttribLocation(output_prg, "position");
    const output_texAttribLocation = gl.getAttribLocation(output_prg, "a_texCoord");
    output_uniLocation[0] = gl.getUniformLocation(output_prg, "isFlip");
    output_uniLocation[1] = gl.getUniformLocation(output_prg, "calcTex");
    output_uniLocation[2] = gl.getUniformLocation(output_prg, "resolution");
    output_uniLocation[3] = gl.getUniformLocation(output_prg, "dt");
    output_uniLocation[4] = gl.getUniformLocation(output_prg, "calcTex2");
    gl.uniform1f(output_uniLocation[0], 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(output_uniLocation[1], 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform2fv(output_uniLocation[2], [c.width, c.height]);
    gl.uniform1f(output_uniLocation[3], dt);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cT2);
    gl.uniform1i(output_uniLocation[4], 1);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    const outputVAO = setVAO(output_posAttribLocation, output_texAttribLocation);

    gl.useProgram(init_prg);
    gl.bindVertexArray(initVAO);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.viewport(0, 0, c.width, c.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    render();

    function render() {

        gl.useProgram(force_prg);
        gl.bindVertexArray(forceVAO);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1]);
        gl.uniform4fv(force_uniLocation[4], mouse);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
        gl.flush();

        gl.useProgram(velocity_prg);
        gl.bindVertexArray(velocityVAO);
        gl.bindTexture(gl.TEXTURE_2D, textures[1]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
        gl.flush();

        gl.useProgram(divergence_prg);
        gl.bindVertexArray(divergenceVAO);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
        gl.flush();

        gl.useProgram(poisson_prg);
        gl.bindVertexArray(poissonVAO);
        for (let i = 0; i < 16; i++) {
            gl.bindTexture(gl.TEXTURE_2D, textures[1]);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
            gl.flush();
            gl.bindTexture(gl.TEXTURE_2D, textures[0]);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[1]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
            gl.flush();
        }

        gl.useProgram(pressure_prg);
        gl.bindVertexArray(pressureVAO);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, cT2);
        gl.uniform1i(pressure_uniLocation[4], 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[1]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[0]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
        gl.flush();

        gl.useProgram(output_prg);
        gl.bindVertexArray(outputVAO);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, cT2);
        gl.uniform1i(output_uniLocation[4], 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.uniform1i(output_uniLocation[1], 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
        gl.flush();

        if (!isMove) {
            mouse[2] = mouse[3] = 0;
        }

        requestAnimationFrame(render);
    }
}