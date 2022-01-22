class App {
    constructor(firstText, secondText) {
      this.firstText = firstText
      this.secondText = secondText  
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
        
      this.camera.position.set(-15, 15, 30);
  
      this.renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#app"),
        antialias: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x000000, 1);
      
  
      this.clock = new THREE.Clock();
  
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      
      // effect composer
      this.effectComposer = new THREE.EffectComposer( this.renderer )
  
      this.#onResize();
    }
  
    init() {
      this.#addPasses();
      this.#createText();
      this.#addEvents();
    }
    #addPasses() {
      this.effectComposer.addPass( new THREE.RenderPass(this.scene, this.camera))
      this.effectComposer.addPass(new THREE.AfterimagePass(0.93))
    }
    #createText(){
      let loveyouText = this.firstText
      let nameText = this.secondText
  
      let particleNumber = 3000
  
      let textConfig = {
        size: 1.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 12
      }
      
      let toTextGeo = (text, font, config) => new THREE.TextGeometry(String(text) , {
        font: font,
        ...config
      })
  
      new THREE.TTFLoader().load("./fonts/Potra.otf", data => {
  
        let ttfFont = new THREE.FontLoader().parse(data)
        
        let loveGeo = toTextGeo(loveyouText, ttfFont, textConfig)
        let nameGeo = toTextGeo(nameText, ttfFont, textConfig)
  
        loveGeo.center();
        nameGeo.center();
  
        let lovePoints = THREE.GeometryUtils.randomPointsInGeometry(loveGeo, particleNumber);
        let namePoints = THREE.GeometryUtils.randomPointsInGeometry(nameGeo, particleNumber);
        let spherePoints = THREE.GeometryUtils.randomPointsInGeometry(new THREE.SphereGeometry( 3, 32, 32 ), particleNumber)
        
        this.particlePoints = new TextPoints(particleNumber, namePoints , lovePoints, spherePoints)
        this.particlePoints.init(this.scene);
      })
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
      if(this.particlePoints) this.particlePoints.updateToFrame();
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
  
  