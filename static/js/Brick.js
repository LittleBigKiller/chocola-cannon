console.log('Brick loaded')

class Brick {
    constructor(size) {
        this.cont = new THREE.Object3D()
        this.size = size
        this.nothit = true

        let brickGeo = new THREE.BoxGeometry(size, size, size)
        this.brickMat = new THREE.MeshBasicMaterial({
            color: 0x2F2F7F,
            wireframe: false
        })

        let frameMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true
        })

        this.brick = new THREE.Mesh(brickGeo, this.brickMat)
        this.brick.name = "brick"
        this.brick.class = this

        let frame = new THREE.Mesh(brickGeo, frameMat)

        this.cam = new THREE.Object3D()
        this.cam.position.set(-200, 200, 400)

        this.brick.position.set(0, size / 2, 0)

        this.brick.add(frame)
        this.cont.add(this.brick)
        this.cont.add(this.cam)
    }

    gotHit() {
        this.nothit = false
        this.hitTime = Date.now()

        this.brickMat.color.set(0xAF7F2F)
    }

    handleHit() {
        let c = this.cont
        let b = this.brick
        let bClass = this

        let fallTime = (Date.now() - this.hitTime) / 500

        let timeSince
        if (this.landTime)
            timeSince = (Date.now() - this.landTime) / 80
        else
            timeSince = 0
        let positionDiff = 10 - timeSince
        if (positionDiff < 0) positionDiff = 0

        c.position.z += positionDiff

        if (positionDiff != 0)
            b.rotation.x += 0.5
        else
            b.rotation.x = 0

        if (c.position.y > 0)
            c.position.y -= fallTime * fallTime * 9.81
        else {
            if (!this.landTime)
                this.landTime = Date.now()
            if (this.deleteTimer == null)
                this.deleteTimer = setTimeout(() => { bClass.deleteMe = true; chocola.camMode = 0; chocola.reloadCannon(); chocola.prepareShot() }, 1500)
        }

        if (chocola.camMode == 2) {
            chocola.scene.updateMatrixWorld()
            let newCamPos = new THREE.Vector3(0, 0, 0)
            this.cam.getWorldPosition(newCamPos)
            chocola.camera.position.set(newCamPos.x, newCamPos.y, newCamPos.z)

            chocola.camera.lookAt(c.getWorldPosition(new THREE.Vector3(1, 1, 1)))
        }
    }

    fallDown() {
        this.cont.position.y -= 1
    }
}