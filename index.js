const HL7 = require('hl7-standard');
const xmlParser = require('xml2json');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(cookieParser());
app.use(bodyParser.text({type: '*/*'}));

app.post('/hl7', async (req, res) => {
    const rawData = req.body;

    console.log(rawData);

    return parse__hl7v2__name(rawData).then(nameParts => {
        const readable = getNameString(nameParts);

        return {
            readable: readable,
            nameParts: nameParts,
        };
    }).catch(error_v2 => {
       return parse__hl7v3__name(rawData).then(nameParts => {
            const readable = getNameString(nameParts);

            return {
                readable: readable,
                nameParts: nameParts,
            };
        }).catch(error_v3 => {
            throw {
                v2_error: error_v2,
                v3_error: error_v3,
            };
        })
    }).then(finalResults => {
        return res.status(200).type('json').send(finalResults);
    }).catch(error => {
        const _ = {
            errorMessage_v2: error?.v2_error?.message || error?.message || "Unknown",
            errorMessage_v3: error?.v3_error?.message || error?.message || "Unknown",
            error: error,
        };

        console.error(_);
        
        return res.status(400).type('json').send(_);
    });
});

app.listen(3000, () => {
    console.log("Server listening at http://localhost:3000");
});

function getNameString(data) {
    let name = "";

    if (data.given) {
        for (const part of data.given) {
            if (name) {
                name += ' ';
            }

            name += part;
        }
    }

    if (data.family) {
        for (const part of data.family) {
            if (name) {
                name += ' ';
            }
            
            name += part;
        }
    }

    return name;
}

function parse__hl7v2__name(data) {
    return new Promise((resolve, reject) => {
        try {
            const hl7 = new HL7(data || '');

            hl7.transform(() => {
                try {
                    const pid = hl7.getSegments('PID');

                    // It's important to note that hl7-standard doesn't always error on invalid inputs (just returns an empty array)
                    if (!pid || !pid.length) {
                        throw new Error("Unexpected data is either empty or badly formatted for v2");
                    }
                        
                    // For v2, There's some PID index (commonly PID.5, but there's no true standard, and specifics can depend on each organization) that should include the patient's full name
                    const namePID = hl7.get('PID.5');
                    
                    const nameParts = [];

                    Object.keys(namePID).forEach(key => {
                        nameParts.push({
                            section: key,
                            value: namePID[key],
                        });
                    });

                    nameParts.sort((a, b) => {
                        a.section.localeCompare(b.section);
                    });

                    const given = [];
                    const family = [];

                    for (let i = 0; i < nameParts.length; i++) {
                        const namePart = nameParts[i];

                        // Normally the first section is the Family name, and the rest are considered the Given name
                        if (i === 0) {
                            family.push(namePart.value);
                        } else {
                            given.push(namePart.value);
                        }
                    }

                    resolve({
                        given: given,
                        family: family,
                    });
                } catch (error) {
                    reject(error || new Error("Unexpected Error parsing data using hl7 v2"));
                }
            }, error => {
                reject(error || new Error("Unknown error"));
            });
        } catch (error) {
            return Promise.reject(error || new Error("Unexpected data is invalid for hl7 v2"));
        }
    });
}

const parse__hl7v3__name = (data) => {
    return new Promise((resolve, reject) => {
        try {
            // It's important to note that xmlParser doesn't always error on invalid inputs (just returns an empty object)
            const jsonOutput = xmlParser.toJson(data || '', { object: true });

            if (!jsonOutput || Object.keys(jsonOutput).length === 0) {
                throw new Error("Parsing data using xml errored. Data is either empty of badly formatted");
            }

            const givenParts = getEachItem(jsonOutput, hasKey('given'));
            const familyParts = getEachItem(jsonOutput, hasKey('family'));

            const given = [];
            const family = [];

            for (const givenPart of givenParts) {
                if (Array.isArray(givenPart.value)) {
                    for (const _ of givenPart.value) {
                        given.push(_);
                    }
                } else {
                    given.push(givenPart.value);
                }
            }

            for (const familyPart of familyParts) {
                if (Array.isArray(familyPart.value)) {
                    for (const _g of familyPart.value) {
                        family.push(_g);
                    }
                } else {
                    family.push(familyPart.value);
                }
            }

            resolve({
                given: given,
                family: family,
            });
        } catch (error) {
            reject(error || new Error("Unexpected data is invalid for hl7 v3"));
        }
    });
}

// Modified the sample code found here
// source: https://dev.to/alisabaj/searching-through-a-nested-object-using-recursion-regular-expressions-and-sets-bm7
// Search a nested object for some key, value and get an array of matches based on whatever searchMethod you pass

function hasKey(key) {
    return (_key, value) => {
        if (_key === key) {
            return true;
        }

        return false;
    }
}

// Helpers
function getEachItem(obj, searchMethod) {
    const result = [];

    Object.keys(obj).forEach(key => {
        searchItem(obj[key], searchMethod, result);
    });

    return result;
};

function searchItem(item, searchMethod, result) {
    if (item) {
        Object.keys(item).forEach(key => {
            const value = item[key];

            if (typeof value === "object" && !Array.isArray(value)) {
                searchItem(value, searchMethod, result);
            } else {
                if (searchMethod(key, value)) {
                    result.push({key: key, value: value});
                }
            }
        });
    }
}
