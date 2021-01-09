# hl7-parser-endpoint

## Simple Node Server that shows how to parse hl7 v2/v3 messages

Sample code should be used a base for whatever needs you'd use it for. Useful for adding functionality to a Node server / cloud functions to parse incoming hl7 messages of either v2/v3

## Install

Requires Node 14+

`npm install`

## Serve

`npm run start`

Starts a server that listens at `http://localhost:3000` and has an endpoint for parsing hl7 v2/v3 messages and returns the name of the patient at `http://localhost:3000/hl7`

Although hl7 is somewhat of a standard, I've found that organizations do whatever they want for the most part, so you might have to use trial and error to figure out how to get the data you need.

Commonly for v2, PID.5 is the name. The first section is the Family name (last name), and any other sections is the Given name (first name, middle name, etc).


Commonly for v3, the name section is the name attribute. The Given name is the nested given attribute, and the Family name is the family attribute.


## Resources:

hl7 v2 parsing: [hl7-standard](https://github.com/ironbridgecorp/hl7-standard)

hl7 v3 parsing (xml): [node-xml2json](https://github.com/buglabs/node-xml2json#readme)
