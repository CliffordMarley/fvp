const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const compression = require('compression')
const {engine} = require('express-handlebars');
const {configureAppRoutes} = require('./config/routes.config')
const path = require('path')

let app = express()

//Setup Middleware
app.use(cors())
app.use(compression())
app.use(express.urlencoded({limit:'50mb', extended:true}))
app.use(express.json({limit:'50mb'}))
app.use(express.static(__dirname+'/Public'))
app.set('trust proxy', 1) // trust first proxy



app.set("views",path.join(__dirname,'Views'))
app.engine('handlebars',engine({
    defaultLayout:'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
}))
app.set('view engine','handlebars')

//Setup configurations
dotenv.config()
app.set('trust proxy', 1) // trust first proxy
app.set('port', 8000)

//Setup routes
app.get('/status', (req, res)=>{
    res.json({status:"Success!"})
})

app = configureAppRoutes(app)

//Launch Application
app.listen(app.get('port'), ()=> console.log(`Server started on port ${app.get('port')}`))
