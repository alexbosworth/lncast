var grpc = require('grpc');
var fs = require('fs');
var os = require('os');
var events = require('events');

var certPath = os.homedir() + '/.lnd/tls.cert';
var lndCert = fs.readFileSync(certPath);
var credentials = grpc.credentials.createSsl(lndCert);
var lnrpcDescriptor = grpc.load(__dirname + '/../lnd/lnrpc/rpc.proto');
var lnrpc = lnrpcDescriptor.lnrpc;
var lightning = new lnrpc.Lightning('localhost:10009', credentials);

lightning.getInfo({}, function(err, response) {
    console.log('GetInfo:' + JSON.stringify(response));
});

emitter = new events.EventEmitter();

// Subscribe to invoice stream
var invoice_sub = lightning.subscribeInvoices({});
invoice_sub.on('data', function(invoice) {
    emitter.emit(invoice.payment_request, invoice);
})
.on('end', function() {
    // The server has finished sending
    //
})
.on('status', function(status) {
    // Process status
    //   console.log("Current status" + status);
    //
});

module.exports = {
    addInvoice: function(value, callback) {
        lightning.addInvoice({ value: value }, function(err, response) {
            console.log(response);
            callback(err, response.payment_request)
        });
    },
    emitter,
};
