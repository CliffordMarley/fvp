const EPAModel = require("../models/epa.model")
const SectionModel = require('../models/section.model')
const AEDOModel = require('../models/aedo.model')
module.exports = class{

    constructor(){
        this.epaModel = new EPAModel()
        this.sectionModel = new SectionModel()
        this.aedoModel = new AEDOModel()
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
    NewOfficer= async (req, res)=>{
        try {
            const data = req.body
            //Check exist
            const checkExist = await this.aedoModel.Read({
                Phone_Number: data.Phone_Number
            })
            if(checkExist.length > 0){
                throw new Error("Phone number already exist!")
            }
            await this.aedoModel.Create(data)
            res.json({message:"AEDO Account created successfully!"})
        } catch (err) {
            res.status(500).json(err)
        }
    }
}