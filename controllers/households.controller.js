
const HouseHoldModel = require('../models/household.model')
const IdentityModel = require('../models/identity.model')
const {validateHouseholdData, validateHouseholdKeys, Isset, CastData} = require('../helpers/validation.helpers')
const Event = require('../models/event.model')

module.exports = class HouseholdsController{

    constructor(){
        this.event = new Event()
        this.actions = [
            "Syncronized households!",
            "Failed to syncronize households!",
            "Updated a household!",
            "Failed to update a household!"
        ]
        this.household = new HouseHoldModel()
        this.identity = new IdentityModel()
    }

    readBySection = async (req, res)=>{
        try{
            console.log(req.username)
            const Section = req.params.SectionName.toUpperCase()
            const District = req.params.DistrictName.toUpperCase()
            

            if(!Isset(Section)){
                res.status(400).json({messge:"Invalid/Empty section name!"})
            }else if(!Isset(District)){
                res.status(400).json({messge:"Invalid/Empty district name!"})
            }else{
                
                const filter = {
                    Section, 
                    District
                }
                console.log(filter)
                let households = await this.household.Read(filter)
                

                //Now get all IDs from records withing this district but without Section
                const householdsWithMissingSections = await this.household.Read({
                    District,
                    Section:null
                })
               
                households = households.concat(householdsWithMissingSections)

                try{
                    for(let i = 0; i < households.length; i++){
                        if(!Isset(households[i].Village)){
                            households[i].Village = "UNKNOWN"
                        }
                    }
                }catch(err){
                    console.log(err.message)
                }

                const villages = []
                for(let i = 0; i < households.length; i++){
                    if(!villages.includes(households[i].Village)){
                        villages.push(households[i].Village)
                    }
                }
                villages.sort()
                const responseJson = {
                    message:`${households.length} farmer records found!`,
                    data:{
                        households,
                        villages
                    }
                }
                res.setHeader('Content-Length', Buffer.byteLength(responseJson))
                res.json(responseJson)
                this.event.Log(req.username, this.actions[0])
            }            
        }catch(err){
            console.log(err)
            this.event.Log(req.username, this.actions[1], err)
            res.status(500).json({
                message:err.message
            })
        }
    }

    updateHousehold = async (req, res)=>{
        try{
            const nationalId = req.params.nationalId
            let farmerProfile = req.body

            console.log("Submitted data: ",farmerProfile)
            if(!validateHouseholdKeys(farmerProfile) ){
                res.status(400).json({message:"Some required fields are empty!"})
            }else{
                
                farmerProfile = CastData(farmerProfile)

                console.log(farmerProfile)

                if(farmerProfile.In_Livestock_Farming == true &&  !Isset(farmerProfile.Livestock_Type)){
                    res.status(400).json({message:"Please indicate the Livestock item for this household!"})
                }else{
                    await this.household.updateByNationalID(nationalId, farmerProfile)
                    res.status(200).json({
                        message:"Farmer profile updated successfuly!"
                    })
                    this.event.Log(req.username, this.actions[2])
                }
                
            }            
        }catch(err){
            console.log(err)
            this.event.Log(req.username, this.actions[3])
            res.status(500).json({
                message:err.message
            })
        }
    }

    InsertNewIdentity = async (req, res)=>{
        try{
            const document = req.body
            if(document){
                throw new Error('Invalid document!')
            }
            await this.identity.Create(document)
            res.json({
                message:"New identity inserted!"
            })
        }catch(err){
            console.log(err)
            res.status(500).json({
                message:err.message
            })
        }
    }
    

}