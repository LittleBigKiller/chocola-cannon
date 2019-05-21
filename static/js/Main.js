console.log('Main loaded')

class Main {
    constructor() {
        this.gravConst = 9.81

        this.balls = []
        this.empty = true

        this.othBalls = []
        this.othEmpty = true

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

    spawnCannons(slot) {
        this.canObj = new Cannon(slot)
        let cannon = this.canObj.cont
        this.scene.add(cannon)

        this.reloadCannon()
        this.cannonAngle($('#rng-barrel').val())
        this.cannonRotate($('#rng-rotat').val())
        this.cannonPower($('#rng-power').val())
        this.setGravMulti($('#rng-grav').val())
        this.setBallTime($('#rng-btime').val())

        let othSlot = null
        if (slot == 'cl1') othSlot = 'cl0'
        else othSlot = 'cl1'

        this.othCan = new Cannon(othSlot)
        let cannon1 = this.othCan.cont
        this.scene.add(cannon1)
    }

    showOther(boolean) {
        this.othCan.cont.visible = boolean

        for (let i in this.othBalls) {
            this.othBalls[i].cont.visible = boolean
        }
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
                            this.scene.remove(ball.cont)
                        }, ball.lifetime)
                    }
                }
            }
        }

        for (let i in this.othBalls) {
            let ball = this.othBalls[i]
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
                            this.othBalls.splice(this.othBalls.indexOf(ball), 1)
                            this.scene.remove(ball.cont)
                        }, ball.lifetime)
                    }
                }
            }
        }
    }

    prepareShot(cannon = this.canObj) {
        let balls = this.balls
        if (cannon != this.canObj) balls = this.othBalls

        if (balls.length != 0) {
            this.scene.updateMatrixWorld()
            let newBallPos = new THREE.Vector3(0, 0, 0)
            cannon.tip.getWorldPosition(newBallPos)
            balls[balls.length - 1].ball.position.set(newBallPos.x, newBallPos.y, newBallPos.z)
        }
    }

    cannonAngle(value, cannon = this.canObj) {
        this.barrelAngle = value
        cannon.setBarrelAngle(Math.abs(value - 90))

        this.prepareShot(cannon)

        if (cannon == this.canObj) {
            $('#lbl-barrel').html('Barrel angle: ' + value)
            net.client.emit('bAngle', { bAngle: value })
        }
    }

    cannonRotate(value, cannon = this.canObj) {
        cannon.setRotation(value)

        this.prepareShot(cannon)

        if (cannon == this.canObj) {
            $('#lbl-rotat').html('Cannon Rotation: ' + value)
            net.client.emit('cAngle', { cAngle: value })
        }
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

            net.client.emit('reload')
        } else {
            this.balls[this.balls.length - 1].shot(Date.now(), this.barrelAngle, this.canObj.cont.getWorldDirection(new THREE.Vector3(1, 1, 1)), this.shotPower, this.gravMulti, this.canObj.tip.getWorldPosition(new THREE.Vector3(1, 1, 1)), this.ballTime)
            $('#button-fire').html('RELOAD!').addClass('reload')
            this.empty = true
            console.warn('-- TRIGGER FIRE EFFECT HERE --')

            net.client.emit('shot', {
                time: Date.now(),
                bAngle: this.barrelAngle,
                cAngle: this.canObj.cont.getWorldDirection(new THREE.Vector3(1, 1, 1)),
                power: this.shotPower,
                gMulti: this.gravMulti,
                origin: this.canObj.tip.getWorldPosition(new THREE.Vector3(1, 1, 1)),
                lifetime: this.ballTime
            })
        }
    }

    cannonNetFire(data) {
        this.othBalls[this.othBalls.length - 1].shot(data.time, data.bAngle, data.cAngle, data.power, data.gMulti, data.origin, data.lifetime)
        this.othEmpty = true
        console.warn('-- TRIGGER FIRE EFFECT HERE --')
    }

    reloadCannon(cannon = this.canObj) {
        let balls = this.balls
        if (cannon != this.canObj) balls = this.othBalls

        let empty = true
        for (let i in balls) {
            if (!balls[i].isFlying) empty = false
        }

        if (empty) {
            let ballObj = new Ball()
            balls.push(ballObj)
            let ball = ballObj.cont
            this.scene.add(ball)

            this.prepareShot(cannon)
            if (cannon == this.canObj)
                this.empty = false
            else
                this.othEmpty = false
        }
    }
}