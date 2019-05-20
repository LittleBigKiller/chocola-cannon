console.log('Ball loaded')

class Ball {
    constructor() {
        this.cont = new THREE.Object3D()
        
        let ballGeo = new THREE.SphereGeometry(8, 8, 4)
        let ballMat = new THREE.MeshBasicMaterial({
            color: 0x2F2F2F,
            wireframe: false
        })

        let frameMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true
        })

        this.ball = new THREE.Mesh(ballGeo, ballMat)

        let frame = new THREE.Mesh(ballGeo, frameMat) 

        this.ball.add(frame)
        this.cont.add(this.ball)
    }
}