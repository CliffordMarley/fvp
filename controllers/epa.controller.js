const EPAModel = require("../models/epa.model")
const SectionModel = require('../models/section.model')
module.exports = class{

    constructor(){
        this.epaModel = new EPAModel()
        this.sectionModel = new SectionModel()
    }

    ReadEPA = async (req, res)=>{
        try {
            const filter = req.params
            const epas = await this.epaModel.Read(filter)
            res.json(epas)
        } catch (err) {
            res.status(500).json(err)
        }
    }

    ReadSection = async (req, res)=>{
        try {
            const filter = req.params
            console.log(filter)
            const sections = await this.sectionModel.Read(filter)
            res.json(sections)
        } catch (err) {
            res.status(500).json(err)
        }
    }
}