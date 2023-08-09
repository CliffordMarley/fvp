const router = require('express').Router()
const {restAuth} = require('../config/session')

configureAppRoutes = (app)=>{

   const usersRoutes = require('../routes/users.routes')(router)
   const householdRoutes = require('../routes/households.routes')(router)
   const sectionRoutes = require('../routes/sections.routes')(router)
    
   app.use('/api/v1/', usersRoutes)
   app.use('/api/v1/',restAuth, householdRoutes)
   app.use('/api/v1/',restAuth, sectionRoutes)

    app.use('*', (req, res)=>{
        res.status(404).send({
            errorMessage:'Invalid API Route!'
        })
    })


    return app
}


module.exports = {configureAppRoutes}