console.log('Cannon loaded')

class Cannon {
    constructor() {
        this.cont = new THREE.Object3D()
        this.barrelAngle = 45
        this.cannonAngle = 0
        
        let wheelGeo = new THREE.CylinderGeometry(20, 20, 10, 8)
        let wheelMat = new THREE.MeshBasicMaterial({
            color: 0xCF7F2F,
            wireframe: true
        })

        let barrelGeo = new THREE.CylinderGeometry(10, 10, 50, 8)
        let barrelMat = new THREE.MeshBasicMaterial({
            color: 0x7F7F7F,
            wireframe: true
        })

        let wheelLeft = new THREE.Mesh(wheelGeo, wheelMat)
        let wheelRight = new THREE.Mesh(wheelGeo, wheelMat)
        this.barrel = new THREE.Mesh(barrelGeo, barrelMat)
        this.tip = new THREE.Object3D()

        wheelLeft.position.set(15, 0, 0)
        wheelLeft.rotation.set(0, 0, Math.PI / 2)

        wheelRight.position.set(-15, 0, 0)
        wheelRight.rotation.set(0, 0, Math.PI / 2)

        barrelGeo.translate(0, 20, 0)

        this.tip.position.set(0, 45, 0)

        this.barrel.add(this.tip)

        this.cont.add(wheelLeft)
        this.cont.add(wheelRight)
        this.cont.add(this.barrel)
        this.cont.translateOnAxis(new THREE.Vector3(0, 1, 0), 20)
    }

    setBarrelAngle(angle) {
        this.barrelAngle = angle
        let rad = angle * (Math.PI / 180)
        this.barrel.rotation.set(rad, 0, 0)
    }

    setRotation(angle) {
        this.cannonAngle = angle
        let rad = angle * (Math.PI / 180)
        this.cont.rotation.set(0, rad, 0)
    }
}