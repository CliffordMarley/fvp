const EPAController = require("../controllers/epa.controller")
module.exports = router=>{

    const epaController = new EPAController()

    router.get('/epa/district/:District', epaController.ReadEPA)

    router.get('/section/epa/:EPA', epaController.ReadSection)

    return router
}