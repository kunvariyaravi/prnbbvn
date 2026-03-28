const http = require('http');

http.get('http://localhost:3000/api/technical-sanctions', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.data && json.data.length > 0) {
                console.log("ID:" + json.data[0]._id);
            } else {
                console.log("No data");
            }
        } catch (e) {
            console.log("Parse Error: " + e.message);
            console.log("Raw Data: " + data);
        }
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
