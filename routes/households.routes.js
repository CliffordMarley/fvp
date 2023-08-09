const HouseholdsController = require('../controllers/households.controller')
module.exports = (router)=>{

    const householdsContoller = new HouseholdsController()

    router.get('/households/district/:DistrictName/section/:SectionName', householdsContoller.readBySection)
    router.put('/households/:nationalId', householdsContoller.updateHousehold)

    return router
}