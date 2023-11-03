const SectionModel = require("../models/section.model")
const TAModel = require('../models/ta.model')
const EPAModel = require('../models/epa.model')
const VillageModel = require("../models/village.model")
const DistrictModel = require("../models/district.model")
const ConstituencyModel = require("../models/constituency.model")
const DowaConstituencyModel = require("../models/dowa_constituency")

const GezettedVillageModel = require("../models/gazetted_village.model")
const HouseholdModel = require("../models/household.model")

const assert = require('assert');

const OrgModel = require("../models/org.model")


const RedisCache = require('../helpers/cache.helper')

const moment = require('moment')


const {setCache, getCache, Hash} = require('../helpers/cache.helper')
const {Isset} = require('../helpers/validation.helpers')

const Event = require('../models/event.model')

module.exports = class {

    constructor(){
        this.event = new Event()
        
        this.section = new SectionModel()
        this.ta = new TAModel()
        this.epa = new EPAModel()
        this.village = new VillageModel()
        this.district = new DistrictModel()
        this.constituency = new ConstituencyModel()
        this.gazetted_villages = new GezettedVillageModel()
        this.household = new HouseholdModel()
        this.org = new OrgModel()
        this.dowa_constituency = new DowaConstituencyModel()

        this.cache = new RedisCache()
    }

    // Read = async (req, res)=>{
    //     try{
    //         console.log("%s : Reading organizational structure...", moment().utc().format())
    //         const filter = req.params
            
    //         //Find section
    //         const  memoryKey = filter.Section_Code

    //         let organizationUnit = null


    //         organizationUnit = await this.cache.getCache(memoryKey)

    //         if(!organizationUnit || organizationUnit == null){
    //             const sections = await this.section.Read(filter)
    //             if(sections && sections.length > 0){
    //                 let Section = sections[0]


    //                 let EPAs = await this.epa.Read({EPACode:Section.EPA})
    //                 EPAs = EPAs[0]

    //                 let gazetted_villages = await this.gazetted_villages.Read({EPA: EPAs.EPA_Name.toUpperCase()})
    //                 let otherSections = []
    //                 // gazetted_villages.map(record=>{
    //                 //     if(!otherSections.includes(record.Section) && Isset(record.Section)){
    //                 //         otherSections.push(record.Section.toUpperCase())
    //                 //     }   
    //                 // })

    //                 // const secondarySectionList = await this.section.Read({EPA:EPAs.EPACode})

    //                 // secondarySectionList.map(record=>{
    //                 //     if(!otherSections.includes(record.Section) && Isset(record.Section)){
    //                 //         otherSections.push(record.Section_Name.toUpperCase())
    //                 //     }   
    //                 // })

    //                 otherSections = await this.household.DistinctSection({Updated_By: req.username, Section:{$ne:null, $ne:""}})

    //                 let District = await this.district.Read({District_Code: EPAs.District})
    //                 District = District[0]

    //                 let District_Name = District.District_Name.split(' ')
                
    //                 District_Name= District_Name[0].toUpperCase()
    //                 let Constituencies = await this.constituency.Read({DISTRICT:District_Name})

    //                 let TAs = await this.ta.Read({District:EPAs.District})

    //                 let villages = []

    //                 for(const ta of TAs){
    //                     let villagesRead = await this.village.Read({TACode:ta.TACode})
    //                     villages = villages.concat(villagesRead)
    //                 }

    //                 try{
    //                     villages.sort((a, b) => a.Village_Name.localeCompare(b.Village_Name));
    //                 }catch(err){
    //                     console.log("%s : Error=> %s " , moment().utc().format(),err.message)
    //                 }


    //                 organizationUnit = {
    //                     "ta":TAs,
    //                     "epa":EPAs,
    //                     "district":District,
    //                     "section": Section,
    //                     "otherSections": otherSections,
    //                     "villages": villages,
    //                     "constituency": Constituencies
    //                 }

    //                 res.json(organizationUnit)

    //                 console.log("Storing organization unit in cache!")
    //                 this.cache.setCache(memoryKey, organizationUnit)
                    
    //             }else{
    //                 res.status(404).json({message:"Invalid Section Code!"})
    //             }
    //         }else{
    //             console.log('%s : Read organization unit from cache!', moment().utc().format())
    //             res.json(organizationUnit)
    //         }
    //     }catch(err){
    //         console.log(err)
    //         res.status(500).json({
    //             message:err.message,
    //             err
    //         })
    //     }
    // }
    Read = async (req, res)=>{
        try{
            console.log("%s : Reading Dowa structure...", moment().utc().format())
            const filter = req.params

            console.log(filter)

            const sections = await this.section.Read(filter)
            let Section = sections[0]


            let EPAs = await this.epa.Read({EPACode:Section.EPA})
            EPAs = EPAs[0]
            
            console.log("Reading Data from EPA: ", EPAs.EPA_Name.toUpperCase())
            //Resolve districts
            const districtFetch = await this.org.Read({EPA: EPAs.EPA_Name.toUpperCase()})
            const District_Name = districtFetch[0].District
            console.log("%s EPA belongs to %s District", EPAs.EPA_Name.toUpperCase(), District_Name)
            let list = await this.org.Read({District: District_Name})
            //{EPA: EPAs.EPA_Name.toUpperCase()}

            console.log("Found %s records", list.length)

            const TAList = []
            const otherSections = []
            const otherEPAs  = []

            list.map(item=>{
                !TAList.includes(item.TA) ? TAList.push(item.TA) : {}
            })

            list.map(item=>{
                !otherSections.includes(item.Section) ? otherSections.push(item.Section) : {}
            })

            let Constituencies = []
            const trackerEPA = []
            const ConstituenciesList = await this.dowa_constituency.Read({District:District_Name})
            ConstituenciesList.map(item=>{
                !Constituencies.includes(item.Constituency) ? Constituencies.push(item.Constituency) : {}                
            })

            list.map(item=>{
                let isThere = false
                for(const record of otherEPAs){
                    if(JSON.stringify(record) == JSON.stringify({Constituency:item.District, EPA: item.EPA})){
                        isThere = true
                        break
                    }
                }
                if(!isThere){
                    otherEPAs.push({District:item.District, EPA: item.EPA})
                }
            })

            res.json({
                epa:EPAs,
                section:Section,
                otherSections,
                otherEPAs,
                ta: TAList,
                villages:list,
                constituency: Constituencies,
                district: {District_Name: list[0].District}
            })
        }catch(err){
            console.log(err)
            res.status(500).json({
                message:err.message,
                err
            })
        }
    }

   
}