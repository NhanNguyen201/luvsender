class TextPoints {
    constructor(particleNumber, namePoses, lovePoses, spherePoses){
        this.timeCount = 3000;
        this.state = 0;
        this.loopRange = 7;
        this.particleNumber = particleNumber;
        this.namePoses = namePoses;
        this.lovePoses = lovePoses;
        this.spherePoses = spherePoses;
        this.colorPalete = ["#ccffff", "#1DF1FF", "#BDFF1D", "#FF6CD6", "#FFD9B7", "#6BFF68" ].map(eachColor => new THREE.Color(eachColor).getHex())
        this.colorIdx = 0;
        this.pointMat = new THREE.PointsMaterial( { color: new THREE.Color(this.colorPalete[this.colorIdx]), size: 0.1 } )
        this.geo = new THREE.Geometry();
        
        for(let i = 0; i < this.particleNumber; i++){
            this.geo.vertices.push(
                new THREE.Vector3(0,0,0)
            )
        }
        this.points = new THREE.Points(this.geo, this.pointMat)

    }
    init(scene) {
        this.#getColor()
        scene.add(this.points);
        setInterval(() => this.#animate(), this.timeCount)
    }    
    updateToFrame(){
        this.geo.verticesNeedUpdate = true
    }
    #getColor(){
        this.colorIdx = Math.floor(Math.random() * this.colorPalete.length)
    }
    setColor(color){
        if(color) {
            let checkIdx = this.colorPalete.indexOf(new THREE.Color(color).getHex());
            if(checkIdx > -1) {
                this.colorIdx = checkIdx
            } else {
                this.colorPalete.push(new THREE.Color(color).getHex())
                this.colorIdx = this.colorPalete.length - 1
                console.log("new color array: ", this.colorPalete);
            }
        } else {
            this.colorIdx = (this.colorIdx + 1) % this.colorPalete.length
        }
        this.points.material.color.set(new THREE.Color(this.colorPalete[this.colorIdx]))
        localStorage.setItem("vv-particle-color", this.colorIdx) 
    }
    #animate(){
        this.state = (this.state + 1) % this.loopRange;
        if(this.state == 0){
            this.setColor()
            for(let i = 0; i < this.particleNumber; i++) {
                TweenMax.to(this.geo.vertices[i], 1, {x : this.namePoses[i].x, y : this.namePoses[i].y, z: this.namePoses[i].z, ease: Elastic.easeOut.config( 1, .4), delay: 1 / (this.particleNumber) * i})
            }
        } else if(this.state == 1){
            for(let i = 0; i < this.particleNumber; i++) {
                let scl = 5
                TweenMax.to(this.geo.vertices[i], Math.random() * 3, {x : this.spherePoses[this.particleNumber - i - 1 ].x * scl, y : this.spherePoses[this.particleNumber - i - 1].y * scl, z: this.spherePoses[this.particleNumber - i - 1].z * scl, ease: Elastic.easeOut.config( 0.1, .3)})
            }
            
            TweenMax.to(this.points.rotation, 2, { y: this.points.rotation.y + Math.PI,  ease: Elastic.easeOut.config( 0.1, .7)})
        } else if(this.state == 2){
            for(let i = 0; i < this.particleNumber; i++) {
                let scl = Math.random() * 4 + 1
                TweenMax.to(this.geo.vertices[i], Math.random() * 3, {x : this.spherePoses[i].x * scl, y : this.spherePoses[i].y * scl, z: this.spherePoses[i].z * scl, ease: Elastic.easeOut.config( 0.1, .3)})
            }
        } else if(this.state == 3) {
            TweenMax.to(this.points.rotation, 0.5, { y: this.points.rotation.y + Math.PI, ease: Elastic.easeOut.config( 0.1, .7), onComplete: () =>{
                let range = 15
                let maxLength = 8;
                let dirCan = ["x", "y", "z"]
                let dirArr, tl, moveNum;
                for(let i = 0; i < this.particleNumber; i++) {
                    dirArr = []
                    tl = new TimelineMax()
                    moveNum = Math.round(Math.random() * (maxLength - 4)) + 1;
                    for(let j = 0; j < moveNum; j++){
                        dirArr.push({[dirCan[Math.floor(Math.random() * dirCan.length)]]: (Math.random() - Math.random()) * range})
                    }
                    dirArr = dirArr.concat([{x: this.lovePoses[i].x}, {y : this.lovePoses[i].y}, {z: this.lovePoses[i].z}].sort(() => .5 - Math.random()))

                    for(let k = 0; k < dirArr.length; k++) {
                        tl.to(this.geo.vertices[i], Math.random() * 7 / dirArr.length, {[Object.keys(dirArr[k])]: dirArr[k][Object.keys(dirArr[k])], ease: Power3.easeIn, delay: 0.1 * k * Math.random() })
                    }
                }
            }})
        } else if(this.state == 6) {
            for(let i = 0; i < this.particleNumber; i++) {
                let scl = Math.random() * 4 + 1
                TweenMax.to(this.geo.vertices[i], Math.random() , {x : this.spherePoses[i].x * scl, y : this.spherePoses[i].y * scl, z: this.spherePoses[i].z * scl, ease: Back.easeOut.config( 1.7), delay: (1 / this.particleNumber) * i})

            }
        }
    }
   
}