console.log('Ball loaded')

class Ball {
    constructor() {
        this.cont = new THREE.Object3D()
        this.init()
    }

    init() {
        let ballGeo = new THREE.SphereGeometry(8, 8, 32)
        let ballMat = new THREE.MeshBasicMaterial({
            color: 0x2F2F2F
        })

        this.ball = new THREE.Mesh(ballGeo, ballMat)

        this.cont.add(this.ball)
    }

    getBall() {
        return this.cont
    }

    
}