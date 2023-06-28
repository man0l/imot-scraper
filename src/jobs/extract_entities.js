const { Configuration, OpenAIApi } = require("openai");
const {Property, PropertyType} = require('../models');
const levenshtein = require('fast-levenshtein');
const fs = require('fs').promises;
const path = require('path');
require("dotenv").config();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let main = async () => {
    let filePath = path.join(__dirname, '../' + 'config/sofia_streets.json');
    let file = await fs.readFile(filePath, 'utf8');
    let streets = JSON.parse(file);

// get the last 10 properties
const properties = await Property.findAll({
    select: ['id', 'description', 'price', 'area', 'floor', 'year', 'constructionType', 'propertyFeatures', 'location', 'city', 'district'],
    where: { propertyTypeId: [1,2,3,4,5,6,7, 8] },
    limit: 100,
    order: [['createdAt', 'DESC']]
});

for (property of properties) {
    await sleep(3000);
    //let streetName = findStreetInDescription(streets, property.description);
    //console.log(streetName);
    await query({"inputs": property.description}).then((response) => {
        console.log(JSON.stringify(response));
    });
}
return;
properties.forEach(async property => {
            await sleep(3000);
            let prompt = `
            Answer the following questions about the property below:
            ${property.description}         
            ${property.price} EUR
            ${property.area} m2
            ${property.floor} floor
            ${property.year} year
            ${property.constructionType}
            ${property.propertyFeatures}
            ${property.location}
            ${property.city}
            ${property.district}
            
            Answer only if it is present in the text above:
            - Is it still in construction?
            - Is it a new or old building?
            - What is the year of construction?
            - Which are the nearby streets? (return as array of strings)
            - Which are the nearby other physical objects in the city? (return as array of strings)
            - Is there a parking lot?
            - Is there a garage?
            - Is there a basement?
            - Is there a lift?
            - Which are the nearby a public transport stop?
            - Is there a nearby school?
            - Is there a nearby kindergarten?
            - Is there a nearby hospital?
            - Which are the nearby supermarket?
            - Which is the nearby park?
            - Which is the nearby mall?
            - Is there a nearby restaurant?
            - Is there a nearby cafe?
            - Walking distance to the nearest object / street / transport stop or other entity? (string in meters if present)
            Output in JSON format with short keys and short values wth strings only if any of the above is present in the text above:
            `;
            console.log(prompt);
            return;
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{role: 'user', 'content': prompt}]
            });
    
              console.log(response.data.choices[0].message.content);
            
    }); 
};

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/Davlan/bert-base-multilingual-cased-ner-hrl",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

function findStreetInDescription(streets, description) {
    const words = description.split(/\W+/); // split the description into words
    for (let i = 0; i < streets.length; i++) {
      for (let j = 0; j < words.length; j++) {
        if (levenshtein.get(streets[i], words[j]) <= 2) { // if Levenshtein distance is less than or equal to 2
          return streets[i]; // return the matching street
        }
      }
    }
    return null; // return null if no street is found
  }



(async () => {
    await main();
})();