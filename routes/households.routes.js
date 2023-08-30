const {restAuth} = require('../config/session')
const HouseholdsController = require('../controllers/households.controller')
module.exports = (router)=>{

    const householdsContoller = new HouseholdsController()

    router.get('/households/district/:DistrictName/section/:SectionName', restAuth, householdsContoller.readBySection)

    router.get('/households/district/:DistrictName', restAuth, householdsContoller.readByEmptySection)
    
    router.put('/households/:nationalId',restAuth, householdsContoller.updateHousehold)

    router.post('/identities', householdsContoller.InsertNewIdentity)

    return router
}