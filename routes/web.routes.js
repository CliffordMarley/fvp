const WebController = require("../controllers/web.controller")
module.exports =  router=>{

    const webController = new WebController()

    router.get('/web', webController.Index)


    return router
}