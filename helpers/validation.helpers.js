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
        "Constituency",
        "EPA",
        "FO_Type",
        "Farmer_Organization",
        "Farming_Water_Source",
        "Fertilizer_Utilization",
        "Fit_For_Work",
        "In_Fisheries_Farming",
        "In_Livestock_Farming",
        "Land_Ownership_Type",
        "Last_Season_Production",
        "Name_Of_Household_Head",
        "National_ID",
        "Purpose_Of_Production",
        "Section",
        "Sex",
        "TA",
        "Updated_By",
        "Village",
        "_id"
    ]

    const missingKeys = requiredKeys.filter(key => {
        const keyMissing = !Object.prototype.hasOwnProperty.call(data, key);
        const valueIsNullUndefined = data[key] === null || data[key] === undefined || data[key] == "";
        const booleanValueIsNotFalse = typeof data[key] === 'boolean' && data[key] !== false;
    
        if (keyMissing || valueIsNullUndefined || booleanValueIsNotFalse) {
          //  console.log(`Missing or invalid key: ${key}`);
        }
    
        // Return true if any of the conditions are met
        return keyMissing || valueIsNullUndefined || booleanValueIsNotFalse;
    });
    
    if (missingKeys.length > 0) {
        return false;
        // return `The following fields are missing: ${missingKeys.join(', ')}`;
    }
    
    // return "All required fields are present!";
    return true;
    
}

let CastData = data=>{
    data.Fit_For_Work = Boolean(data.Fit_For_Work)
    data.In_Fisheries_Farming = Boolean(data.In_Fisheries_Farming)
    data.In_Livestock_Farming = Boolean(data.In_Livestock_Farming)
    data.In_Poutry_Farming = Boolean(data.In_Poutry_Farming)
    data.Total_Arable_Land_Size = smartParse(data.Total_Arable_Land_Size)
    data.Total_Arable_Land_Used = smartParse(data.Total_Arable_Land_Used)

    data = capitalizeNonEmptyStrings(data)

    return data
}

smartParse = value=>{
    try{
        return parseFloat(value)
    }catch{
        return value
    }
}

let isNonEmptyNonNumericString = (value)=>{
    return typeof value === 'string' && value.trim() !== '' && isNaN(value);
}

let capitalizeNonEmptyStrings = (obj)=>{
    try{
        if (typeof obj === 'object') {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (isNonEmptyNonNumericString(obj[key])) {
                        obj[key] = obj[key].toUpperCase();
                    } else if (typeof obj[key] === 'object') {
                        capitalizeNonEmptyStrings(obj[key]);
                    }
                }
            }
        } else if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                if (typeof obj[i] === 'object') {
                    capitalizeNonEmptyStrings(obj[i]);
                }
            }
        }
    }catch(err){
        
    }finally{
        return obj
    }
}


module.exports = {Isset, isInList, validateHouseholdData, validateHouseholdKeys, CastData}