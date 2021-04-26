const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    cart: {
       items: [{
           productId: {
               type: Schema.Types.ObjectId,
               ref: 'Product', 
               required: true,
           },
           quantity: {
               type: Number,
               required: true,
       }}]
    },
});

userSchema.methods.addToCart = function(product) {
    const cartItems = this.cart.items ? this.cart.items : [];
    const cartProductIndex = cartItems.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();            
    });
    let newQuantity = 1;
    const updatedCartItem = [...cartItems];
    
    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItem[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItem.push({
            productId: product._id,
            quantity: newQuantity,
        })
    }
    const updatedCart = {
        items: updatedCartItem
    };
    this.cart = updatedCart;

    return this.save()
};

userSchema.methods.deleteItemFromCart = function(productId) {
    const updatedCartItem = this.cart.items.filter(item => {
        return item.productId != productId;
    });
    this.cart.items = updatedCartItem;
    return this.save();
};

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
}


module.exports = mongoose.model('User', userSchema);
