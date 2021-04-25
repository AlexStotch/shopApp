const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
  constructor(username, email, cart, id) {
    this.name = username,
    this.email = email
    this.cart = cart, // {items: []} 
    this._id = id ? new mongodb.ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartItems = this.cart.items ? this.cart.items : [];
    const cartProductIndex = cartItems.findIndex(cp => {
      return new mongodb.ObjectId(cp.productId).toString() === product._id.toString();            
    });
    let newQuantity = 1;
    const updatedCartItem = [...cartItems];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItem[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItem.push({
        productId: new mongodb.ObjectId(product._id), 
        quantity: newQuantity
      })
    }
    const updatedCart = {
      items: updatedCartItem
    };
    const db = getDb();
    return db.collection('users')
    .updateOne({_id: this._id}, {$set: {cart: updatedCart}})
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(item => {
      return item.productId;
    });
    return db.collection('products')
    .find({_id: {$in: productIds}})
    .toArray()
    .then(products => {
      return products.map(product => {
        return {
          ...product, 
          quantity: this.cart.items.find(item => {
            return item.productId.toString() === product._id.toString()
        }).quantity}
      })
    })

  }

  deleteItemFromCart(productId) {
    const updatedCartItem = this.cart.items.filter(item => {
      return item.productId != productId;
    });
    const db = getDb();
    return db.collection('users')
    .updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: {items: updatedCartItem}}})
  }

  addOrder() {
    const db = getDb();
    return this.getCart().then(products => {
      const order = {
        items: products,
        user: {
          _id: new mongodb.ObjectId(this._id),
          name: this.name,
          email: this.email
        }
      };
      return db.collection('orders').insertOne(order);
    })
    .then(res => {
      this.cart = {items: []};
      return db
      .collection('users')
      .updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: {items: []}}});
    });
  }

  getOrders() {
    const db = getDb();
    return db
    .collection('orders').find({'user._id': new mongodb.ObjectId(this._id)}).toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users')
    .findOne({_id : new mongodb.ObjectId(userId)})
    .catch(err => console.log(err));
  }
}

module.exports = User;