const express = require('express')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()

const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//  midleware 
app.use(cors())
app.use(express.json())


//  kiddsToysWebsiteUser

//  2WJiGRdbIFMCKyqF



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vdrifst.mongodb.net/?retryWrites=true&w=majority`;

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

        const toysCollections = client.db('kiddstoyDB').collection("toys")


        const addToysCollection = client.db("addToyDb").collection("addtoys")


        // const toysCategoriesCollection = client.db('kiddstoysUserDB').collection("category")
        // const toysProductsCollection = client.db('kiddstoysUserDB').collection("toyproduct")




        app.get("/toys", async (req, res) => {
            const data = await toysCollections.find().toArray()
            res.send(data)
        })





        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toysCollections.find(query).toArray()
            res.send(result)
        })
        app.get("/toysDetails/:id", async (req, res) => {
            const toyId = req.params.id;
            try {
                const toy = await toysCollections.findOne({ "toys._id": toyId }, { projection: { _id: 0, toys: { $elemMatch: { _id: toyId } } } });
                if (toy) {
                    res.json(toy.toys[0]);
                } else {
                    res.status(404).json({ error: "Toy not found" });
                }
            } catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        });


        //  here is add toys using CRUD 
        app.post("/addtoys", async (req, res) => {
            const booking = req.body
            // console.log(booking);
            const result = await addToysCollection.insertOne(booking)
            res.send(result)

        })
        app.get("/addtoys", async (req, res) => {
            const data = await addToysCollection.find().limit(20).toArray()
            res.send(data)
        })
        app.get('/addtoys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await addToysCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/addtoys/email/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await addToysCollection.find(query).toArray();
            res.send(result);
        });
        // ------------




        app.put('/addtoys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedToy = req.body;

            const coffee = {
                $set: {
                    name: updatedToy.name,
                    taste: updatedToy.description,
                    category: updatedToy.price,
                    photo: updatedToy.pictureUrl
                }
            }

            const result = await addToysCollection.updateOne(filter, coffee, options);
            res.send(result);
        })



        app.delete("/addtoys/:id", async (req, res) => {

            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await addToysCollection.deleteOne(query)

            res.send(result)


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
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})