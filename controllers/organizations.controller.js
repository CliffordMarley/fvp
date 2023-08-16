const SectionModel = require("../models/section.model")
const TAModel = require('../models/ta.model')
const EPAModel = require('../models/epa.model')
const VillageModel = require("../models/village.model")
const DistrictModel = require("../models/district.model")

module.exports = class HouseholdsController{

    constructor(){
        this.section = new SectionModel()
        this.ta = new TAModel()
        this.epa = new EPAModel()
        this.village = new VillageModel()
        this.district = new DistrictModel()
    }

    Read = async (req, res)=>{
        try{
            const filter = req.params
            console.log(filter)
            
            //Find section
            const sections = await this.section.Read(filter)
            if(sections && sections.length > 0){
                let Section = sections[0]
                console.log("Sections", Section)
                let EPAs = await this.epa.Read({EPACode:this.section.EPA})[0]
                console.log("EPAs",EPAs)
                let District = await this.district.Read({District_Code: EPAs.District})[0]
                console.log("District",District)

                let TAs = await this.district.Read({District:EPAs.District})

                let villages = []

                for(ta of TAs){
                    let villagesRead = await this.villages.Read({TACode:ta.TACode})
                    villages = villages.concat(villagesRead)
                }

                const organizationUnit = {
                    "ta":TAs,
                    "epa":EPAs,
                    "district":District,
                    "section": Section,
                    "villages": villages
                }

                res.json(organizationUnit)
            }else{
                res.status(404).json({message:"Invalid Section Code!"})
            }
        }catch(err){
            res.status(500).json({
                message:err.message
            })
        }
    }


}