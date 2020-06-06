var app = require('./app');

const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/curso-udemy', {
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
