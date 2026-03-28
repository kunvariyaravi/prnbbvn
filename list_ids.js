const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://kunvariyaravi:kunvariyaravi41@cluster1.qnkfvpe.mongodb.net/?appName=Cluster1";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('test');
        const tenders = database.collection('tenders');

        const someTenders = await tenders.find().limit(5).toArray();
        console.log("--- IDS ---");
        someTenders.forEach(t => console.log(`${t.workName.substring(0, 30)}... : ${t._id}`));
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
