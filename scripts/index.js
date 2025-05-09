var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { setDarkMode, setNavbar } from "./api.js";
setDarkMode();
setNavbar();
renderSnaker();
function resize(canvas, gl) {
    canvas.width = 512;
    canvas.height = 512;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
function loadTexture(gl, path) {
    const texture = gl.createTexture();
    const pixels = new Uint8Array([0, 0, 255, 255]);
    const image = new Image();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    image.src = `../images/${path}`;
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    return texture;
}
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) {
        const shaderName = {
            0x8B31: 'vertex',
            0x8B30: 'fragment'
        };
        throw Error(`Could not create ${shaderName[type]} shader`);
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw Error(`Could not compile shader: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
}
function loadSource(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`../shaders/${path}`);
        return yield response.text();
    });
}
function createProgram(gl) {
    return __awaiter(this, void 0, void 0, function* () {
        const vertexSource = yield loadSource('snaker.vert');
        const fragmentSource = yield loadSource('snaker.frag');
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw Error(`Could not initialize shader program: ${gl.getProgramInfoLog(program)}`);
        }
        return program;
    });
}
function renderSnaker() {
    return __awaiter(this, void 0, void 0, function* () {
        const canvas = document.getElementById('glSnaker');
        const gl = canvas.getContext('webgl');
        const program = yield createProgram(gl);
        const position = gl.getAttribLocation(program, 'Position');
        const time = gl.getUniformLocation(program, 'Time');
        const texture = gl.getUniformLocation(program, 'ImageTexture');
        const image = loadTexture(gl, 'snaker.png');
        const buffer = gl.createBuffer();
        const verticies = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0,];
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        function render(animTime) {
            animTime *= 0.001;
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, image);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.uniform1i(texture, 0);
            gl.uniform1f(time, animTime);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
        resize(canvas, gl);
    });
}
