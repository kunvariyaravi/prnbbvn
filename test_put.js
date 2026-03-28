const http = require('http');

const data = JSON.stringify({
    amountPutToTender: 50000
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/technical-sanctions/697dd3984e5f0bd736754843',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            if (json.data) {
                console.log("Updated amountPutToTender: " + json.data.amountPutToTender);
            } else {
                console.log("No data returned");
            }
        } catch (e) {
            console.log("Parse Error");
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
