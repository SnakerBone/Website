export type UniformSetter = (gl: WebGLRenderingContext, program: WebGLProgram, elapsedSeconds: number) => void;

export interface GLShaderRendererOptions
{
    vertexShaderPath?: string;
    fragmentShaderPath?: string;
    vertexShaderSource?: string;
    fragmentShaderSource?: string;
    imagePath?: string;
    width?: number;
    height?: number;
    positionAttribName?: string;
    timeUniformName?: string | null;
    textureUniformName?: string | null;
    resolutionUniformName?: string | null;
    flipY?: boolean;
    textureParams?: {
        wrapS?: GLenum;
        wrapT?: GLenum;
        minFilter?: GLenum;
        magFilter?: GLenum;
    };
    onBeforeRender?: UniformSetter;
    vertices?: number[];
}

const DEFAULT_QUAD_VERTICES: number[] = [
    -1.0, 1.0, 
    1.0, 1.0, 
    -1.0, -1.0, 
    1.0, -1.0
];

export class GLShaderRenderer
{
    private readonly canvas: HTMLCanvasElement;
    private readonly options: GLShaderRendererOptions;

    private gl!: WebGLRenderingContext;
    private program!: WebGLProgram;
    private texture: WebGLTexture | null = null;
    private buffer!: WebGLBuffer;

    private positionLocation: number = -1;
    private timeLocation: WebGLUniformLocation | null = null;
    private textureLocation: WebGLUniformLocation | null = null;
    private resolutionLocation: WebGLUniformLocation | null = null;

    private rafHandle: number | null = null;
    private initialized: boolean = false;

    private readonly defaultSize: number = 512;

    constructor(canvas: HTMLCanvasElement, options: GLShaderRendererOptions = {})
    {
        this.canvas = canvas;
        this.options = options;
    }

    public async init(): Promise<void>
    {
        const gl: WebGLRenderingContext | null = this.canvas.getContext('webgl');

        if (!gl)
        {
            throw Error('WebGL is not supported on this canvas');
        }

        this.gl = gl;

        this.resize(this.options.width, this.options.height);

        this.program = await this.createProgram();

        const positionAttribName: string = this.options.positionAttribName ?? 'Position';

        this.positionLocation = gl.getAttribLocation(this.program, positionAttribName);

        const timeUniformName: string | null | undefined = this.options.timeUniformName;

        if (timeUniformName !== null)
        {
            this.timeLocation = gl.getUniformLocation(this.program, timeUniformName ?? 'Time');
        }

        const textureUniformName: string | null | undefined = this.options.textureUniformName;

        if (textureUniformName !== null && this.options.imagePath)
        {
            this.textureLocation = gl.getUniformLocation(this.program, textureUniformName ?? 'ImageTexture');
            this.texture = this.loadTexture(this.options.imagePath);
        }

        const resolutionUniformName: string | null | undefined = this.options.resolutionUniformName;

        if (resolutionUniformName !== null)
        {
            this.resolutionLocation = gl.getUniformLocation(this.program, resolutionUniformName ?? 'Resolution');
        }

        this.updateResolutionUniform();

        this.buffer = gl.createBuffer() as WebGLBuffer;
        const vertices: number[] = this.options.vertices ?? DEFAULT_QUAD_VERTICES;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

        this.initialized = true;
    }

    public start(): void
    {
        if (!this.initialized)
        {
            throw Error('Shader renderer not initialized');
        }

        if (this.rafHandle !== null)
        {
            return;
        }

        const step = (timestampMs: number): void =>
        {
            this.renderFrame(timestampMs * 0.001);
            this.rafHandle = requestAnimationFrame(step);
        };

        this.rafHandle = requestAnimationFrame(step);
    }

    public stop(): void
    {
        if (this.rafHandle !== null)
        {
            cancelAnimationFrame(this.rafHandle);
            this.rafHandle = null;
        }
    }

    public resize(width?: number, height?: number): void
    {
        this.canvas.width = width ?? this.defaultSize;
        this.canvas.height = height ?? this.defaultSize;

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this.updateResolutionUniform();
    }

    public resizeAll(value: number) 
    {
        this.resize(value, value);
    }

    private updateResolutionUniform(): void
    {
        if (!this.program || !this.resolutionLocation)
        {
            return;
        }

        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
    }

    public dispose(): void
    {
        this.stop();

        if (!this.gl)
        {
            return;
        }

        if (this.texture)
        {
            this.gl.deleteTexture(this.texture);
        }

        if (this.buffer)
        {
            this.gl.deleteBuffer(this.buffer);
        }

        if (this.program)
        {
            this.gl.deleteProgram(this.program);
        }
    }

    private renderFrame(elapsedSeconds: number): void
    {
        const gl: WebGLRenderingContext = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);

        if (this.texture)
        {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.options.flipY ?? true);

            if (this.textureLocation)
            {
                gl.uniform1i(this.textureLocation, 0);
            }
        }

        if (this.timeLocation)
        {
            gl.uniform1f(this.timeLocation, elapsedSeconds);
        }

        this.options.onBeforeRender?.(gl, this.program, elapsedSeconds);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    private loadTexture(path: string): WebGLTexture
    {
        const gl: WebGLRenderingContext = this.gl;
        const texture: WebGLTexture = gl.createTexture() as WebGLTexture;
        const placeholderPixel: Uint8Array = new Uint8Array([0, 0, 255, 255]);
        const image: HTMLImageElement = new Image();
        const params = this.options.textureParams ?? {};

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, placeholderPixel);

        image.src = path;
        image.onload = () =>
        {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, params.wrapS ?? gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, params.wrapT ?? gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, params.minFilter ?? gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, params.magFilter ?? gl.LINEAR);
        };

        return texture;
    }

    private loadShader(type: GLenum, source: string): WebGLShader
    {
        const gl: WebGLRenderingContext = this.gl;
        const shader: WebGLShader | null = gl.createShader(type);

        if (!shader)
        {
            throw Error(`Could not create shader: Invalid shader type`);
        }

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {
            const info: string | null = gl.getShaderInfoLog(shader);

            gl.deleteShader(shader);

            throw Error(`Could not compile shader: ${info}`);
        }

        return shader;
    }

    private async resolveSource(path: string | undefined, inlineSource: string | undefined, label: string): Promise<string>
    {
        if (inlineSource !== undefined)
        {
            return inlineSource;
        }

        if (path === undefined)
        {
            throw Error(`No ${label} shader source or path provided`);
        }

        const response: Response = await fetch(path);

        if (!response.ok)
        {
            throw Error(`Failed to fetch shader: ${response.status} ${response.statusText}`);
        }

        return await response.text();
    }

    private async createProgram(): Promise<WebGLProgram>
    {
        const gl: WebGLRenderingContext = this.gl;

        const vertexSource: string = await this.resolveSource(
            this.options.vertexShaderPath,
            this.options.vertexShaderSource,
            'vertex'
        );
        const fragmentSource: string = await this.resolveSource(
            this.options.fragmentShaderPath,
            this.options.fragmentShaderSource,
            'fragment'
        );

        const vertexShader: WebGLShader = this.loadShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader: WebGLShader = this.loadShader(gl.FRAGMENT_SHADER, fragmentSource);
        const program: WebGLProgram = gl.createProgram() as WebGLProgram;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            const info: string | null = gl.getProgramInfoLog(program);

            throw Error(`Could not initialize program: ${info}`);
        }

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        return program;
    }
}