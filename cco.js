///////////////Variabili Globali e Require///////////////

var args = process.argv;

var express = require('express');
var app = express();

var fs = require('fs');
var settings = JSON.parse(fs.readFileSync(__dirname + '/etc/cco.json', 'utf8'));

var Events = require('events');

var event = new Events();

var waitTime = settings.loopTime;

var request = require('request');

var dateTime = require('node-datetime');

var coindata = JSON.parse(fs.readFileSync(__dirname + '/temp/archivebtc.json', 'utf8'));

//var dt = dateTime.create();
//var dtFormatted = dt.format('Y-m-d H:M:S');

//var dt = null;
//var dtFormatted = "";

//var valoreUSD = 0;
//var valoreEUR = 0;



/*

var data = {
    date: "",
    USD: 0,
    EUR: 0
};*/

///////////////Inizializza Archivio///////////////

var cmdopt = args[2];
if(cmdopt === 'reset') {
    var archive = {
        "name" : "BTC",
        "data" : []
    }
    fs.writeFileSync(__dirname + '/temp/archivebtc.json', JSON.stringify(archive, null, 4), 'utf-8');
    console.log('Archivio Inizializzato');
    process.exit();
}

///////////////Scheduler///////////////

// Attendi il tempo definito nel json cco.json e poi cicla la funzione init()

setInterval(function(){init()},waitTime);

///////////////Init()////////////////////

function init() {
    
    // Scarica il json con le valute

    let url = "https://api.coinbase.com/v2/exchange-rates?currency=BTC"     //Bitcoin
    
    request({
        url: url,
        json: true
    }, function (error, response, body) {

        // Se tutto va bene segna data e ora attuali ed infilale insieme ai cambi in dollari ed euro in un oggetto data

        if (!error && response.statusCode === 200) {
            var data = {
                date: "",
                USD: 0,
                EUR: 0,
                GBP: 0
            };
            var dt = dateTime.create();
            var dtFormatted = dt.format('Y-m-d H:M:S');
            console.log('1 BTC = '+ body.data.rates.USD + ' USD and ' + body.data.rates.EUR + ' Euro @ ' + dtFormatted) // Print the json response
            data.date = dtFormatted;
            data.USD = body.data.rates.USD;
            data.EUR = body.data.rates.EUR;
            data.GBP = body.data.rates.GBP;
            //valoreUSD = body.data.rates.USD;
            //valoreEUR = body.data.rates.EUR;
            
            // Pusha l'oggetto in un array d'archivio **** PROBLEMA: QUANDO PUSHA DATA FA FUORI TUTTO L ARRAY CHE TROVA E AGGIUNGE UN NUOVO VALORE
            
            coindata.data.push(data);
            

            // Sovrascrivi l'oggetto archivio

            fs.writeFileSync(__dirname + '/temp/archivebtc.json', JSON.stringify(coindata, null, 4), 'utf-8');
            

        }
        else
        {
            console.log('Il gatto m\'ha mangiato il JSON da Coinbase o c\'ha pisciato sopra, vedi tu...');
            process.exit(1);
        }
    })

    
    

}




///////////////Express///////////////

if(cmdopt >= 3000 && cmdopt <= 65535)
    var port = cmdopt;
else
    {
        console.log('Errore porta: deve essere compresa tra 3000 e 65535');
        process.exit(2);
    }


// Pesca tutti i file statici (css,img,js,template vari...) dalla cartella frontend

//app.use(express.static('frontend'));

app.get('/', function (req, res) {
    //res.send('Ciriciao');
    ///////////////Crea il file HTML da girare ad Express///////////////

    var htmldata = JSON.parse(fs.readFileSync(__dirname + '/temp/skel.json', 'utf8'));
    var graphdataorigin = JSON.parse(fs.readFileSync(__dirname + '/temp/archivebtc.json', 'utf8'));
    var graphdataarray = "";
    var dataDate = "";
    var dataUSD = 0;
    var dataEUR = 0;
    var dataGBP = 0;
    //console.log(graphdataorigin);
    //console.log('dovrei entrare nel for...');
    //console.log('lunghezza array data: '+graphdataorigin.data.length);
    for(var i = 0; i<graphdataorigin.data.length; i++)
    {
        //console.log('sono nel for');
        
        dataDate = graphdataorigin.data[i].date;
        dataUSD = graphdataorigin.data[i].USD;
        dataEUR = graphdataorigin.data[i].EUR;
        dataGBP = graphdataorigin.data[i].GBP;
        var graphdatasingle = "['" + dataDate + "', " + dataUSD + ", " + dataEUR + ", "+ dataGBP +"],\n\t\t\t\t";
        graphdataarray = graphdataarray + graphdatasingle;
        //console.log("Valori: "+dataDate +" "+dataUSD+" "+dataEUR+"\n");
    }
    console.log(graphdataorigin.data[graphdataorigin.data.length-1]);
    //console.log('sono uscito dal for...');
    //console.log(graphdataarray);
    var graphdataarrayfinal = graphdataarray.substring(0,graphdataarray.length-1);
    //console.log(graphdataarrayfinal);
    var htmlresult = htmldata.Header1 + waitTime / 1000 + htmldata.Header2 + htmldata.Chart1 + htmldata.Chart2 + graphdataarrayfinal + htmldata.Chart3 + htmldata.StartBody + htmldata.Body + htmldata.EndBody;
    //console.log(htmlresult);
    fs.writeFileSync("./temp/index.html",htmlresult);
    res.sendFile("/temp/index.html", { root: __dirname });
});

app.listen(port, function () {
    console.log('Serving big money on port: '+port);
    console.log('Analisi di Exchange Rates dei BTC su Coinbase ogni ' + waitTime / 1000 + ' secondi (30 secondi valore minimo, inutile scendere)');
});