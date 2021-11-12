const express = require('express')
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fvtu8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db('drone_camera');
      const dataCollaction = database.collection('product');
      const orderCollaction = database.collection('myorders');
      const userCollection = database.collection('users');
      const reviewCollection = database.collection('review');
        //POST API
      app.post('/addproduct', async (req, res)=>{
        const food = req.body
        const result = await dataCollaction.insertOne(food);
        res.json(result)
    })
    //GET API
    app.get('/products', async(req, res)=>{
        const cursor = dataCollaction.find({});
        const order = await cursor.toArray();
        res.send(order)
    })
    //Get id
    app.get('/placeorder/:id', async(req, res)=>{
        const id = req.params.id
        const result = await dataCollaction.findOne({_id: ObjectId(id)})
        res.json(result)
    })
    //POST Orders
    app.post('/myorders', async (req, res)=>{
        const order = req.body
        const result = await orderCollaction.insertOne(order);
        res.json(result)
    })
    // Upsert: new user set on database Note: one user never set 2nd time
    app.post('/users', async (req, res)=>{
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.json(result);
        console.log(result);
    })
     // Make an admin , just add on database a role: example, with use update mathod 
     app.put('/users/admin', async(req, res)=>{
        const user = req.body;
        const filter = {email: user.email}
        const updateDoc = {$set: {role : 'admin'}}
        const result = await userCollection.updateOne(filter, updateDoc);
        res.json(result)
      })
       // Get admin with using email
     app.get('/users/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email: email};
        const result = await userCollection.findOne(query);
        let isAdmin = false;
        if(result?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin: isAdmin})
      })
      //manage all orders
      app.get('/allorder', async(req, res)=>{
        const cursor = orderCollaction.find({});
        const order = await cursor.toArray();
        res.send(order)
    })
     //update status Manage All order from the database
  app.put("/status/:id", async (req, res) => {
    const id = req.params.id;
    const Displaystatus = req.body;
    const filter = { _id: ObjectId(id) };
    const result = await orderCollaction.updateOne(filter, {$set: {status: "Shipped",},})
    res.send(result);
  });
  //manage product
  app.get('/manageproduct', async(req, res)=>{
    const cursor = dataCollaction.find({});
    const order = await cursor.toArray();
    res.send(order)
})
//delete Manage All order from the database
app.delete("/deletemanage/:id", async (req, res) => {
    console.log(req.params.id);
    dataCollaction.deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result);
      });
  });
  //GET myOrder
  app.get('/myallorder/:email', async(req, res)=>{
    const cursor = await orderCollaction.find({email: req.params.email}).toArray();
    res.send(cursor)
})
//delete My order
app.delete("/deleteorder/:id", async (req, res) => {
    console.log(req.params.id);
    orderCollaction.deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result);
      });
  });
  //
app.post('/review', async (req, res)=>{
    const review = req.body
    const result = await reviewCollection.insertOne(review);
    res.json(result)
})
//view review
app.get('/viewreview', async(req, res)=>{
    const cursor = reviewCollection.find({});
    const result = await cursor.toArray();
    res.json(result)
})
    //
    } 
    finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})