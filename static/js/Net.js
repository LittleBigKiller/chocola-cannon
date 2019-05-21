console.log('Net loaded')

class Net {
    constructor() {
        this.client = io()

        this.client.on('onconnect', function (data) {
            if (data.alone) {
                console.log('solo')
            } else {
                console.log('multiple')
            }
            console.log('my slot: ' + data.slot)
            chocola.spawnCannons(data.slot)
        })

        this.client.on('anotherConnected', function () {
            console.log('multiple now')
            chocola.showOther(true)
        })

        this.client.on('alone', function () {
            console.log('solo again')
            chocola.showOther(false)
        })

        this.client.on('shot', function (data) {
            console.log('net shot')
            console.log(data)
        })

        this.client.on('bAngle', function (data) {
            console.log('net bAngle')
            console.log(data)
            chocola.cannonAngle(data.bAngle, chocola.othCan)
        })

        this.client.on('cAngle', function (data) {
            console.log('net cAngle')
            console.log(data)
            chocola.cannonRotate(data.cAngle, chocola.othCan)
        })

        this.client.on('reload', function () {
            console.log('net reload')
        })

        this.client.on('BTFO', function () {
            console.log('BTFO\'d')
            window.alert('GAME FULL\n\nTry again later')
            window.location = '/'
        })
    }
}