console.log('Ball loaded')

class Ball {
    constructor() {
        this.cont = new THREE.Object3D()
        
        let ballGeo = new THREE.SphereGeometry(8, 8, 4)
        let ballMat = new THREE.MeshBasicMaterial({
            color: 0x2F2F2F,
            wireframe: true
        })

        this.ball = new THREE.Mesh(ballGeo, ballMat)

        this.cont.add(this.ball)
    }

    
}