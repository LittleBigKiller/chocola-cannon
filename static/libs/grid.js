class Grid {
    constructor(size, divisions) {
        this.size = size
        this.divisions = divisions
        this.gridHelper = new THREE.GridHelper(this.size, this.divisions)
        return this.gridHelper
    }
}