const {restAuth} = require('../config/session')
const orgaStructureController = require('../controllers/organizations.controller')

module.exports = router=>{
    const orgStructureController = new orgaStructureController()

    router.get('/organizationUnit/:Section_Code',restAuth, orgStructureController.Read)
    
    return router
}