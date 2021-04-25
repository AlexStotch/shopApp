const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userid) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userid = userid;
  }

  save() {
    const db = getDb();
    let dbOpt;
    if (this._id) {
      dbOpt = db.collection('products')
      .updateOne({_id: this._id}, {$set: this});
    } else {
      dbOpt = db.collection('products').insertOne(this);
    }

    return dbOpt.then(res => {
    }).catch(err => console.log(err))
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products')
      .find()
      .toArray()
      .then(products => {
        return products
      })
      .catch(res => {console.log(res)});
  }

  static findById(id) {
    const db = getDb();
    return db.collection('products')
      .find({_id: new mongodb.ObjectId(id)})
      .next()
      .then(product => {
        return product
      })
      .catch(res => {console.log(res)});
  }

  static deleteById(prodId) {
    const db = getDb();
    return db.collection('products').deleteOne({_id: new mongodb.ObjectId(prodId)})
    .then(product => {
      console.log('DELETED');
    })
    .catch(res => {console.log(res)});
  }
}

module.exports = Product;
