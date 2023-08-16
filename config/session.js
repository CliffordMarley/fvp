const {verifyJSONWebToken} = require('../helpers/auth.helper')

const restAuth = (req, res, next)=>{
    try{
        if(!req.headers.authorization){
            res.status(401).json({message:"Unauthorized!"})
            return
        }
        const token = req.headers.authorization.split(' ')[1]
        const decoded = verifyJSONWebToken(token)
        req.username =decoded.data.Phone_Number


        if(!decoded){
            res.status(401).json({message:"Unauthorized!"})
        }else{
            next()
        }        

    }catch(err){
        res.status(401).json({
            message:err.message
        })
    }
}

module.exports = {restAuth}