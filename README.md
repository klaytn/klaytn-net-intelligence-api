Klaytn Network Intelligence API
============

This is the backend service which runs along with Klaytn and tracks the network status,
fetches information through JSON-RPC and connects through WebSockets to [klaytn-netstats](https://github.com/klaytn/klaytn-netstats) to feed information.

## Configuration

Configure the app modifying [app.json](/app.json).

```json
	{
		"NODE_ENV"        : "production", // tell the client we're in production environment
		"BOOTNODES"    	  : "52.194.200.217,52.78.22.32,18.136.251.28", // Klaytn cypress boot node IPs
		"BOOTNODE_PORT"   : "32323", // Klaytn boot node well-known port
		"RPC_HOST"        : "http://localhost", // Klaytn JSON-RPC host
		"RPC_PORT"        : "8545", // Klaytn JSON-RPC port
		"SUB_RPC_PORT"    : "8551", // Klaytn JSON-RPC sub port
		"LISTENING_PORT"  : "30303", // Klaytn listening port (only used for display)
		"INSTANCE_NAME"   : "", // whatever you wish to name your node
		"CONTACT_DETAILS" : "", // add your contact details here if you wish (email/skype)
		"WS_SERVER"       : "http://localhost:3000", // path to klaytn-netstats WebSockets api server
		"WS_SECRET"       : "mysecret", // WebSockets api server secret used for login
		"VERBOSITY"       : 2 // Set the verbosity (0 = silent, 1 = error, warn, 2 = error, warn, info, success, 3 = all logs)
	}
```
