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
}