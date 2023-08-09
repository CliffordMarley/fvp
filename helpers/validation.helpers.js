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
    const requiredKeys = ["_id", "National_ID", "Name_Of_Household_Head", "Spouse_Name", "Spouse_NID", "Sex", "Village", "Section", "District", "ADD", "Farmer_Organization", "FO_Type", "Major_Enterprize", "NM_Tracker_Id", "Coordinates", "Total_Farm_Land_Size", "In_Irrigated_Farming", "In_Rain_Fed_Farming", "In_Crop_Farming", "In_Fisheries_Farming", "In_Livestock_Farming", "In_Rainfed_Farming", "In_Crop_Enterprise", "In_Fisheries_Enterprise", "In_Livestock_Enterprise", "GVA", "TA", "Support_Program", "Support_Type", "Fit_For_Work", "HH_Number", "Has_Farm_Land", "Mobile_Number", "PMT_Score", "Role", "UBR_Arable_Land_Owned", "UBR_Arable_Land_Used", "UBR_Assisted", "UBR_Commercial_Acres", "UBR_InOrganic_Fertilizer", "UBR_Irrigated_Land_Acres", "UBR_Land_Ownership_Type", "UBR_Organic_Fertilizer", "UBR_Poutry", "UBR_Total_Land_Owned", "UBR_Wet_Land_Owned", "UBR_Wet_Land_Used", "Wealth_Quantile"];

    const missingKeys = requiredKeys.filter(key => !Object.prototype.hasOwnProperty.call(data, key));

    if (missingKeys.length > 0) {
        return false
        //return `The following fields are missing: ${missingKeys.join(', ')}`;
    }

    //return "All required fields are present!";
    return true
}



module.exports = {Isset, isInList, validateHouseholdData, validateHouseholdKeys}