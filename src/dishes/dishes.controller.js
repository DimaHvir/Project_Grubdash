const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function verifyDish(req, res, next) {
  const {dishId} = req.params;
  const foundDish = dishes.find((dish) => dish.id == Number(dishId));
  if (foundDish) {
    res.locals.foundDish = foundDish;
    return next();
  }
  else {
    return next( {status: 404, message : `invalid dishId ${dishId}`} );
  }
}
function verifyInput(req, res, next) {
  const {data : newDish} = req.body;
  const {dishId} = req.params;
  if (dishId && newDish.id) {
    if (Number(dishId) != newDish.id) {
      return next( {status : 400, message : `id ${dishId} not the same as ${newDish.id}`});
    }
  }
  if (newDish.name && newDish.description && newDish.image_url && newDish.price && newDish.price > 0 && typeof newDish.price === 'number') {
    res.locals.input = newDish;
    return next();
  }
  else {
    return next( {status : 400, message : `name, image_url, description, or price is invalid`});
  }
}
function list(req, res) {
  res.json({data : dishes});
}
function read(req, res) {
  res.json({data : res.locals.foundDish});
}
function add(req, res, next) {
  res.locals.input.id = nextId();
  dishes.push(res.locals.input);
  res.status(201).json({data : res.locals.input});
}
function update(req, res, next) {
  res.locals.input.id = res.locals.foundDish.id;
  res.locals.foundDish = res.locals.input;
  res.status(200).json({data : res.locals.foundDish});
}

module.exports = {
  list,
  read : [verifyDish, read],
  add : [verifyInput, add],
  update : [verifyDish, verifyInput, update]
}