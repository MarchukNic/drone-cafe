const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
  name: String,
  email: String,
  balance: Number
});

const DishSchema = new Schema({
  title: String,
  image: String,
  rating: Number,
  ingredients: [String],
  price: Number
});

const OrderSchema = new Schema({
  userId: mongoose.Schema.ObjectId,
  dishId: mongoose.Schema.ObjectId,
  status: String
});

const Client = mongoose.model('Client', ClientSchema, 'clients');
const Dish = mongoose.model('Dish', DishSchema, 'dishes');
const Order = mongoose.model('Order', OrderSchema, 'orders');

module.exports = {
  Client,
  Dish,
  Order
};