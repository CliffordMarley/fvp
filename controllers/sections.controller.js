const SectionModel = require("../models/section.model")
module.exports = class HouseholdsController{

    constructor(){
        this.section = new SectionModel()
    }

    Read = async (req, res)=>{
        try{
            const filter = req.query
            console.log(filter)
            await this.section.initialize()

            const sections = await this.section.Read(filter)

            res.json(sections)
        }catch(err){
            res.status(500).json({
                message:err.message
            })
        }
    }


}