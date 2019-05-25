console.log('Wall loaded')

class Wall {
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
        renderer.setSize(winWidth, winHeight)

        $("#root").append(renderer.domElement)

        this.camera.position.set(0, 150, -400)
        camera.lookAt(new THREE.Vector3(0, 150, 0))

        let tempLight = new THREE.PointLight(0xffffff, 1, 100)
        tempLight.position.set(50, 50, 50)
        scene.add(tempLight)

        let grid = new Grid(20000, 2000)
        scene.add(grid)

        this.spawnWall(6, 6, 50)

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
            let inter = raycaster.intersectObjects(scene.children, true)

            if (inter.length > 0) {
                if (inter[0].object.name == "brick") {

                    let tb = inter[0].object.class
                    let wc = this.wColumns

                    if (tb.nothit) {
                        tb.gotHit()

                        for (let i in wc) {
                            let index = wc[i].indexOf(tb)
                            if (index != -1)
                                wc[i].splice(index, 1)
                        }
                    }
                }
            }
        })
        $('#root').on('mouseup', e => {
            $('#root').off('mousemove')
        })

        function render() {
            main.brickMovement()
            requestAnimationFrame(render)

            renderer.render(scene, camera)
        }

        render()
    }

    //#region WALL
    spawnWall(width, height, brickSize) {
        this.wall = new THREE.Object3D()
        this.wColumns = []
        this.bricks = []

        let brickOffset = brickSize * width / 2 - brickSize / 2

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
        this.wall.position.set(0, 0, 0)
        this.scene.add(this.wall)
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
                b.splice(b.indexOf(b[i]), 1)
            }
        }
    }
    //#endregion


    reloadCannon() {
    }

    prepareShot() {
    }
}