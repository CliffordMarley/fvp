const MongoDBConnection = require("../config/dbconn.config");

module.exports = class HouseholdModel {
    constructor() {
        this.dbConnection = new MongoDBConnection()
        this.collection = null;
        this.initialize()
    }

    async initialize() {
        try {
            await this.dbConnection.connect();
            this.collection = this.dbConnection.getCollection('household');
        } catch (err) {
            throw err;
        }
    }

    async close() {
        try {
            await this.dbConnection.close();
        } catch (err) {
            throw err;
        }
    }

    async Read(filter = null) {
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }
            const documents = await this.collection.find(filter).toArray();
            return documents;
        } catch (err) {
            throw err;
        }
    }



    async ReadWithPagination (filter = null, offset, limit) {
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }
            const documents = await this.collection.find(filter).skip(offset).limit(limit).toArray();
            return documents;
        } catch (err) {
            throw err;
        }
    }

    async CountDocuments(filter = null) {
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }
            const documentCount = await this.collection.countDocuments(filter);
            return documentCount;
        } catch (err) {
            throw err;
        }
    }


    async updateByNationalID(National_ID, data) {
        try {
            if (!this.collection) {
                throw new Error('Collection not initialized. Call initialize() before using the model.');
            }
    
            const filter = { National_ID };
            
            // Exclude _id from the update data
            const updateData = { $set: { ...data } };
            delete updateData.$set._id; // Make sure _id is not included
    
            const options = { returnOriginal: false };
    
            const result = await this.collection.findOneAndUpdate(filter, updateData, options);
            return result.value;
        } catch (err) {
            throw err;
        }
    }

    fixDistrict = ()=>{
        try{
            const pipeline = [
                {
                    $match: {
                        $or: [
                            { District: null },
                            { District: "" }
                        ],
                        EPA: { $exists: true, $ne: "", $ne:null }
                    }
                },
                {
                    $lookup: {
                        from: "epa",
                        let: { householdEPA: { $toLower: "$EPA" } },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: [
                                            { $toLower: "$EPA_Name" },
                                            "$$householdEPA"
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "epa_info"
                    }
                },
                {
                    $unwind: "$epa_info"
                },
                {
                    $lookup: {
                        from: "district",
                        localField: "epa_info.District",
                        foreignField: "District_Code",
                        as: "district_info"
                    }
                },
                {
                    $unwind: "$district_info"
                },
                {
                    $set: {
                        Village: "$district_info.District_Name",
                        District: "$district_info.District_Name"
                    }
                },
                {
                    $project: {
                        epa_info: 0,
                        district_info: 0
                    }
                }
            ];
            
            this.collection.aggregate(pipeline).forEach(function (doc) {
                this.collection.update(
                    { _id: doc._id },
                    { $set: { District: doc.District.toUpperCase() } }
                );
            });
            console.log("District fix complete!")
        }catch(err){
            console.log(err)
        }
    }
    


}
