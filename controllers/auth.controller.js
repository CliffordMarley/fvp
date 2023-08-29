const UserModel = require('../models/user.model')
const Event = require('../models/event.model')
const {signJSONWebToken} = require('../helpers/auth.helper')
module.exports = class Auth{
    constructor(){
        this.user = new UserModel()
        this.event = new Event()
        this.actions = [
            "Successfully logged in",
            "Failed to log in",
        ]
    }

    Authenticate = async (req, res)=>{
        try{
            console.log('Authenticating...')
            const {Username, Password} = req.body

            if(!Username || !Password){
                res.status(401).json({message:"Invalid phone number or password!"})
                return
            }
            const Phone_Number = parseInt(Username)

            await this.user.initialize()
            const User = await this.user.ReadOne({Phone_Number, Password})

            if(User){
                const access_token = signJSONWebToken(User)
                delete User.Password
                delete User._id
                console.log("Login successful!")
                res.status(201).json({
                  access_token,
                  data:User
                })
                this.event.Log(User.Phone_Number, this.actions[0])
            }else{
                res.status(401).json({message:"Invalid phone number or password!"})
                this.event.Log(Username, this.actions[1])
                return
            }

        }catch(err){
            console.log(err)
            this.event.Log(Username, this.actions[1], err)
            res.status(500).json({
                message:err.message
            })
        }
    }
}
