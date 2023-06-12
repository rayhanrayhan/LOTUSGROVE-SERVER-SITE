const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb connection
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v73g3gy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const classesCollection = client.db("lotusGrove").collection("classes");
        const extraClassCollection = client.db("lotusGrove").collection("extrasection");
        const selectedClasses = client.db("lotusGrove").collection("selected_classes");

        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        });

        app.get('/extra', async (req, res) => {
            const result = await extraClassCollection.find().toArray();
            res.send(result);
        });


        //  send to clint side and receve to the server site 
        app.post('/selectedClass', async (req, res) => {
            const selectedClass = req.body;
            const query = { classId: selectedClass.classId } //cheak dublicate
            const isExists = await selectedClasses.findOne(query)
            if (isExists) {
                return res.send({ message: 'All Ready Exists' })
            }
            const result = await selectedClasses.insertOne(selectedClass);
            res.send(result);
        });


        // get this data clint site releted post method
        app.get('/selectedClass', async (req, res) => {
            const result = await selectedClasses.find().toArray();
            res.send(result);
        });

        //  dashboard delete data 
        app.delete('/selectedClass/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await selectedClasses.deleteOne(query)
            res.send(result);
        });








        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('boss is sitting');
});

app.listen(port, () => {
    console.log(`Lotusgrove is running ${port}`);
});
