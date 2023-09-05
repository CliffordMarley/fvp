const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const compression = require('compression')
const {configureAppRoutes} = require('./config/routes.config')
global.appVersion = 8.0
let app = express()

//Setup Middleware
app.use(cors())
app.use(compression())
app.use(express.urlencoded({limit:'50mb', extended:true}))
app.use(express.json({limit:'50mb'}))



//Setup configurations
dotenv.config()
app.set('trust proxy', 1) // trust first proxy
app.set('port', 8000)

//Setup routes
app.get('/status', (req, res)=>{
    res.json({status:"Success!"})
})
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.log("Error in Body: ", req.body)
        return res.status(400).json({ message: 'Invalid JSON body!' });
    }
    next(err);
})
app = configureAppRoutes(app)

//Launch Application
app.listen(app.get('port'), ()=> console.log(`Server started on port ${app.get('port')}`))
