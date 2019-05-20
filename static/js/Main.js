console.log('Main loaded')

class Main {
    constructor() {
        this.gravConst = 9.81

        this.balls = []
        this.empty = true

        var scene = new THREE.Scene()
        this.scene = scene

        var winWidth = $(window).width()
        var winHeight = $(window).height()

        var camera = new THREE.PerspectiveCamera(45, winWidth / winHeight, 0.1, 10000)
        this.camera = camera

        var renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setClearColor(0x7F7F7F)
        /* new THREE.TextureLoader().load('textures/background.jpg', function (texture) {
            scene.background = texture
        }) */
        renderer.setSize(winWidth, winHeight)


        var orbitControl = new THREE.OrbitControls(camera, renderer.domElement)
        orbitControl.addEventListener('change', function () {
            renderer.render(scene, camera)
        })



        $("#root").append(renderer.domElement)

        this.camera.position.set(500, 500, -500)
        camera.lookAt(scene.position)

        let tempLight = new THREE.PointLight(0xffffff, 1, 100)
        tempLight.position.set(50, 50, 50)
        scene.add(tempLight)

        /* let axes = new THREE.AxesHelper(2000)
        scene.add(axes) */

        let grid = new Grid(20000, 2000)
        scene.add(grid)

        this.canObj = new Cannon()
        let cannon = this.canObj.cont
        scene.add(cannon)

        this.reloadCannon()

        this.cannonAngle(45)

        let main = this

        $(window).resize(function () {
            winWidth = $(window).width()
            winHeight = $(window).height()
            camera.aspect = winWidth / winHeight
            camera.updateProjectionMatrix()
            renderer.setSize(winWidth, winHeight)
        })

        this.cannonAngle($('#rng-barrel').val())
        this.cannonRotate($('#rng-rotat').val())
        this.cannonPower($('#rng-power').val())
        this.setGravMulti($('#rng-grav').val())
        this.setBallTime($('#rng-btime').val())

        function render() {
            main.ballistics()
            requestAnimationFrame(render)

            renderer.render(scene, camera)
        }

        render()
    }

    ballistics() {
        for (let i in this.balls) {
            let ball = this.balls[i]
            if (ball.isFlying) {
                let flightTime = (Date.now() - ball.shotTime) / 500

                let originPos = ball.origin
                let cannonDir = ball.cannonAngle
                let radAngle = ball.barrelAngle * (Math.PI / 180)

                let scaledGrav = this.gravConst * ball.gMulti

                let x = ball.power * flightTime * Math.cos(radAngle) * cannonDir.x
                let y = ball.power * flightTime * Math.sin(radAngle) - ((scaledGrav * flightTime * flightTime) / 2)
                let z = ball.power * flightTime * Math.cos(radAngle) * cannonDir.z

                let newBallPos = new THREE.Vector3(x, y, z)
                newBallPos.add(originPos)

                ball.ball.position.x = newBallPos.x
                ball.ball.position.y = newBallPos.y
                ball.ball.position.z = newBallPos.z

                if (ball.ball.position.y < 0) {
                    ball.ball.position.y = 0

                    if (!ball.marked) {
                        ball.marked = true
                        console.warn('-- TRIGGER HIT EFFECT HERE --')
                        setTimeout(() => {
                            this.balls.splice(this.balls.indexOf(ball), 1)
                            this.scene.remove(ball.ball)
                        }, ball.lifetime)
                    }
                }
            }
        }
    }

    prepareShot() {
        if (this.balls.length != 0) {
            this.scene.updateMatrixWorld()
            let newBallPos = new THREE.Vector3(0, 0, 0)
            this.canObj.tip.getWorldPosition(newBallPos)
            this.balls[this.balls.length - 1].ball.position.set(newBallPos.x, newBallPos.y, newBallPos.z)
        }
    }

    cannonAngle(value) {
        this.barrelAngle = value
        this.canObj.setBarrelAngle(Math.abs(value - 90))

        $('#lbl-barrel').html('Barrel angle: ' + value)

        this.prepareShot()
    }

    cannonRotate(value) {
        this.canObj.setRotation(value)

        $('#lbl-rotat').html('Cannon Rotation: ' + value)

        this.prepareShot()
    }

    cannonPower(value) {
        this.shotPower = value

        $('#lbl-power').html('Shot Power: ' + value)
    }

    setGravMulti(value) {
        this.gravMulti = value

        $('#lbl-grav').html('Gravity Multiplier: ' + value)
    }

    setBallTime(value) {
        this.ballTime = value

        $('#lbl-btime').html('Ball Time: ' + value)
    }

    cannonFire() {
        if (this.empty) {
            this.reloadCannon()
            $('#button-fire').html('FIRE!').removeClass('reload')
        } else {
            this.balls[this.balls.length - 1].shot(Date.now(), this.barrelAngle, this.canObj.cont.getWorldDirection(new THREE.Vector3(1, 1, 1)), this.shotPower, this.gravMulti, this.canObj.tip.getWorldPosition(new THREE.Vector3(1, 1, 1)), this.ballTime)
            $('#button-fire').html('RELOAD!').addClass('reload')
            this.empty = true
            console.warn('-- TRIGGER FIRE EFFECT HERE --')
        }
    }

    reloadCannon() {
        let empty = true
        for (let i in this.balls) {
            if (!this.balls[i].isFlying) empty = false
        }

        if (empty) {
            let ballObj = new Ball()
            this.balls.push(ballObj)
            let ball = ballObj.ball
            this.scene.add(ball)

            this.prepareShot()
            this.empty = false
        }
    }
}