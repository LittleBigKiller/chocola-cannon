console.log('Main loaded')

class Main {
    constructor() {
        this.gravConst = 9.81

        this.balls = []
        this.empty = true

        this.othBalls = []
        this.othEmpty = true

        this.camMode = 0 // 0 - behind cannon, 1 - following the ball, 2 - following the chunk

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


        /* var orbitControl = new THREE.OrbitControls(camera, renderer.domElement)
        orbitControl.addEventListener('change', function () {
            renderer.render(scene, camera)
        }) */

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

        this.spawnWall(10, 10, 50)

        let main = this

        $(window).resize(function () {
            winWidth = $(window).width()
            winHeight = $(window).height()
            camera.aspect = winWidth / winHeight
            camera.updateProjectionMatrix()
            renderer.setSize(winWidth, winHeight)
        })

        $('#root').on('mousedown', e => {
            let raycaster = new THREE.Raycaster()
            let mouseVector = new THREE.Vector2()

            mouseVector.x = (e.clientX / $(window).width()) * 2 - 1
            mouseVector.y = -(e.clientY / $(window).height()) * 2 + 1
            raycaster.setFromCamera(mouseVector, camera)
            let inter = raycaster.intersectObjects(this.canObj.cont.children, true)

            if (inter.length > 0) {
                if (inter[0].object.name == "barrel") {
                    this.canObj.barrel.highlight()

                    $('#root').on('mousemove', e => {
                        let bAngle = parseInt(this.canObj.barrelAngle)
                        let cAngle = parseInt(this.canObj.cannonAngle)

                        if (e.clientY - $(window).height() / 2 > 20) {
                            if (bAngle < 90)
                                this.cannonAngle(bAngle += 1)
                        }
                        if (e.clientY - $(window).height() / 2 < -20) {
                            if (bAngle > 0) {
                                this.cannonAngle(bAngle -= 1)
                            }
                        }
                        if (e.clientX - $(window).width() / 2 > 20) {
                            this.cannonRotate(cAngle -= 1)
                        }
                        if (e.clientX - $(window).width() / 2 < -20) {
                            this.cannonRotate(cAngle += 1)
                        }
                    })
                }
            }
        })
        $('#root').on('mouseup', e => {
            $('#root').off('mousemove')
            this.canObj.barrel.lowlight()
        })

        function render() {
            main.ballistics()
            main.brickMovement()
            requestAnimationFrame(render)

            renderer.render(scene, camera)
        }

        render()
    }

    //#region CANNON DISPLAY
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
    //#endregion

    //#region WALL
    spawnWall(width, height, brickSize) {
        this.wall = new THREE.Object3D()
        this.wColumns = []
        this.bricks = []

        let brickOffset = brickSize * width / 2

        for (let i = 0; i < width; i++) {
            let column = []
            for (let j = 0; j < height; j++) {
                let b = new Brick(brickSize)
                b.cont.position.x = i * brickSize - brickOffset
                b.cont.position.y = j * brickSize
                b.cont.position.z = 0
                this.wall.add(b.cont)
                column.push(b)
                this.bricks.push(b)
            }
            this.wColumns.push(column)
        }
        this.wall.position.set(0, 0, 1000)
        this.scene.add(this.wall)
    }

    spawnTestBrick(posX, posZ, size) {
        this.testBrick = new Brick(size)
        this.scene.add(this.testBrick.cont)
        this.testBrick.cont.position.x = posX
        this.testBrick.cont.position.z = posZ
    }

    brickMovement() {
        let wc = this.wColumns
        let b = this.bricks

        for (let i in wc) {
            for (let j in wc[i]) {
                if (wc[i][j].cont.position.y > wc[i][j].size * j) {
                    wc[i][j].fallDown()
                }
            }
        }

        for (let i in b) {
            if (!b[i].nothit) {
                b[i].handleHit()
            }
            if (b[i].deleteMe) {
                this.wall.remove(b[i].cont)
                b.splice(i, 1)
            }
        }
    }
    //#endregion

    //#region BALL
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

                ball.cont.position.x = newBallPos.x
                ball.cont.position.y = newBallPos.y
                ball.cont.position.z = newBallPos.z

                if (this.camMode == 1) {
                    this.scene.updateMatrixWorld()
                    let newCamPos = new THREE.Vector3(0, 0, 0)
                    ball.cam.getWorldPosition(newCamPos)
                    this.camera.position.set(newCamPos.x, newCamPos.y, newCamPos.z)

                    this.camera.lookAt(ball.cont.getWorldPosition(new THREE.Vector3(1, 1, 1)))
                }

                let wc = this.wColumns

                for (let i in wc) {
                    for (let j in wc[i]) {
                        let tb = wc[i][j]
                        let tbPos = tb.cont.getWorldPosition(new THREE.Vector3(0, 0, 0))
                        if ((newBallPos.x > tbPos.x - tb.size / 2) && (newBallPos.x < tbPos.x + tb.size / 2)) {
                            if ((newBallPos.z > tbPos.z - tb.size / 2) && (newBallPos.z < tbPos.z + tb.size / 2)) {
                                if ((newBallPos.y > tbPos.y) && (newBallPos.y < tbPos.y + tb.size)) {
                                    if (tb.nothit) {
                                        tb.gotHit()
                                        wc[i].splice(wc[i].indexOf(tb), 1)

                                        this.camMode = 2
                                        ball.marked = true
                                        setTimeout(() => {
                                            this.balls.splice(this.balls.indexOf(ball), 1)
                                            this.scene.remove(ball.cont)
                                        }, ball.lifetime)
                                    }
                                }
                            }
                        }
                    }
                }

                if (ball.cont.position.y < 0) {
                    ball.cont.position.y = 0

                    if (!ball.marked) {
                        ball.marked = true
                        console.warn('-- TRIGGER HIT EFFECT HERE --')
                        setTimeout(() => {
                            this.balls.splice(this.balls.indexOf(ball), 1)
                            this.scene.remove(ball.cont)
                            if (this.camMode == 1) {
                                this.camMode = 0
                            }
                            this.reloadCannon()
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

                ball.cont.position.x = newBallPos.x
                ball.cont.position.y = newBallPos.y
                ball.cont.position.z = newBallPos.z

                if (ball.cont.position.y < 0) {
                    ball.cont.position.y = 0

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
            balls[balls.length - 1].cont.position.set(newBallPos.x, newBallPos.y, newBallPos.z)

            balls[balls.length - 1].cont.rotation.x = 0
            balls[balls.length - 1].cont.rotation.y = 0
            balls[balls.length - 1].cont.rotation.z = 0
        }

        if (cannon == this.canObj && this.camMode == 0) {
            this.balls[this.balls.length - 1].setRotation(cannon.cannonAngle)

            this.scene.updateMatrixWorld()
            let newCamPos = new THREE.Vector3(0, 0, 0)
            cannon.cam.getWorldPosition(newCamPos)
            this.camera.position.set(newCamPos.x, newCamPos.y, newCamPos.z)
            this.camera.lookAt(cannon.barrel.getWorldPosition(new THREE.Vector3(1, 1, 1)))
        }
    }
    //#endregion

    //#region CANNON WORKINGS
    cannonAngle(value, cannon = this.canObj) {
        this.barrelAngle = value
        cannon.setBarrelAngle(value)

        this.prepareShot(cannon)

        if (cannon == this.canObj) {
            $('#lbl-barrel').html('Barrel angle: ' + value)
            net.client.emit('bAngle', { bAngle: value })
        }
    }

    cannonRotate(value, cannon = this.canObj) {
        if (value < 0) value += 360
        if (value > 360) value -= 360

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
        if (!this.empty) {
            this.balls[this.balls.length - 1].shot(Date.now(), this.barrelAngle, this.canObj.cont.getWorldDirection(new THREE.Vector3(1, 1, 1)), this.shotPower, this.gravMulti, this.canObj.tip.getWorldPosition(new THREE.Vector3(1, 1, 1)), this.ballTime)
            $('#button-fire').html('WAIT!').addClass('reload')
            this.empty = true
            console.warn('-- TRIGGER FIRE EFFECT HERE --')

            this.camMode = 1

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

        if (empty && balls.length == 0) {
            let ballObj = new Ball()
            balls.push(ballObj)
            let ball = ballObj.cont
            this.scene.add(ball)

            $('#button-fire').html('FIRE!').removeClass('reload')
            net.client.emit('reload')

            this.prepareShot(cannon)
            if (cannon == this.canObj)
                this.empty = false
            else
                this.othEmpty = false
        }
    }
    // #endregion
}