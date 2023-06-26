const { Configuration, OpenAIApi } = require("openai");
const {Property, PropertyType} = require('../models');

require("dotenv").config();


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let main = async () => {
// get the last 10 properties
const properties = await Property.findAll({
    where: { propertyTypeId: [1,2,3,4,5,6,7] },
    limit: 100,
    order: [['createdAt', 'ASC']]
});

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


(async () => {
    await main();
})();