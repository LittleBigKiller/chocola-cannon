console.log('Main loaded')

class Main {
    constructor() {
        this.Cannon = new Cannon()
        this.Ball = new Ball()

        this.draw()
    }

    draw() {
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

        let grid = new Grid(2000, 200)
        scene.add(grid)

        this.canObj = new Cannon()
        let cannon = this.canObj.getCannon()
        scene.add(cannon)

        this.ballObj = new Ball()
        let ball = this.ballObj.getBall()
        scene.add(ball)

        function render() {
            requestAnimationFrame(render)

            renderer.render(scene, camera)
        }

        $(window).resize(function () {
            winWidth = $(window).width()
            winHeight = $(window).height()
            camera.aspect = winWidth / winHeight
            camera.updateProjectionMatrix()
            renderer.setSize(winWidth, winHeight)
        })

        render()
    }

    cannonAngle(value) {
        this.canObj.setAngle(Math.abs(value - 90))
        let newBallPos = this.canObj.tip.getWorldPosition()
        console.log(newBallPos)
        this.ballObj.getBall().position.set(newBallPos.x, newBallPos.y, newBallPos.z)
        console.log(this.ballObj.getBall().position)
    }
}