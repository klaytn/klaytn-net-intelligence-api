'use strict';
var _ = require('lodash');
var nodeModel = require('./lib/node');
var devp2p = require('devp2p');
var request = require('request');
var app_json = require('./app.json')

const PRIVATE_KEY = 'd772e3d6a001a38064dd23964dd2836239fa0e6cec8b28972a87460a17210fe9'
var bootstrapNodes;
if(!_.isUndefined(process.env.BOOTNODES)) {
    bootstrapNodes = process.env.BOOTNODES.split(',')
} else {
    bootstrapNodes = app_json.env.BOOTNODES.trim().split(',')
}

const BOOTNODES = bootstrapNodes.map((bootnode_ip) => {
    return {
	    address: bootnode_ip,
	    udpPort: process.env.BOOTNODE_PORT || app_json.env.BOOTNODE_PORT,
	    tcpPort: process.env.BOOTNODE_PORT || app_json.env.BOOTNODE_PORT,
    }
});

const dpt = new devp2p.DPT(Buffer.from(PRIVATE_KEY, 'hex'), {
    endpoint: {
	address: '0.0.0.0',
	udpPort: null,
	tcpPort: null,
    type: 3,
    },
});

var nodeList = {};
var nodeCount = 0;
dpt.on('peer:added', (peer) => {
    if (peer.address in nodeList) {
        console.info("node count", nodeCount)
	    return
    }
    checkRPC(peer, (peer, rpcPort, onRpc) => {
        nodeCount++;
        if(onRpc) {
            console.info("conn:rpc", "peer added: ", peer);
            nodeList[peer.address] = new nodeModel(peer.address, rpcPort, onRpc, dpt);
        } //else {
        //     console.info("conn:p2p", "peer added ", peer)
        //     nodeList[peer.address] = new nodeModel(peer.address, peer.tcpPort, onRpc)
        // }
    });
})
dpt.on('peer:removed', (peer) => {
    if (peer.address in nodeList) {
        nodeList[peer.address].stop();
	    delete nodeList[peer.address];
        nodeCount--;
    }
})
dpt.on('error', (error) => {
    console.error('error occured from dpt', 'error:', error)
})

function checkRPC(peer, cb) {
    let headers = {
        'Content-Type': 'application/json'
    };
    let dataString = '{"jsonrpc":"2.0","method":"rpc_modules","params":[],"id":1}';
    const RPC_PORT = process.env.RPC_PORT || app_json.env.RPC_PORT;
    let options = {
        url: 'http://' + peer.address + ':' + RPC_PORT,
        method: 'POST',
        headers: headers,
        body: dataString,
        timeout: 5000
    };
    var onRpc = false
    request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            onRpc = true
            cb(peer, RPC_PORT, onRpc) 
        }
    });
    if(onRpc) {
        return
    }
    const SUB_RPC_PORT = process.env.SUB_RPC_PORT || app_json.env.SUB_RPC_PORT;
    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(peer, SUB_RPC_PORT, true);
        } else {
            cb(peer, '', false);
        }
    }
    options.url ='http://' + peer.address + ':' + SUB_RPC_PORT; 
    request(options, callback)

}

for (const bootnode of BOOTNODES) {
    dpt.bootstrap(bootnode).catch((err) => console.error(chalk.bold.red(err.stack || err)))
}

var gracefulShutdown = function() {
	console.log('');
    console.error("xxx", "sys", "Received kill signal, shutting down gracefully.");

    node.stop();
    console.info("xxx", "sys", "Closed node watcher");

    setTimeout(function(){
        console.info("xxx", "sys", "Closed out remaining connections.");
        process.exit(0);
    }, 1000);
}

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);

// listen for shutdown signal from pm2
process.on('message', function(msg) {
	if (msg == 'shutdown')
		gracefulShutdown();
});

