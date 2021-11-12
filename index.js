const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// droneDb
// FiF0Y2bMbbQfNfbo

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xhhzl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {

        await client.connect();
        const database = client.db('droneSell');
        const droneCollection = database.collection('drone');
        const orderCollection = database.collection('orders');
        const userCollection = database.collection('users');
        const reviewCollection = database.collection('review');


        // get products
        app.get('/products', async (req, res) => {
            const cursor = droneCollection.find({});
            const drone = await cursor.toArray();
            res.send(drone);
        })

        // get all products
        app.get('/explore', async (req, res) => {
            const result = droneCollection.find({});
            const drone = await result.toArray();
            res.send(drone);
        })

        // get single product
        app.get('/detail/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await droneCollection.findOne(query);
            res.send(result);

        })

        // post api
        app.post('/detail', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);

        })

        // Myorders
        app.get('/myOrders/:email', async (req, res) => {
            const result = await orderCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        })

        // Add review
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        // get Review
        app.get('/showReviews', async (req, res) => {
            const review = reviewCollection.find({})
            const result = await review.toArray();
            res.send(result);
        })

        // deleteOrder
        app.delete('/deleteOrder/:id', async (req, res) => {
            const result = await orderCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.send(result);
        })


        // users

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result)
        })

        // user put
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role == 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        // post explore

        app.post("/explore", async (req, res) => {
            const drone = req.body;
            const result = await droneCollection.insertOne(drone);
            res.send(result)
        });


        // all orders
        app.get("/allOrders", async (req, res) => {
            const result = await orderCollection.find({}).toArray();
            res.send(result);
        });

        // status update

        app.put("/status/:id", async (req, res) => {
            const id = req.params.id;
            const status = req.body;
            const filter = { _id: ObjectId(id) };
            const result = await orderCollection.updateOne(filter, { $set: { status: "Shipped", }, })
            res.send(result);
        })

        // manageProducts
        app.get("/products", async (req, res) => {
            const result = await droneCollection.find({}).toArray();
            res.send(result);
        });

        // productDelete
        app.delete("/deleteProducts/:id", async (req, res) => {

            const result = await droneCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });



        // Delete Order
        app.delete("/orderDelete/:id", async (req, res) => {

            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });


    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Drone is Flying')
})


app.listen(port, () => {
    console.log('Drone is flying', port)
})