var express = require('express');
var router = express.Router();
let slugify = require('slugify');

let productModel = require('../schemas/products');
let Inventory = require('../schemas/inventory');


// ================= GET ALL =================
router.get('/', async function (req, res, next) {
  try {
    let queries = req.query;

    let titleQ = queries.title ? queries.title.toLowerCase() : '';
    let min = queries.minprice ? Number(queries.minprice) : 0;
    let max = queries.maxprice ? Number(queries.maxprice) : 10000;

    let data = await productModel.find({
      isDeleted: false,
      title: new RegExp(titleQ, 'i'),
      price: {
        $gte: min,
        $lte: max
      }
    }).populate({
      path: 'category',
      select: 'name'
    });

    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// ================= GET BY ID =================
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;

    let result = await productModel.findOne({
      _id: id,
      isDeleted: false
    });

    if (!result) {
      return res.status(404).send("ID NOT FOUND");
    }

    res.send(result);

  } catch (error) {
    res.status(400).send(error.message);
  }
});


// ================= CREATE PRODUCT =================
router.post('/', async function (req, res, next) {
  try {
    let newProduct = new productModel({
      title: req.body.title,
      slug: slugify(req.body.title, {
        lower: true,
        trim: true
      }),
      price: req.body.price,
      images: req.body.images,
      description: req.body.description,
      category: req.body.category
    });

    await newProduct.save();

    // AUTO CREATE INVENTORY
    let existedInventory = await Inventory.findOne({
      product: newProduct._id
    });

    if (!existedInventory) {
      await Inventory.create({
        product: newProduct._id,
        stock: 0,
        reserved: 0,
        soldCount: 0
      });
    }

    res.send({
      message: "Create product success",
      product: newProduct
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});


// ================= UPDATE =================
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;

    let result = await productModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!result) {
      return res.status(404).send("Product not found");
    }

    res.send(result);

  } catch (error) {
    res.status(400).send(error.message);
  }
});


// ================= DELETE (SOFT DELETE) =================
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;

    let result = await productModel.findById(id);

    if (!result) {
      return res.status(404).send("Product not found");
    }

    result.isDeleted = true;
    await result.save();

    res.send({
      message: "Deleted successfully",
      product: result
    });

  } catch (error) {
    res.status(400).send(error.message);
  }
});


module.exports = router;