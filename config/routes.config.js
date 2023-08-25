const router = require('express').Router()


configureAppRoutes = (app)=>{

   const usersRoutes = require('../routes/users.routes')(router)
   const householdRoutes = require('../routes/households.routes')(router)
   const organizationUnitRoutes = require('../routes/organization_unit.routes')(router)
    
   app.use('/api/v1/', usersRoutes)
   app.use('/api/v1/', householdRoutes)
   app.use('/api/v1/', organizationUnitRoutes)

    app.use('*', (req, res)=>{
        res.status(404).send({
            errorMessage:'Invalid API Route!'
        })
    })


    return app
}


module.exports = {configureAppRoutes}