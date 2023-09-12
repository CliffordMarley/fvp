const SectionModel = require("../models/section.model")
const TAModel = require('../models/ta.model')
const EPAModel = require('../models/epa.model')
const VillageModel = require("../models/village.model")
const DistrictModel = require("../models/district.model")
const ConstituencyModel = require("../models/constituency.model")
const RedisCache = require('../helpers/cache.helper')

const moment = require('moment')


const {setCache, getCache, Hash} = require('../helpers/cache.helper')

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
        this.cache = new RedisCache()
    }

    Read = async (req, res)=>{
        try{
            console.log("%s : Reading organizational structure...", moment().utc().format())
            const filter = req.params
            
            //Find section
            const  memoryKey = filter.Section_Code

            console.log("Cache key: ", memoryKey)

            let organizationUnit = null


            organizationUnit = await this.cache.getCache(memoryKey)

            if(!organizationUnit || organizationUnit == null){
                const sections = await this.section.Read(filter)
                if(sections && sections.length > 0){
                    let Section = sections[0]

                    let otherSections = await this.section.Read({EPA: Section.EPA})

                    let EPAs = await this.epa.Read({EPACode:Section.EPA})
                    EPAs = EPAs[0]

                    let District = await this.district.Read({District_Code: EPAs.District})
                    District = District[0]

                    let District_Name = District.District_Name.split(' ')
                
                    District_Name= District_Name[0].toUpperCase()
                    let Constituencies = await this.constituency.Read({DISTRICT:District_Name})

                    let TAs = await this.ta.Read({District:EPAs.District})

                    let villages = []

                    for(const ta of TAs){
                        let villagesRead = await this.village.Read({TACode:ta.TACode})
                        villages = villages.concat(villagesRead)
                    }

                    try{
                        villages.sort((a, b) => a.Village_Name.localeCompare(b.Village_Name));
                    }catch(err){
                        console.log("%s : Error=> %s " , moment().utc().format(),err.message)
                    }


                    organizationUnit = {
                        "ta":TAs,
                        "epa":EPAs,
                        "district":District,
                        "section": Section,
                        "otherSections": otherSections,
                        "villages": villages,
                        "constituency": Constituencies
                    }

                    res.json(organizationUnit)

                    console.log("Storing organization unit in cache!")
                    this.cache.setCache(memoryKey, organizationUnit)
                    
                }else{
                    res.status(404).json({message:"Invalid Section Code!"})
                }
            }else{
                console.log('%s : Read organization unit from cache!', moment().utc().format())
                res.json(organizationUnit)
            }
        }catch(err){
            console.log(err)
            res.status(500).json({
                message:err.message,
                err
            })
        }
    }


}