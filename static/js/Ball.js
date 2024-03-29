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

        this.cam = new THREE.Object3D()
        this.cam.position.set(0, 100, -200)

        this.ball.add(frame)
        this.cont.add(this.ball)
        this.cont.add(this.cam)

        this.isFlying = false
        this.marked = false
    }

    shot(time, bAngle, cAngle, power, gMulti, origin, lifetime) {
        this.shotTime = time
        this.barrelAngle = bAngle
        this.cannonAngle = cAngle
        this.power = power
        this.gMulti = gMulti
        this.origin = origin
        this.lifetime = lifetime

        this.isFlying = true
    }

    setRotation(angle) {
        let rad = angle * (Math.PI / 180)
        this.cont.rotation.set(0, rad, 0)
    }
}