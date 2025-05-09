import { setDarkMode, setNavbar } from "./api.js";

setDarkMode();
setNavbar();
renderSnaker();

function resize(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): void
{
    canvas.width = 512;
    canvas.height = 512;

    gl.viewport(0, 0, canvas.width, canvas.height);
}

function loadTexture(gl: WebGLRenderingContext, path: string): WebGLTexture
{
    const texture: WebGLTexture = gl.createTexture();
    const pixels: Uint8Array<ArrayBuffer> = new Uint8Array([0, 0, 255, 255]);
    const image: HTMLImageElement = new Image();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    image.src = `../images/${path}`;
    image.onload = () =>
    {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    return texture;
}

function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader
{
    const shader: WebGLShader | null = gl.createShader(type);

    if (!shader) 
    {
        const shaderName: Record<number, string> =
        {
            0x8B31: 'vertex',
            0x8B30: 'fragment'
        };

        throw Error(`Could not create ${shaderName[type]} shader`);
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        gl.deleteShader(shader);

        throw Error(`Could not compile shader: ${gl.getShaderInfoLog(shader)}`);
    }

    return shader;
}

async function loadSource(path: string): Promise<string>
{
    const response: Response = await fetch(`../shaders/${path}`);

    return await response.text();
}

async function createProgram(gl: WebGLRenderingContext): Promise<WebGLProgram>
{
    const vertexSource: string = await loadSource('snaker.vert');
    const fragmentSource: string = await loadSource('snaker.frag');
    const vertexShader: WebGLShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader: WebGLShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program: WebGLProgram = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    {
        throw Error(`Could not initialize shader program: ${gl.getProgramInfoLog(program)}`);
    }

    return program;
}

async function renderSnaker()
{
    const canvas: HTMLCanvasElement = document.getElementById('glSnaker') as HTMLCanvasElement;
    const gl: WebGLRenderingContext = canvas.getContext('webgl') as WebGLRenderingContext;
    const program: WebGLProgram = await createProgram(gl);

    const position: number = gl.getAttribLocation(program, 'Position');
    const time: WebGLUniformLocation | null = gl.getUniformLocation(program, 'Time');
    const texture: WebGLUniformLocation | null = gl.getUniformLocation(program, 'ImageTexture');
    const image: WebGLTexture = loadTexture(gl, 'snaker.png');
    const buffer: WebGLBuffer = gl.createBuffer();
    const verticies: number[] = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0,];

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    function render(animTime: number)
    {
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
}