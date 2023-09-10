
const HouseHoldModel = require('../models/household.model')
const IdentityModel = require('../models/identity.model')
const Event = require('../models/event.model')
const LoggerModel = require('../models/log.model')
const TAModel = require('../models/ta.model')
const EPAModel = require('../models/epa.model')
const SectionModel = require("../models/section.model")
const RedisCache = require('../helpers/cache.helper')


const moment = require('moment')

const {validateHouseholdData, validateHouseholdKeys, Isset, CastData} = require('../helpers/validation.helpers')

module.exports = class HouseholdsController{

    constructor(){
        this.event = new Event()
        this.actions = [
            "Syncronized households!",
            "Failed to syncronize households!",
            "Updated a household!",
            "Failed to update a household!",
            "Batch household re-ipload failed!"
        ]
        this.household = new HouseHoldModel()
        this.identity = new IdentityModel()
        this.ta = new TAModel()
        this.section = new SectionModel()
        this.epa = new EPAModel()
        this.logger = new LoggerModel()
        this.cache = new RedisCache()

    }

    readBySection = async (req, res)=>{
        try{
            
            console.log("%s : Reading households by section...", moment().utc().format())
            const Section = req.params.SectionName.toUpperCase()
            const District = req.params.DistrictName.toUpperCase()

            if(!Isset(Section)){
                res.status(400).json({messge:"Invalid/Empty section name!"})
            }else if(!Isset(District)){
                res.status(400).json({messge:"Invalid/Empty district name!"})
            }else{
                const EPA_Name = await this.resolveEPAName(req.Section)
                console.log("Searching by EPA: ",EPA_Name)
               
                let filter = {
                    $or: [
                    { EPA: EPA_Name },
                    { EPA: { $in: [null, ""] } }
                    ],
                    District
                }

                console.log(filter)
                const householdsWithMissingSectionsCount = await this.household.CountDocuments(filter)
                const updatedHouseholdsCount = await this.household.CountDocuments({
                    "Updated_By":req.username
                })
    
                const responseJson = {
                    message:`${householdsWithMissingSectionsCount} Farmer records found!`,
                    data:{
                        unassignedHouseholdsCount: householdsWithMissingSectionsCount, 
                        updatedHouseholdsCount,
                        households:[]
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

    searchHouseholdByNID = async (req, res)=>{
        try{
           
            const nationalId =  req.params.nationalId
            console.log("Searching household by National ID: %s...", nationalId)
            
            const searchFilter = {"National_ID":nationalId}
            const householdProfile = await this.household.Read(searchFilter)

            if(householdProfile.length > 0){
                res.json(householdProfile[0])
            }else{
                res.status(404).json({
                    message:"Household with this National ID could not be found!"
                })
            }
        }catch(err){
            res.status(500).json({
                message:err.message
            })
        }
    }

    readByEmptySection = async (req, res)=>{
        try{
            console.log("%s : Loading households by EPA...", moment().utc().format())

            const offset = parseInt(req.query.offset)
            const limit  = parseInt(req.query.limit)
            const District = req.params.DistrictName.toUpperCase()

            const EPA_Name = await this.resolveEPAName(req.Section)
            let filter = {
                $or: [
                  { EPA: EPA_Name },
                  { EPA: { $in: [null, ""] } }
                ],
                District
            }

            let searchObject = filter
            searchObject.offset = offset
            searchObject.limit = limit

            const memoryKey = this.cache.Hash(JSON.stringify(searchObject))
            console.log("%s : Generated memory key : %s", moment().utc().format(), memoryKey )

            let minifiedHouseholdList = await this.cache.getCache(memoryKey)

            if(!minifiedHouseholdList || minifiedHouseholdList.length == 0){
                console.log("Searching from database with filter: ", filter)
                let householdsWithMissingSections = await this.household.ReadWithPagination(filter, offset, limit)
                minifiedHouseholdList = householdsWithMissingSections.map((householdItem, index) => ({
                    ADD: householdItem.ADD,
                    District: householdItem.District,
                    National_ID: householdItem.National_ID,
                    Name_Of_Household_Head: householdItem.Name_Of_Household_Head,
                    Updated: householdItem.Updated  ? true : false,
                    Updated_By: householdItem.Updated_By ? householdItem.Updated_By : null
                }));

                console.log("Minified household batch", minifiedHouseholdList)
                
                console.log("%s : Storing batch in cache!",  moment().utc().format())
                this.cache.setCache(memoryKey, minifiedHouseholdList)
            }
            
            res.json(minifiedHouseholdList);
              
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
            let farmerProfile = req.body
            try{
                let requestBody = req.body
                delete requestBody._id
                await this.logger.Insert(requestBody)
            }catch(err){
                console.log("%s : Failed to log post request: %s",moment().utc().format(), err.message)
            }
            console.log("%s : Updating household for Farmer %s",moment().utc().format(), nationalId)
            //validateHouseholdKeys(farmerProfile)
            if(true){
                farmerProfile = CastData(farmerProfile)
                await this.household.updateByNationalID(farmerProfile.National_ID, farmerProfile)
                res.status(200).json({
                    message:"Farmer profile updated successfuly!"
                })
                this.event.Log(req.username, this.actions[2])
            }else{
                res.status(400).json({message:"Some required fields are empty!"})
            }            
        }catch(err){
            console.log(err)
            this.event.Log(req.username, this.actions[3])
            res.status(500).json({
                message:err.message
            })
        }
    }


    batchUpload = async (req, res)=>{
        try{
            console.log('Batch insert of %s already updated households', req.body.length )
            let farmerProfileArray = req.body

            for(let household of farmerProfileArray){
                if(validateHouseholdKeys(household)){
                    household = CastData(household)    
                    this.household.updateByNationalID(household.National_ID, household)
                    .then(res=>console.log("%s : Households %s updated!",moment().utc().format(), household.National_ID))
                    .catch(err=>console.log("%s : Error: %s",moment().utc().format(),err.message))
                }else{
                    console.log('%s : Invalid household schema!', moment().utc().format())
                }
            }
            res.status(200).json({
                message:"Batch farmer profile reloaded successfuly!"
            })          
        }catch(err){
            console.log(err)
            this.event.Log(req.username, this.actions[4])
            res.status(500).json({
                message:err.message
            })
        }
    }

    InsertNewIdentity = async (req, res)=>{
        try{
            console.log("%s : Inserting a new identity...", moment().utc().format())
            const document = req.body
            if(!document){
                throw new Error('Invalid document!')
            }
            
            document.AEDO = req.username

            const filter = {National_ID: document.National_ID}
            let checkExists = await this.identity.Read(filter)
            
            if(checkExists.length == 0){
                await this.identity.Create(document)
            }
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

    resolveEPAName = (Section_Code)=>{
       return new Promise(async (resolve, reject)=>{
            try{
                //Get section first
                const Section = await this.section.Read({Section_Code})
                const epaFilter = {"EPACode":Section[0].EPA}

                const EPA = await this.epa.Read(epaFilter)
                let EPA_Name = EPA[0].EPA_Name
                EPA_Name = EPA_Name.toUpperCase()
                resolve(EPA_Name)
            }catch(err){
                console.log(err.message)
                resolve(null)
            }
       })
    }
    

}