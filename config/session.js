const {verifyJSONWebToken} = require('../helpers/auth.helper')

const restAuth = (req, res, next)=>{
    try{
        if(!req.headers.authorization){
            res.status(401).json({message:"Unauthorized!"})
            return
        }
        const token = req.headers.authorization.split(' ')[1]
        const decoded = verifyJSONWebToken(token)
        console.log(decoded)

        if(!decoded){
            res.status(401).json({message:"Unauthorized!"})
            return
        }

        next()

    }catch(err){
        res.status(401).json({
            message:err.message
        })
    }
}

module.exports = {restAuth}