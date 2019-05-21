var http = require('http')
var qs = require('querystring')
var fs = require('fs')

var connectedClients = {
    cl0: null,
    cl1: null
}

var PORT = 5500

var server = http.createServer(function (req, res) {
    /* console.log(req.method + ' ' + req.url) */
    switch (req.method) {
        case 'GET':
            getResponse(req, res)
            break
        case 'POST':
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
            postResponse(req, res)
            break
    }
})

server.listen(PORT, function () {
    console.log('serwer startuje na porcie ' + PORT)
})

var io = require("socket.io")(server)

function getResponse(req, res) {
    if (req.url === '/favicon.ico') {
        fs.readFile(__dirname + '/static/img/logo.png', function (error, data) {
            res.writeHead(200, { 'Content-type': 'image/png; charset=utf-8' })
            res.write(data)
            res.end()
        })
    } else if (req.url.indexOf('.js') != -1) {
        fs.readFile(__dirname + '/static/' + decodeURI(req.url), function (error, data) {
            res.writeHead(200, { 'Content-type': 'text/javascript; charset=utf-8' })
            res.write(data)
            res.end()
        })
    } else if (req.url.indexOf('.css') != -1) {
        fs.readFile(__dirname + '/static/' + decodeURI(req.url), function (error, data) {
            res.writeHead(200, { 'Content-type': 'text/css; charset=utf-8' })
            res.write(data)
            res.end()
        })
    } else if (req.url.indexOf('.png') != -1) {
        fs.readFile(__dirname + '/static/' + decodeURI(req.url), function (error, data) {
            res.writeHead(200, { 'Content-type': 'image/png; charset=utf-8' })
            res.write(data)
            res.end()
        })
    } else if (req.url.indexOf('.jpg') != -1) {
        fs.readFile(__dirname + '/static/' + decodeURI(req.url), function (error, data) {
            res.writeHead(200, { 'Content-type': 'image/jpg; charset=utf-8' })
            res.write(data)
            res.end()
        })
    } else {
        fs.readFile(__dirname + '/static/index.html', function (error, data) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.write(data)
            res.end()
        })
    }
}

function postResponse(req, res) {
    var reqData = '';
    var resData = {}

    req.on('data', function (data) {
        reqData += data;
    })

    req.on('end', function () {
        reqData = qs.parse(reqData)
        if (reqData.action == 'LOGIN') {
            let resData = { id: -1 }
            if (activeUsers.length == 2) {
                resData.header = 'GAME_FULL'
            } else if (activeUsers.includes(reqData.username)) {
                resData.header = 'NAME_TAKEN'
            } else {
                resData.id = activeUsers.length
                activeUsers.push(reqData.username)
                resData.header = 'USER_ADDED'
                pawnTable = [
                    [2, 0, 2, 0, 2, 0, 2, 0],
                    [0, 2, 0, 2, 0, 2, 0, 2],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 1, 0, 1, 0, 1, 0],
                    [0, 1, 0, 1, 0, 1, 0, 1],
                ]
            }
            /* console.log(resData) */
            res.end(JSON.stringify(resData))
        } else {
            console.error('Invalid request -- ' + reqData.action)
        }
    })
}

io.sockets.on('connection', function (client) {
    console.log('klient podłączony: ' + client.id)

    let slot = null
    if (connectedClients.cl0 == null) {
        connectedClients.cl0 = client.id
        slot = 'cl0'
        client.broadcast.emit('anotherConnected')
    } else if (connectedClients.cl1 == null) {
        connectedClients.cl1 = client.id
        slot = 'cl1'
        client.broadcast.emit('anotherConnected')
    } else {
        client.emit('BTFO')
        client.disconnect(true)
    }
    console.log(connectedClients)

    let alone = true
    if (connectedClients.cl0 && connectedClients.cl1) {
        alone = false
    }

    client.emit('onconnect', {
        clientName: client.id,
        alone: alone,
        slot: slot
    })

    client.on('disconnect', function () {
        console.log('klient rozłączony: ' + client.id)
        if (connectedClients.cl0 == client.id) {
            connectedClients.cl0 = null
            io.sockets.emit('alone')
        } else if (connectedClients.cl1 == client.id) {
            connectedClients.cl1 = null
            io.sockets.emit('alone')
        }
        console.log(connectedClients)
    })

    client.on('shot', function () {
        console.log(client.id + ': shot')
        client.broadcast.emit('shot')
    })
})