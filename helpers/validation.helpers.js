const Isset = (value) => {
    return value != null && value != typeof undefined && value != ''
}  

const isInList = (Id, array)=>{
    const output = array.filter(item=>item.id == Id)
    return (output.length > 0)
}

function validateHouseholdData(data) {
    const exceptions = ["Spouse_Name", "Spouse_NID"];

    for (const key in data) {
        if (!exceptions.includes(key) && data[key] === null) {
            return false;
        }
    }

    return true;
}

function validateHouseholdKeys(data) {
    const requiredKeys = [
        "ADD",
        "Constituency",
        "Coordinates",
        "District",
        "EPA",
        "FO_Type",
        "Farmer_Organization",
        "Farming_Water_Source",
        "Fertilizer_Utilization",
        "Fit_For_Work",
        "GVH",
        "In_Fisheries_Farming",
        "In_Livestock_Farming",
        "In_Poutry_Farming",
        "Land_Ownership_Type",
        "Last_Season_Production",
        "Livestock_Type",
        "Major_Enterprize",
        "NRB_Validation",
        "Name_Of_Household_Head",
        "National_ID",
        "Purpose_Of_Production",
        "Section",
        "Sex",
        "Spouse_NID",
        "Spouse_Name",
        "Support_Program",
        "Support_Type",
        "TA",
        "Total_Arable_Land_Size",
        "Total_Arable_Land_Used",
        "Updated",
        "Updated_By",
        "Village",
        "_id"
    ]

    const missingKeys = requiredKeys.filter(key => {
        // Check if the key is missing or if the value is not false
        return !Object.prototype.hasOwnProperty.call(data, key) && data[key] !== false;
    });
    
    if (missingKeys.length > 0) {
        return false;
        // return `The following fields are missing: ${missingKeys.join(', ')}`;
    }
    
    // return "All required fields are present!";
    return true;
}



module.exports = {Isset, isInList, validateHouseholdData, validateHouseholdKeys}