var app = require('./app');

const mongoose = require('mongoose');


mongoose.connect('mongodb+srv://brok504:afiliados21@cluster0.zx6zn.azure.mongodb.net/Cluster0?retryWrites=true&w=majority', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify:false
    })
.then(db=>console.log('Db connected '))
.catch(err=>console.log(err));


var port = process.env.PORT||4000   ;
app.listen(port, () => {
    console.log(`http://localhost:${port}`);//app.get('port')
});
