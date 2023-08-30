
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
            console.log("Reading households by section...")
            const Section = req.params.SectionName.toUpperCase()
            const District = req.params.DistrictName.toUpperCase()

            if(!Isset(Section)){
                res.status(400).json({messge:"Invalid/Empty section name!"})
            }else if(!Isset(District)){
                res.status(400).json({messge:"Invalid/Empty district name!"})
            }else{
                
                const filter = {Section, District}
                let households = await this.household.Read(filter)

                const otherHouseholdsFilter = {District,Section:null}
                const householdsWithMissingSections = await this.household.Read(otherHouseholdsFilter)

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
                        villages,
                        unassignedHouseholdsCount: householdsWithMissingSections.length
                    }
                }
                res.setHeader('Content-Length', Buffer.byteLength(JSON.stringify(responseJson)))
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

    readByEmptySection = async (req, res)=>{
        try{
            console.log("Loading households with empty sections...")

            const offset = req.query.offset
            const limit  = req.query.limit
            const District = req.parama.DistrictName

            const filter = {District,Section:null}
            const householdsWithMissingSections = await this.household.ReadWithPagination(filter, offset, limit)

            res.json(householdsWithMissingSections)
        }catch(err){
            res.status(500).json({
                message:err.message
            })
        }
    }

    updateHousehold = async (req, res)=>{
        try{
            const nationalId = req.params.nationalId
            let farmerProfile = req.body

            console.log("Updating households...")
            if(!validateHouseholdKeys(farmerProfile) ){
                res.status(400).json({message:"Some required fields are empty!"})
            }else{
                
                farmerProfile = CastData(farmerProfile)

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

    InsertNewIdentity = async (req, res)=>{
        try{
            console.log("Inserting a new identity...")
            const document = req.body
            if(!document){
                throw new Error('Invalid document!')
            }
            
            document.AEDO = req.username
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