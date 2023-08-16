const SectionModel = require("../models/section.model")
const TAModel = require('../models/ta.model')
const EPAModel = require('../models/epa.model')
const VillageModel = require("../models/village.model")
const DistrictModel = require("../models/district.model")
const ConstituencyModel = require("../models/constituency.model")

const Event = require('../models/event.model')

module.exports = class HouseholdsController{

    constructor(){
        this.event = new Event()
        
        this.section = new SectionModel()
        this.ta = new TAModel()
        this.epa = new EPAModel()
        this.village = new VillageModel()
        this.district = new DistrictModel()
        this.constituency = new ConstituencyModel()
    }

    Read = async (req, res)=>{
        try{
            const filter = req.params
            console.log(filter)
            
            //Find section
            const sections = await this.section.Read(filter)
            if(sections && sections.length > 0){
                let Section = sections[0]

                let EPAs = await this.epa.Read({EPACode:Section.EPA})
                EPAs = EPAs[0]

                let District = await this.district.Read({District_Code: EPAs.District})
                District = District[0]

                console.log("Constitutency Search: ", {DISTRICT:District.District_Name})
                let Constituencies = await this.constituency.Read({DISTRICT:District.District_Name})

                console.log(Constituencies)

                let TAs = await this.ta.Read({District:EPAs.District})

                let villages = []

                for(const ta of TAs){
                    let villagesRead = await this.village.Read({TACode:ta.TACode})
                    villages = villages.concat(villagesRead)
                }

                const organizationUnit = {
                    "ta":TAs,
                    "epa":EPAs,
                    "district":District,
                    "section": Section,
                    "villages": villages,
                    "constituency": Constituencies
                }

                res.json(organizationUnit)
            }else{
                res.status(404).json({message:"Invalid Section Code!"})
            }
        }catch(err){
            res.status(500).json({
                message:err.message,
                err
            })
        }
    }


}