console.log('Main loaded')

class Main {
    constructor() {
        this.gravConst = 9.81
        this.gravMulti = 1
        this.shotPower = 50
        this.ballInFlight = false
        this.flightTime = 0
        this.barrelAngle = 45

        this.shotParams = {}

        this.gameClock = new THREE.Clock()

        var scene = new THREE.Scene()
        this.scene = scene

        var winWidth = $(window).width()
        var winHeight = $(window).height()

        var camera = new THREE.PerspectiveCamera(45, winWidth / winHeight, 0.1, 10000)
        this.camera = camera

        var renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setClearColor(0xAAAAAA)
        /* new THREE.TextureLoader().load('textures/background.jpg', function (texture) {
            scene.background = texture
        }) */
        renderer.setSize(winWidth, winHeight)


        var orbitControl = new THREE.OrbitControls(camera, renderer.domElement)
        orbitControl.addEventListener('change', function () {
            renderer.render(scene, camera)
        })



        $("#root").append(renderer.domElement)

        this.camera.position.set(200, 200, 200)
        camera.lookAt(scene.position)

        let tempLight = new THREE.PointLight(0xffffff, 1, 100)
        tempLight.position.set(50, 50, 50)
        scene.add(tempLight)

        let axes = new THREE.AxesHelper(2000)
        scene.add(axes)

        let grid = new Grid(20000, 2000)
        scene.add(grid)

        this.canObj = new Cannon()
        let cannon = this.canObj.cont
        scene.add(cannon)

        this.ballObj = new Ball()
        let ball = this.ballObj.ball
        scene.add(ball)

        this.cannonAngle(45)

        let main = this

        $(window).resize(function () {
            winWidth = $(window).width()
            winHeight = $(window).height()
            camera.aspect = winWidth / winHeight
            camera.updateProjectionMatrix()
            renderer.setSize(winWidth, winHeight)
        })

        function render() {
            main.ballistics()
            requestAnimationFrame(render)

            renderer.render(scene, camera)
        }

        render()
    }

    ballistics() {
        if (this.ballInFlight) {
            this.flightTime = (Date.now() - this.shotDate) / 500

            let originPos = new THREE.Vector3()
            this.canObj.tip.getWorldPosition(originPos)

            this.cannonDir = new THREE.Vector3(1, 1, 1)
            this.canObj.cont.getWorldDirection(this.cannonDir)

            let radAngle = this.barrelAngle * (Math.PI / 180)

            let scaledTime = this.flightTime
            let scaledGrav = this.gravConst * this.gravMulti

            let x = this.shotPower * scaledTime * Math.cos(radAngle) * this.cannonDir.x
            let y = this.shotPower * scaledTime * Math.sin(radAngle) - ((scaledGrav * scaledTime * scaledTime) / 2)
            let z = this.shotPower * scaledTime * Math.cos(radAngle) * this.cannonDir.z

            let newBallPos = new THREE.Vector3(x, y, z)
            newBallPos.add(originPos)

            this.ballObj.ball.position.x = newBallPos.x
            this.ballObj.ball.position.y = newBallPos.y
            this.ballObj.ball.position.z = newBallPos.z

            console.log(scaledTime)
            console.log(originPos)
            console.log(this.cannonDir)
            console.log(radAngle)
            console.log(scaledGrav)
            console.log(newBallPos)

            if (this.ballObj.ball.position.y <= 0) {
                setTimeout(() => {
                    this.ballInFlight = false
                    this.prepareShot()
                }, 500)
            }
        }
    }

    prepareShot() {
        if (!this.ballInFlight) {
            this.scene.updateMatrixWorld()
            let newBallPos = new THREE.Vector3(0, 0, 0)
            this.canObj.tip.getWorldPosition(newBallPos)
            this.ballObj.ball.position.set(newBallPos.x, newBallPos.y, newBallPos.z)
        } else {
            console.warn('prepareShort() aborted, shot in progress')
        }
    }

    cannonAngle(value) {
        this.barrelAngle = value
        this.canObj.setBarrelAngle(Math.abs(value - 90))

        this.prepareShot()
    }

    cannonRotate(value) {
        this.canObj.setRotation(value)

        this.prepareShot()
    }

    cannonPower(value) {
        this.shotPower = value
    }

    setGravMulti(value) {
        this.gravMulti = value
    }

    cannonFire() {
        if (!this.ballInFlight) {
            this.ballInFlight = true
            this.shotDate = Date.now()
        }
    }
}