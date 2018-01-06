BTC Exchange Rates Observer (coins-observer)
=====================================================

Simply "NodeJS + Express" based application focused on getting Bitcoin exchanges rates from Coinbase then publishing them in a Google Chart based template through Express, almost in realtime

Commands:
--------------

`node cco.js <portNumber>` (portNumber >= 3000 && <= 65535)

Will istantiate coins-observer con http://localhost:portNumber

`node cco.js reset`

Will initialize the /temp/archivebtc.json
Since It is constantly rewrited every T(ms) seconds, it's not a bad idea to run coins-observer from a ram-disk

Settings:
--------------

Actually there is only one setting and it is contained in /etc/cco.json

loopTime: milliseconds

Template:
--------------

There is a very bad spaghetti-code template called /temp/skel.json which cointains all static html data
I've not yet decided if add Pug support to this project or rewrite all this thing in a another language (I'll probably do both).
