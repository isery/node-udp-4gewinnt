node-udp-4gewinnt
=================

Using a node.js UPD Server to play "4-Gewinnt" in a Network

We use a self developed UPD Protokoll using JSON Objects.

```javascript
proto = {
    'version':2,
    'clienttype':1,
    'stage':1,
    'clientname':myLib.name
};
```

We send those Packets in a Intervall and wait for the approvel of the enemy.

Furthermore we use Socket.io for the communication between the Server and the Web-Frontend.


