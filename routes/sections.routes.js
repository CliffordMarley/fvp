
const SectionsController = require('../controllers/sections.controller')
module.exports = router=>{
    const sectionController = new SectionsController()

    router.get('/sections', sectionController.Read)
    
    return router
}