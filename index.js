const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
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
        // await client.connect();

        const classesCollection = client.db("lotusGrove").collection("classes");
        const extraClassCollection = client.db("lotusGrove").collection("extrasection");
        const selectedClasses = client.db("lotusGrove").collection("selected_classes");
        const usersCollection = client.db("lotusGrove").collection("users");

        app.get('/classes', async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        });


        app.get('/classes/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await classesCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/classes', async (req, res) => {
            const newClass = req.body;
            const result = await classesCollection.insertOne(newClass);
            res.send(result);
        });

        app.patch('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updateStatus = req.body;
            console.log(updateStatus)
            const updateDoc = {
                $set: {
                    status: updateStatus.status,
                }
            };
            const result = await classesCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        app.patch('/feedback/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const updateData = req.body;
            const updateDoc = {
                $set: {
                    feedback: updateData.feedback
                }
            };
            const result = await classesCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        app.get('/extra', async (req, res) => {
            const result = await extraClassCollection.find().toArray();
            res.send(result);
        });


        //  send to clint side and receve to the server site 
        app.post('/selectedClass', async (req, res) => {
            const selectedClass = req.body;
            const result = await selectedClasses.insertOne(selectedClass);
            res.send(result);
        });


        // get this data clint site releted post method
        app.get('/selectedClass/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await selectedClasses.find(query).toArray();
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

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query);
            res.send(result);
        });

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = newUser.email;
            const query = { email: email };
            const isExists = await usersCollection.findOne(query);
            if (isExists) {
                console.log('user already created')
                return res.send({ message: 'user Already created' })
            }
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        });

        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const newRole = req.body;
            const updateDoc = {
                $set: {
                    role: newRole.role
                }
            };
            const result = await usersCollection.updateOne(query, updateDoc);
            res.send(result);
        });


        // create payment intent 
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = price * 100
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })
            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })





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