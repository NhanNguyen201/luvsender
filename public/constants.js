const C_NOISE_VERTEX = `
    precision mediump float;

    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vPosition;

    float PI = 3.141592653589793238;

    vec3 random3(vec3 c) {
        float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
        vec3 r;
        r.z = fract(512.0*j);
        j *= .125;
        r.x = fract(512.0*j);
        j *= .125;
        r.y = fract(512.0*j);
        return r-0.5;
    }

    const float F3 =  0.3333333;
    const float G3 =  0.1666667;

    float snoise(vec3 p) {

        vec3 s = floor(p + dot(p, vec3(F3)));
        vec3 x = p - s + dot(s, vec3(G3));
        
        vec3 e = step(vec3(0.0), x - x.yzx);
        vec3 i1 = e*(1.0 - e.zxy);
        vec3 i2 = 1.0 - e.zxy*(1.0 - e);
            
        vec3 x1 = x - i1 + G3;
        vec3 x2 = x - i2 + 2.0*G3;
        vec3 x3 = x - 1.0 + 3.0*G3;
        
        vec4 w, d;
        
        w.x = dot(x, x);
        w.y = dot(x1, x1);
        w.z = dot(x2, x2);
        w.w = dot(x3, x3);
        
        w = max(0.6 - w, 0.0);
        
        d.x = dot(random3(s), x);
        d.y = dot(random3(s + i1), x1);
        d.z = dot(random3(s + i2), x2);
        d.w = dot(random3(s + 1.0), x3);
        
        w *= w;
        w *= w;
        d *= w;
        
        return dot(d, vec4(52.0));
    }
    vec3 snoiseVec3( vec3 x ){

        float s  = snoise(vec3( x ));
        float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
        float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
        vec3 c = vec3( s , s1 , s2 );
        return c;

    }


    vec3 curlNoise( vec3 p ){
    
        const float e = .1;
        vec3 dx = vec3( e   , 0.0 , 0.0 );
        vec3 dy = vec3( 0.0 , e   , 0.0 );
        vec3 dz = vec3( 0.0 , 0.0 , e   );

        vec3 p_x0 = snoiseVec3( p - dx );
        vec3 p_x1 = snoiseVec3( p + dx );
        vec3 p_y0 = snoiseVec3( p - dy );
        vec3 p_y1 = snoiseVec3( p + dy );
        vec3 p_z0 = snoiseVec3( p - dz );
        vec3 p_z1 = snoiseVec3( p + dz );

        float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
        float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
        float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

        const float divisor = 1.0 / ( 2.0 * e );
        return normalize( vec3( x , y , z ) * divisor );

    }

    void main(){
        vUv = uv;  
        float multi = pow(sin(uTime), 2.);
        vec3 distorsion = curlNoise(vec3(position.x + uTime * 1.2, position.y + uTime * .05, 0.)) * multi;
        vec3 finalPos = position +  distorsion;
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.);
        gl_PointSize = 3.;
        gl_Position = projectionMatrix * mvPosition;
    }
`
const C_NOISE_FRAGMENT = `
    precision mediump float;
    uniform float uTime;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    float PI = 3.141592653589793238;
    void main() {
        vec4 uTt1 = texture2D(uTexture, vUv) ;
        gl_FragColor = uTt1;
    }
`

const BOEVE_VERTEX = `
    #extension GL_OES_standard_derivatives : enable

    #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
    #else
        precision mediump float;
    #endif

    varying vec2 vUv;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 eyeVector;

    attribute vec3 bArray;
    varying vec3 vbArray;

    float PI = 3.141592653589793238;

    void main(){
        vUv = uv;  
        vbArray = bArray;
        vNormal = normalize(normalMatrix * normal);

        vec3 newPosition = position;
        vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);

        eyeVector = normalize(worldPosition.xyz - cameraPosition);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const BOEVE_FRAGMENT = `
    #extension GL_OES_standard_derivatives : enable

    #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
    #else
        precision mediump float;
    #endif
    
    uniform sampler2D uTexture;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 eyeVector;


    float PI = 3.141592653589793238;

    vec2 hash22(vec2 p){
        p = fract(p * vec2(5.3983, 5.4427));
        p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
        return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
    }
    void main() {
        vec3 X = dFdx(vNormal);
        vec3 Y = dFdy(vNormal);

        vec3 normal = normalize(cross(X, Y));

        float diffuse = dot(normal, vec3(1.5));

        vec2 rand = hash22(vec2(floor(diffuse * 3.)));

        vec2 uvv = vec2(
        sign(rand.x - 0.5) * 1. + (rand.x - 0.5) * 0.6, 
        sign(rand.y - 0.5) * 1. + (rand.y - 0.5) * 0.6
        );
        vec2 uv = uvv * gl_FragCoord.xy / vec2(1000.);
        
        vec3 refracted = refract(eyeVector, normal, 1. / 3.);
        uv += 0.3 * refracted.xy;

        gl_FragColor = texture2D(uTexture, uv);
    }
`

const BOEVE_LINE_FRAGMENT = `
    #extension GL_OES_standard_derivatives : enable

    #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
    #else
        precision mediump float;
    #endif

    varying vec2 vUv;
    uniform sampler2D uTexture;
    varying vec3 vNormal;
    varying vec3 eyeVector;

    varying vec3 vbArray;

    float PI = 3.141592653589793238;

    vec2 hash22(vec2 p){
        p = fract(p * vec2(5.3983, 5.4427));
        p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
        return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
    }
    void main() {
        float width = 1.5;
        vec3 d = fwidth(vbArray);
        vec3 s = smoothstep(d * (width  + 0.5), d * (width - 0.5), vbArray);
        float line = max(s.x, max(s.y, s.z));
        if(line < 0.1) discard;
        gl_FragColor = vec4(mix(vec3(1.), vec3(0.), 1. - line), 1.);
    }
`