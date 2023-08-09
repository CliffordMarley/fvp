const AuthController = require('../controllers/auth.controller')
module.exports = router=>{
    const authController = new AuthController()

    router.post('/users/requestToken', authController.Authenticate)

    return router
}