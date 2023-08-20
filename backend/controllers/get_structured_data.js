const fs = require('fs');
const xml2js = require('xml2js');

const get_structured_data = function (filename) {
    return new Promise(function (resolve, reject) {
        const xml = fs.readFileSync(`extracted/${filename}.xml`, 'utf-8');

        // Parse the XML
        const parser = new xml2js.Parser();
        parser.parseString(xml, (err, parsedXml) => {
            if (err || parsedXml == null) {
                reject(err);
            }

            //   const signature = parsedXml['OfflinePaperlessKyc']['Signature'][0];
            const { name, dob, e, gender, m } = parsedXml['OfflinePaperlessKyc']['UidData'][0]['Poi'][0]['$'];
            const { country, dist, pc, po, state, street, subdist, vtc } = parsedXml['OfflinePaperlessKyc']['UidData'][0]['Poa'][0]['$'];

            const data = {
                name,
                dob,
                e,
                gender,
                country,
                dist,
                pc,
                po,
                state,
                street,
                subdist,
                vtc
            }
            // console.log('data in module', data);
            resolve(data);
        });
    });
}

module.exports = {
    get_structured_data
}