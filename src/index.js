const snaker = document.getElementById('glSnaker');
const glSnaker = snaker.getContext('webgl');

function resizeSnaker()
{
    snaker.width = 512;
    snaker.height = 512;
    glSnaker.viewport(0, 0, snaker.width, snaker.height);
}

window.addEventListener('resize', resizeSnaker);

resizeSnaker();

async function loadShaderSource(path)
{
    const response = await fetch(`../shaders/${path}`);

    return await response.text();
}

async function initializeShaderProgram(gl)
{
    const vertexSource = await loadShaderSource('snaker.vert');
    const fragmentSource = await loadShaderSource('snaker.frag');

    const vertexShader = loadRgbShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = loadRgbShader(gl.FRAGMENT_SHADER, fragmentSource);

    const glShaderProgram = gl.createProgram();
    gl.attachShader(glShaderProgram, vertexShader);
    gl.attachShader(glShaderProgram, fragmentShader);
    gl.linkProgram(glShaderProgram);

    if (!gl.getProgramParameter(glShaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(glShaderProgram));
        return null;
    }

    return glShaderProgram;
}

function loadRgbShader(type, source)
{
    const shader = glSnaker.createShader(type);
    glSnaker.shaderSource(shader, source);
    glSnaker.compileShader(shader);

    if (!glSnaker.getShaderParameter(shader, glSnaker.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + glSnaker.getShaderInfoLog(shader));
        glSnaker.deleteShader(shader);
        return null;
    }

    return shader;
}

function loadSnakerTexture(path)
{
    const glTexture = glSnaker.createTexture();
    glSnaker.bindTexture(glSnaker.TEXTURE_2D, glTexture);

    const glPixels = new Uint8Array([0, 0, 255, 255]);
    glSnaker.texImage2D(glSnaker.TEXTURE_2D, 0, glSnaker.RGBA, 1, 1, 0, glSnaker.RGBA, glSnaker.UNSIGNED_BYTE, glPixels);

    const imageElement = new Image();
    imageElement.src = `../include/img/${path}`;
    imageElement.onload = () =>
    {
        glSnaker.bindTexture(glSnaker.TEXTURE_2D, glTexture);
        glSnaker.texImage2D(glSnaker.TEXTURE_2D, 0, glSnaker.RGBA, glSnaker.RGBA, glSnaker.UNSIGNED_BYTE, imageElement);

        glSnaker.texParameteri(glSnaker.TEXTURE_2D, glSnaker.TEXTURE_WRAP_S, glSnaker.CLAMP_TO_EDGE);
        glSnaker.texParameteri(glSnaker.TEXTURE_2D, glSnaker.TEXTURE_WRAP_T, glSnaker.CLAMP_TO_EDGE);

        glSnaker.texParameteri(glSnaker.TEXTURE_2D, glSnaker.TEXTURE_MIN_FILTER, glSnaker.LINEAR);
        glSnaker.texParameteri(glSnaker.TEXTURE_2D, glSnaker.TEXTURE_MAG_FILTER, glSnaker.LINEAR);
    };

    return glTexture;
}

async function main()
{
    const glShaderProgram = await initializeShaderProgram(glSnaker);

    if (!glShaderProgram) { 
        return; 
    }

    const glAttribPosition = glSnaker.getAttribLocation(glShaderProgram, 'Position');
    const glUniformTime = glSnaker.getUniformLocation(glShaderProgram, 'Time');
    const glUniformImageTexture = glSnaker.getUniformLocation(glShaderProgram, 'ImageTexture');

    const glImageTexture = loadSnakerTexture('snaker.png', null);
    const glBuffer = glSnaker.createBuffer();

    const verticies = [
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0,
    ];

    glSnaker.bindBuffer(glSnaker.ARRAY_BUFFER, glBuffer);
    glSnaker.bufferData(glSnaker.ARRAY_BUFFER, new Float32Array(verticies), glSnaker.STATIC_DRAW);

    glSnaker.enableVertexAttribArray(glAttribPosition);
    glSnaker.vertexAttribPointer(glAttribPosition, 2, glSnaker.FLOAT, false, 0, 0);

    function render(time)
    {
        time *= 0.001;

        glSnaker.clear(glSnaker.COLOR_BUFFER_BIT);

        glSnaker.useProgram(glShaderProgram);
        
        glSnaker.activeTexture(glSnaker.TEXTURE0);
        glSnaker.bindTexture(glSnaker.TEXTURE_2D, glImageTexture);
        
        //glSnaker.pixelStorei(glSnaker.UNPACK_FLIP_Y_WEBGL, true);

        glSnaker.uniform1i(glUniformImageTexture, 0);
        glSnaker.uniform1f(glUniformTime, time);
        
        glSnaker.drawArrays(glSnaker.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();