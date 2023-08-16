
const HouseHoldModel = require('../models/household.model')
const {validateHouseholdData, validateHouseholdKeys, Isset} = require('../helpers/validation.helpers')
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
    }

    readBySection = async (req, res)=>{
        try{
            console.log(req.username)
            const Section = req.params.SectionName
            const District = req.params.DistrictName
            

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
                const households = await this.household.Read(filter)

                const villages = []
                for(let i = 0; i < households.length; i++){
                    if(!villages.includes(households[i].Village)){
                        villages.push(households[i].Village)
                    }
                }
                villages.sort()
                res.json({
                    message:`${households.length} farmer records found!`,
                    data:{
                        households,
                        villages
                    }
                })
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
            const farmerProfile = req.body

            
            if(!validateHouseholdKeys(farmerProfile) ){
                res.status(400).json({message:"Some required fields are empty!"})
            }else{
                
                await this.household.updateByNationalID(nationalId, farmerProfile)
                res.status(200).json({
                    message:"Farmer profile updated successfuly!"
                })
                this.event.Log(req.username, this.actions[2])
            }            
        }catch(err){
            console.log(err)
            this.event.Log(req.username, this.actions[3])
            res.status(500).json({
                message:err.message
            })
        }
    }

    

}