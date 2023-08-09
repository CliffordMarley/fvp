
const HouseHoldModel = require('../models/household.model')
const {validateHouseholdData, validateHouseholdKeys, Isset} = require('../helpers/validation.helpers')

module.exports = class HouseholdsController{

    constructor(){
        this.household = new HouseHoldModel()
    }

    readBySection = async (req, res)=>{
        try{
            const Section = req.params.SectionName
            const District = req.params.DistrictName.toUpperCase()

            if(!Isset(Section)){
                res.status(400).json({messge:"Invalid/Empty section name!"})
            }else if(!Isset(District)){
                res.status(400).json({messge:"Invalid/Empty district name!"})
            }else{
                await this.household.initialize()
                const households = await this.household.Read({
                    Section, 
                    District, 
                    Name_Of_Households_Head:{$ne:null}
                })

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
            }            
        }catch(err){
            console.log(err)
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
                await this.household.initialize()
                await this.household.updateByNationalID(nationalId, farmerProfile)
                res.status(200).json({
                    message:"Farmer profile updated successfuly!"
                })
            }            
        }catch(err){
            console.log(err)
            res.status(500).json({
                message:err.message
            })
        }
    }

    

}