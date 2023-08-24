const DistrictModel = require("../models/district.model")

module.exports = class{

    constructor(){
        this.districtModel = new DistrictModel()
    }

    Index = async (req, res)=>{
        try {
            const districts = await this.districtModel.ReadAll()
      
            res.render('aedomanager', {
                title:"AEDO Manager",
                districts
            }) 
        } catch (err) {
            console.log(err)
        }
    }

}