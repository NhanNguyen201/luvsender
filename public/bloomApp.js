
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
          vertexShader: C_NOISE_VERTEX,
          fragmentShader: C_NOISE_FRAGMENT,
          uniforms: {
            uTime: { value: this.progress },
            uTexture: { value: this.texture },
          },
          side: THREE.DoubleSide
        });
        this.mesh = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.mesh);
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
  
  