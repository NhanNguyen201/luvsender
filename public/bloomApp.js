const vertexShader = `
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
const fragmentShader = `
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
class App {
    constructor(link) {
      this.link = link
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.01, 
        10000000000
      );
      var ambientLight = new THREE.AmbientLight(0x999999 );
      this.scene.add(ambientLight);
      var lights = [];
      lights[0] = new THREE.DirectionalLight( 0xffffff, 1 );
      lights[0].position.set( 1, 0, 0 );
      lights[1] = new THREE.DirectionalLight( 0x11E8BB, 1 );
      lights[1].position.set( 0.75, 1, 0.5 );
      lights[2] = new THREE.DirectionalLight( 0x8200C9, 1 );
      lights[2].position.set( -0.75, -1, 0.5 );
      this.scene.add( lights[0] );
      this.scene.add( lights[1] );
      this.scene.add( lights[2] );
        
      this.camera.position.set(-1, 1, 2);
        
      this.renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#app"),
        antialias: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x000000, 0);

      this.textureLoader = new THREE.TextureLoader()
      this.texture = this.textureLoader.load(this.link)
      this.progress = 0.;
      this.bloomStrength = 0;
      this.speed = Math.PI / 145;
      this.clock = new THREE.Clock();
  
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      
      // effect composer
      this.effectComposer = new THREE.EffectComposer( this.renderer )
  
      this.#onResize();
    }
  
    init() {
      this.#addPasses();
      this.#createImage();
      this.#addEvents();
    }
    #addPasses() {
        this.effectComposer.addPass( new THREE.RenderPass(this.scene, this.camera))
        this.bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        this.bloomPass.threshold = 1;
        this.bloomPass.strength = 0;
        this.bloomPass.radius = 1;
        this.effectComposer.addPass(this.bloomPass)
    }
    #createImage(){
        this.geometry = new THREE.PlaneBufferGeometry(1, 1, 480, 480);
        this.material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            uTime: { value: this.progress },
            uTexture: { value: this.texture },
          },
          side: THREE.DoubleSide
        });
        this.mesh = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.mesh);
    }
  
    changeColor(color) {
      this.particlePoints.setColor(color)
    }
  
    #addEvents(){
      window.requestAnimationFrame(this.#run.bind(this));
      window.addEventListener("resize", this.#onResize.bind(this), false);
    }
  
    #run() {
      requestAnimationFrame(this.#run.bind(this));
      this.#render();
    }
  
    #render() {
        this.progress += this.speed;
        this.bloomPass.strength = Math.pow(Math.sin(this.progress), 1);
        this.bloomPass.threshold = Math.abs(Math.cos(this.progress));
        this.bloomPass.radius = Math.abs(Math.cos(this.progress));
        this.material.uniforms.uTime.value = this.progress;
        if(this.effectComposer) {
            this.effectComposer.render()
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
  
    #onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      if(this.effectComposer) {
        this.effectComposer.setSize(w, h);
      }
    }
  }
  
  