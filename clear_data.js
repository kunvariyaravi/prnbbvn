const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://kunvariyaravi:kunvariyaravi41@cluster1.qnkfvpe.mongodb.net/?appName=Cluster1";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('test');
        const tenders = database.collection('tenders');

        const result = await tenders.deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents`);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
