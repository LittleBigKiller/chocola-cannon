console.log('Net loaded')

class Net {
    constructor() {
        this.client = io()

        this.client.on('onconnect', function (data) {
            console.log('my slot: ' + data.slot)
            chocola.spawnCannons(data.slot)
            if (data.alone) {
                console.log('solo')
                chocola.showOther(false)
            } else {
                console.log('multiple')
                chocola.showOther(true)
                net.client.emit('bAngle', {bAngle: $('#rng-barrel').val()})
                chocola.reloadCannon(chocola.othCan)
            }
        })

        this.client.on('anotherConnected', function () {
            console.log('multiple now')
            chocola.showOther(true)
            net.client.emit('bAngle', {bAngle: $('#rng-barrel').val()})
            chocola.reloadCannon(chocola.othCan)
        })

        this.client.on('alone', function () {
            console.log('solo again')
            chocola.showOther(false)
        })

        this.client.on('shot', function (data) {
            console.log('net shot')
            chocola.cannonNetFire(data)
        })

        this.client.on('bAngle', function (data) {
            console.log('net bAngle')
            chocola.cannonAngle(data.bAngle, chocola.othCan)
        })

        this.client.on('cAngle', function (data) {
            console.log('net cAngle')
            chocola.cannonRotate(data.cAngle, chocola.othCan)
        })

        this.client.on('reload', function () {
            console.log('net reload')
            chocola.reloadCannon(chocola.othCan)
        })

        this.client.on('BTFO', function () {
            console.log('BTFO\'d')
            window.alert('GAME FULL\n\nTry again later')
            window.location = '/'
        })
    }
}