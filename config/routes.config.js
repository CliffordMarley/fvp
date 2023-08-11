const router = require('express').Router()


configureAppRoutes = (app)=>{

   const usersRoutes = require('../routes/users.routes')(router)
   const householdRoutes = require('../routes/households.routes')(router)
   const sectionRoutes = require('../routes/sections.routes')(router)
    
   app.use('/api/v1/', usersRoutes)
   app.use('/api/v1/', householdRoutes)
   app.use('/api/v1/', sectionRoutes)

    app.use('*', (req, res)=>{
        res.status(404).send({
            errorMessage:'Invalid API Route!'
        })
    })


    return app
}


module.exports = {configureAppRoutes}