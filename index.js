const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {MongoClient, ObjectId} = require('mongodb');
const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pa04j.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
  
  // insert product
  app.post('/addProduct', (req, res) => {
      const product = req.body;
      productCollection.insertOne(product, (err, result) => {
          console.log(result);
          res.send({status: 'sucess', code: 200});
      });
  })

  // get product
  app.get('/products', (req, res) => {
      productCollection.find().sort({$natural:-1})
      .toArray((err, documents) => {
          res.send(documents);
      });
  });

  // delete product
  app.delete('/product/delete/:id', (req, res) => {
      const {id} = req.params;
      productCollection.deleteOne({_id: ObjectId(id)}, (err, result) => {
          res.send({status: 'Successfully Delete', code: 200});
      });
  });

  // single product load
  app.get('/product/:id', (req, res) => {
      const {id} = req.params;
      productCollection.find({_id: ObjectId(id)})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  // update product
  app.put('/product/update/:id', (req, res) => {
      const {id} = req.params;
      const {name, weight, price} = req.body;
      productCollection.updateOne({_id: ObjectId(id)}, {$set:{name, weight, price}})
      .then((result) => {
          res.send({status: 'success', code: 200});
      })
  })
  
  // some product get
  app.post('/products/cart', (req, res) => {
      const cartItems = req.body;
      let items = [];
      cartItems.forEach(ele => items.push(ObjectId(ele.id)));
      productCollection.find({_id: {$in: items}})
      .toArray((err, documents) => {
          res.send(documents);
      })
  })


  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  
  // order set
  app.post('/addOrder', (req, res) => {
    const orders = req.body;
    orderCollection.insertMany(orders)
    .then(() => {
        res.send({status: 'Success Ordered', code: 200});
    })
  });

  // orders get by email
  app.post('/orders', (req, res) => {
      const {email} = req.body;
      orderCollection.find({email: email}).sort({$natural:-1})
      .toArray((err, documents) => {
          res.send(documents);
      })
  })
});


app.listen(process.env.PORT || port);