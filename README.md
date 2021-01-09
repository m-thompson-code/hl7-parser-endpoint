# hl7-parser-endpoint

## Simple Node Server that shows how to parse hl7 v2/v3 messages

Sample code should be used a base for whatever needs you'd use it for. Useful for adding functionality to a Node server / cloud functions to parse incoming hl7 messages of either v2/v3

The endpoints exposed by this server expect a `POST` request with Content-Type: `text/plain` at `http://localhost:3000/hl7` (curls mentioned below)

## Install

Requires Node 14+

`npm install`

## Serve

`npm run start`

Starts a server that listens at `http://localhost:3000` and has an endpoint for parsing hl7 v2/v3 messages and returns the name of the patient at `http://localhost:3000/hl7`

Although hl7 is somewhat of a standard, I've found that organizations do whatever they want for the most part, so you might have to use trial and error to figure out how to get the data you need.

Commonly for v2, PID.5 is the name. The first section is the Family name (last name), and any other sections is the Given name (first name, middle name, etc).


Commonly for v3, the name section is the name attribute. The Given name is the nested given attribute, and the Family name is the family attribute.

## Samples / Curls

Repo includes a few samples of v2/v3 hl7 messages. Also some curls for hitting the endpoint locally once you run the server locally:

```
curl --location --request POST 'http://localhost:3000/hl7' \
--header 'Content-Type: text/plain' \
--data-raw 'MSH|^~\&||.|||199908180016||ADT^A04|ADT.1.1698593|P|2.7
PID|1||000395122||LEVERKUHN^ADRIAN^C||19880517180606|M|||6 66TH AVE NE^^WEIMAR^DL^98052||(157)983-3296|||S||12354768|87654321
NK1|1|TALLIS^THOMAS^C|GRANDFATHER|12914 SPEM ST^^ALIUM^IN^98052|(157)883-6176
NK1|2|WEBERN^ANTON|SON|12 STRASSE MUSIK^^VIENNA^AUS^11212|(123)456-7890
IN1|1|PRE2||LIFE PRUDENT BUYER|PO BOX 23523^WELLINGTON^ON^98111|||19601||||||||THOMAS^JAMES^M|F|||||||||||||||||||ZKA535529776'
```

```
curl --location --request POST 'http://localhost:3000/hl7' \
--header 'Content-Type: text/plain' \
--data-raw '<recordTarget>
    <patientClinical>
    <id root="2.16.840.1.113883.19.1122.5" extension="444-22-2222"
        assigningAuthorityName="GHH Lab Patient IDs"/>
    <statusCode code="active"/>
        <patientPerson>
            <name use="L">
            <given>Eve</given>
            <given>E</given>
            <family>Everywoman</family>
            </name>
            <asOtherIDs>
            <id extension="AC555444444" assigningAuthorityName="SSN"
                root="2.16.840.1.113883.4.1"/>
            </asOtherIDs>
        </patientPerson>
    </patientClinical>
</recordTarget>'
```

You can find more samples [here](http://www.ringholm.com/docs/04300_en.htm)

## Resources

hl7 v2 parsing: [hl7-standard](https://github.com/ironbridgecorp/hl7-standard)

hl7 v3 parsing (xml): [node-xml2json](https://github.com/buglabs/node-xml2json#readme)
