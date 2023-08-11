const {restAuth} = require('../config/session')
const SectionsController = require('../controllers/sections.controller')

module.exports = router=>{
    const sectionController = new SectionsController()

    router.get('/sections',restAuth, sectionController.Read)
    
    return router
}