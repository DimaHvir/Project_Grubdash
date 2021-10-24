const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function verifyOrder (req, res, next) {
  const {orderId} = req.params;
  const foundOrder = orders.find((order) => order.id == Number(orderId));
  if (foundOrder) {
    res.locals.foundOrder = foundOrder;
    return next();
  }
  else {
    return next( {status: 404, message : `invalid orderId ${orderId}`} );
  }
}
function verifyInput (req, res, next) {
  const {data : newOrder} = req.body;
  if (newOrder.deliverTo && newOrder.mobileNumber && Array.isArray(newOrder.dishes) && newOrder.dishes.length > 0) {
    for (let i = 0; i < newOrder.dishes.length; i++) {
      if (!newOrder.dishes[i].quantity || newOrder.dishes[i].quantity == 0 || ! Number.isInteger(newOrder.dishes[i].quantity)) {
        return next({status : 400, message : `${i} dish quantity invalid`});
      }
    }
    res.locals.input = newOrder;
    return next();
  }
  else {
    console.log(newOrder);
    return next( {status : 400, message : `invaid deliverTo or status or mobileNumber or dish or dishes`});
  }
}

function list (req, res) {
  res.json({data : orders});
}
function read (req, res, next) {
  res.status(200).json({data : res.locals.foundOrder});
}
function add (req, res, next) {
  res.locals.input.id = nextId();
  orders.push(res.locals.input);
  res.status(201).json({data : res.locals.input});
}
function update (req, res, next) {
  if (res.locals.input.id) {
    if (res.locals.input.id != res.locals.foundOrder.id)
      {
    return next( {status : 400, message : `id ${res.locals.input.id}`});
      }
  }
  if (!res.locals.input.status || res.locals.input.status == 'invalid') {
    return next( {status : 400, message : `invaid status`});
  }
  res.locals.input.id = res.locals.foundOrder.id;
  res.locals.foundOrder = res.locals.input;
  res.status(200).json({data : res.locals.input});
}

function destroy (req, res, next) {
  if (res.locals.foundOrder.status !== 'pending') {
    next({status : 400, message : 'status is not pending'})
  }
  const index = orders.indexOf(res.locals.foundOrder);
  orders.splice(index, 1);
  res.status(204).json({});
}

module.exports = {
  list,
  read : [verifyOrder, read],
  add : [verifyInput, add],
  update : [verifyOrder, verifyInput, update],
  delete : [verifyOrder, destroy]
}