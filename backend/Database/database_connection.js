// pass : 2SSVNSLdfrVBv4g6

var mongoose = require('mongoose');

const uri = `mongodb+srv://vspatil8123:2SSVNSLdfrVBv4g6@main.lgpyrsp.mongodb.net/BTP`

mongoose.connect(uri, {useNewUrlParser: true});

var conn = mongoose.connection;
conn.on('connected', function() {
    console.log('database is connected successfully');
});
conn.on('disconnected',function(){
    console.log('database is disconnected successfully');
})
conn.on('error', console.error.bind(console, 'connection error:'));
module.exports = conn;

