console.log('Cannon loaded')

class Cannon {
    constructor(slot) {
        let color
        let position
        if (slot == 'cl0') {
            color = 0xFF0000
            position = new THREE.Vector3(-100, 0, 0)
        } else {
            color = 0x00FF00
            position = new THREE.Vector3(100, 0, 0)
        }

        this.cont = new THREE.Object3D()
        this.barrelAngle = 45
        this.cannonAngle = 0

        let wheelGeo = new THREE.CylinderGeometry(20, 20, 10, 16)
        let wheelMat = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: false,
            opacity: 0.5,
            transparent: true
        })

        let frameMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true
        })

        let barrelGeo = new THREE.CylinderGeometry(10, 10, 50, 16)
        let barrelMat = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: false,
            opacity: 0.5,
            transparent: true
        })

        this.wheelLeft = new THREE.Mesh(wheelGeo, wheelMat)
        this.wheelRight = new THREE.Mesh(wheelGeo, wheelMat)
        this.barrel = new THREE.Mesh(barrelGeo, barrelMat)
        this.tip = new THREE.Object3D()
        this.cam = new THREE.Object3D()

        let frameLeft = new THREE.Mesh(wheelGeo, frameMat)
        let frameRight = new THREE.Mesh(wheelGeo, frameMat)
        let frameBarrel = new THREE.Mesh(barrelGeo, frameMat)

        this.wheelLeft.position.set(15, 0, 0)
        this.wheelLeft.rotation.set(0, 0, Math.PI / 2)

        this.wheelRight.position.set(-15, 0, 0)
        this.wheelRight.rotation.set(0, 0, Math.PI / 2)

        barrelGeo.translate(0, 20, 0)

        this.tip.position.set(0, 45, 0)
        this.cam.position.set(0, -150, 0)

        this.barrel.add(this.tip)
        this.barrel.add(this.cam)

        this.wheelLeft.add(frameLeft)
        this.wheelRight.add(frameRight)
        this.barrel.add(frameBarrel)

        this.cont.add(this.wheelLeft)
        this.cont.add(this.wheelRight)
        this.cont.add(this.barrel)
        this.cont.position.set(position.x, position.y, position.z)
        this.cont.translateOnAxis(new THREE.Vector3(0, 1, 0), 20)
    }

    setBarrelAngle(angle) {
        this.barrelAngle = angle
        let rad = angle * (Math.PI / 180)
        this.barrel.rotation.set(rad, 0, 0)
    }

    setRotation(angle) {
        this.cannonAngle = parseFloat(angle)
        let rad = angle * (Math.PI / 180)
        this.cont.rotation.set(0, rad, 0)
        this.wheelLeft.rotation.set(-rad, 0,  Math.PI / 2)
        this.wheelRight.rotation.set(rad, 0, Math.PI / 2)
    }
}