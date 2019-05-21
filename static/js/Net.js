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
        })

        this.client.on('anotherConnected', function () {
            console.log('multiple now')
        })

        this.client.on('alone', function () {
            console.log('solo again')
        })

        this.client.on('shot', function () {
            console.log('net shot')
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