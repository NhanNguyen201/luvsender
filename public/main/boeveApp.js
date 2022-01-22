
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
        // this.renderer.context.getExtension('OES_standard_derivatives');
        this.textureLoader = new THREE.TextureLoader()
        this.boeveTexture = this.textureLoader.load(this.link)
        this.boeveTexture.wrapS = this.boeveTexture.wrapT = THREE.MirroredRepeatWrapping;

        this.clock = new THREE.Clock();
    
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        
        this.octaRota = 0;
        this.speed =  Math.PI / 7200;
        this.#onResize();
    }
  
    init() {
      this.#createOct();
      this.#addEvents();
    }
    
    #createOct(){
        this.octaGeo = new THREE.OctahedronGeometry(1, 1);

        this.octaMaterial = new THREE.ShaderMaterial({
          vertexShader: BOEVE_VERTEX,
          fragmentShader: BOEVE_FRAGMENT,
          uniforms: {
            uTexture: { value: this.boeveTexture },
          },
          side: THREE.DoubleSide
        });

        this.octaMesh = new THREE.Mesh(this.octaGeo, this.octaMaterial);

        this.octaBufferGeo = new THREE.OctahedronBufferGeometry(1.001, 1);
        let bufferLength = this.octaBufferGeo.attributes.position.array.length;
        let bArray = [];
        for (let i = 0; i < bufferLength / 3; i++) {
          bArray.push(0,0,1,  0,1,0,  1,0,0);      
        }
        let floatArray = new Float32Array(bArray);
        this.octaBufferGeo.setAttribute("bArray",new THREE.BufferAttribute(floatArray, 3), );
        this.lineOctaMat = new THREE.ShaderMaterial({
          vertexShader: BOEVE_VERTEX,
          fragmentShader: BOEVE_LINE_FRAGMENT,
          uniforms: {
            uTexture: { value: this.boeveTexture },
          },
          side: THREE.DoubleSide
        });
        this.octaLineMesh = new THREE.Mesh(this.octaBufferGeo, this.lineOctaMat)
        
        this.scene.add(this.octaMesh);
        this.scene.add(this.octaLineMesh)
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
        this.octaRota += this.speed;
        this.octaMesh.rotation.y = this.octaRota;
        this.octaLineMesh.quaternion.copy(this.octaMesh.quaternion)
        this.renderer.render(this.scene, this.camera);
    }
  
    #onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
}
  
  