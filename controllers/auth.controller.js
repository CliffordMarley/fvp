const UserModel = require('../models/user.model')
const {signJSONWebToken} = require('../helpers/auth.helper')
module.exports = class Auth{
    constructor(){
        this.user = new UserModel()
    }

    Authenticate = async (req, res)=>{
        try{
            const {Username, Password} = req.body

            if(!Username || !Password){
                res.status(401).json({message:"Invalid username or password!"})
                return
            }

            await this.user.initialize()
            const User = await this.user.ReadOne({Username, Password})

            if(User){
                const access_token = signJSONWebToken(User)
                delete User.Password
                delete User._id
    
                res.status(201).json({
                  access_token,
                  data:User
                })
            }else{
                res.status(401).json({message:"Invalid username or password!"})
                return
            }

        }catch(err){
            console.log(err)
            res.status(500).json({
                message:err.message
            })
        }
    }
}
