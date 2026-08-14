const DEFAULT_QUAD_VERTICES = [
    -1.0, 1.0,
    1.0, 1.0,
    -1.0, -1.0,
    1.0, -1.0
];
export class GLShaderRenderer {
    constructor(canvas, options = {}) {
        this.texture = null;
        this.positionLocation = -1;
        this.timeLocation = null;
        this.textureLocation = null;
        this.resolutionLocation = null;
        this.rafHandle = null;
        this.initialized = false;
        this.defaultSize = 512;
        this.canvas = canvas;
        this.options = options;
    }
    async init() {
        var _a, _b;
        const gl = this.canvas.getContext('webgl');
        if (!gl) {
            throw Error('WebGL is not supported on this canvas');
        }
        this.gl = gl;
        this.resize(this.options.width, this.options.height);
        this.program = await this.createProgram();
        const positionAttribName = (_a = this.options.positionAttribName) !== null && _a !== void 0 ? _a : 'Position';
        this.positionLocation = gl.getAttribLocation(this.program, positionAttribName);
        const timeUniformName = this.options.timeUniformName;
        if (timeUniformName !== null) {
            this.timeLocation = gl.getUniformLocation(this.program, timeUniformName !== null && timeUniformName !== void 0 ? timeUniformName : 'Time');
        }
        const textureUniformName = this.options.textureUniformName;
        if (textureUniformName !== null && this.options.imagePath) {
            this.textureLocation = gl.getUniformLocation(this.program, textureUniformName !== null && textureUniformName !== void 0 ? textureUniformName : 'ImageTexture');
            this.texture = this.loadTexture(this.options.imagePath);
        }
        const resolutionUniformName = this.options.resolutionUniformName;
        if (resolutionUniformName !== null) {
            this.resolutionLocation = gl.getUniformLocation(this.program, resolutionUniformName !== null && resolutionUniformName !== void 0 ? resolutionUniformName : 'Resolution');
        }
        this.updateResolutionUniform();
        this.buffer = gl.createBuffer();
        const vertices = (_b = this.options.vertices) !== null && _b !== void 0 ? _b : DEFAULT_QUAD_VERTICES;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        this.initialized = true;
    }
    start() {
        if (!this.initialized) {
            throw Error('Shader renderer not initialized');
        }
        if (this.rafHandle !== null) {
            return;
        }
        const step = (timestampMs) => {
            this.renderFrame(timestampMs * 0.001);
            this.rafHandle = requestAnimationFrame(step);
        };
        this.rafHandle = requestAnimationFrame(step);
    }
    stop() {
        if (this.rafHandle !== null) {
            cancelAnimationFrame(this.rafHandle);
            this.rafHandle = null;
        }
    }
    resize(width, height) {
        this.canvas.width = width !== null && width !== void 0 ? width : this.defaultSize;
        this.canvas.height = height !== null && height !== void 0 ? height : this.defaultSize;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.updateResolutionUniform();
    }
    resizeAll(value) {
        this.resize(value, value);
    }
    updateResolutionUniform() {
        if (!this.program || !this.resolutionLocation) {
            return;
        }
        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
    }
    dispose() {
        this.stop();
        if (!this.gl) {
            return;
        }
        if (this.texture) {
            this.gl.deleteTexture(this.texture);
        }
        if (this.buffer) {
            this.gl.deleteBuffer(this.buffer);
        }
        if (this.program) {
            this.gl.deleteProgram(this.program);
        }
    }
    renderFrame(elapsedSeconds) {
        var _a, _b, _c;
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, (_a = this.options.flipY) !== null && _a !== void 0 ? _a : true);
            if (this.textureLocation) {
                gl.uniform1i(this.textureLocation, 0);
            }
        }
        if (this.timeLocation) {
            gl.uniform1f(this.timeLocation, elapsedSeconds);
        }
        (_c = (_b = this.options).onBeforeRender) === null || _c === void 0 ? void 0 : _c.call(_b, gl, this.program, elapsedSeconds);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    loadTexture(path) {
        var _a;
        const gl = this.gl;
        const texture = gl.createTexture();
        const placeholderPixel = new Uint8Array([0, 0, 255, 255]);
        const image = new Image();
        const params = (_a = this.options.textureParams) !== null && _a !== void 0 ? _a : {};
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, placeholderPixel);
        image.src = path;
        image.onload = () => {
            var _a, _b, _c, _d;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, (_a = params.wrapS) !== null && _a !== void 0 ? _a : gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, (_b = params.wrapT) !== null && _b !== void 0 ? _b : gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, (_c = params.minFilter) !== null && _c !== void 0 ? _c : gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, (_d = params.magFilter) !== null && _d !== void 0 ? _d : gl.LINEAR);
        };
        return texture;
    }
    loadShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        if (!shader) {
            throw Error(`Could not create shader: Invalid shader type`);
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw Error(`Could not compile shader: ${info}`);
        }
        return shader;
    }
    async resolveSource(path, inlineSource, label) {
        if (inlineSource !== undefined) {
            return inlineSource;
        }
        if (path === undefined) {
            throw Error(`No ${label} shader source or path provided`);
        }
        const response = await fetch(path);
        if (!response.ok) {
            throw Error(`Failed to fetch shader: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    }
    async createProgram() {
        const gl = this.gl;
        const vertexSource = await this.resolveSource(this.options.vertexShaderPath, this.options.vertexShaderSource, 'vertex');
        const fragmentSource = await this.resolveSource(this.options.fragmentShaderPath, this.options.fragmentShaderSource, 'fragment');
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fragmentSource);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            throw Error(`Could not initialize program: ${info}`);
        }
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return program;
    }
}
