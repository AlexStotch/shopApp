const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const { cpuUsage } = require('process');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('6086deaa403a7532b6da25a3')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://Ale:dadeda123@cluster0.uleyf.mongodb.net/shop?retryWrites=true&w=majority')
.then(() => {
    User.findOne().then(user => {
        if (!user) {
            const user = new User({
                name: 'Alex',
                email: 'alex@alex.fr',
                cart: {
                    items: []
                }
            });
            user.save();
        }
    });
    app.listen(3000)
})
.catch(err => console.log(err))