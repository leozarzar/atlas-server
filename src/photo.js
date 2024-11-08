const fs = require('fs');
const path = require('path');

module.exports = async function loadPhoto(photo_path){
    if(photo_path) try{
        const filePath = path.join(__dirname, '../', photo_path);
        const data = await fs.promises.readFile(filePath);
        const imageBase64 = data.toString('base64');
        return imageBase64;
    }catch(error){
        console.log(error)
        return null;
    }
    return null;
}