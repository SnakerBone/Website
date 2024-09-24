precision mediump float;

uniform sampler2D SnakerTexture;
uniform float Time;

void main() 
{
    vec2 uv = gl_FragCoord.xy / vec2(512.0, 512.0);
    vec4 textureColour = texture2D(SnakerTexture, uv);

    float r = 0.5 + 0.5 * sin(Time + uv.x * 5.0);
    float g = 0.5 + 0.5 * sin(Time + uv.y * 5.0);
    float b = 0.5 + 0.5 * sin(Time + uv.x * uv.y * 10.0);

    vec4 tintColour = vec4(r, g, b, 1.0);
    
    gl_FragColor = textureColour * tintColour;
}