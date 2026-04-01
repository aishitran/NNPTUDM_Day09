var express = require('express');
var router = express.Router();

let Inventory = require('../schemas/inventory');

require('../schemas/products');

// ================= GET ALL =================
router.get('/', async (req, res) => {
    try {
        const data = await Inventory.find()
            .populate('product');

        res.send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// ================= GET BY ID =================
router.get('/:id', async (req, res) => {
    try {
        const data = await Inventory.findById(req.params.id)
            .populate('product');

        if (!data) {
            return res.status(404).send("Inventory not found");
        }

        res.send(data);
    } catch (error) {
        res.status(400).send(error.message);
    }
});


// ================= ADD STOCK =================
router.post('/add-stock', async (req, res) => {
    try {
        const { product, quantity } = req.body;

        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send("Invalid data");
        }

        let inventory = await Inventory.findOne({ product });

        if (!inventory) {
            return res.status(404).send("Inventory not found");
        }

        inventory.stock += quantity;

        await inventory.save();

        res.send({
            message: "Add stock success",
            inventory
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
});


// ================= REMOVE STOCK =================
router.post('/remove-stock', async (req, res) => {
    try {
        const { product, quantity } = req.body;

        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send("Invalid data");
        }

        let inventory = await Inventory.findOne({ product });

        if (!inventory) {
            return res.status(404).send("Inventory not found");
        }

        if (inventory.stock < quantity) {
            return res.status(400).send("Not enough stock");
        }

        inventory.stock -= quantity;

        await inventory.save();

        res.send({
            message: "Remove stock success",
            inventory
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
});


// ================= RESERVATION =================
router.post('/reservation', async (req, res) => {
    try {
        const { product, quantity } = req.body;

        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send("Invalid data");
        }

        let inventory = await Inventory.findOne({ product });

        if (!inventory) {
            return res.status(404).send("Inventory not found");
        }

        if (inventory.stock < quantity) {
            return res.status(400).send("Not enough stock to reserve");
        }

        inventory.stock -= quantity;
        inventory.reserved += quantity;

        await inventory.save();

        res.send({
            message: "Reservation success",
            inventory
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
});


// ================= SOLD =================
router.post('/sold', async (req, res) => {
    try {
        const { product, quantity } = req.body;

        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send("Invalid data");
        }

        let inventory = await Inventory.findOne({ product });

        if (!inventory) {
            return res.status(404).send("Inventory not found");
        }

        if (inventory.reserved < quantity) {
            return res.status(400).send("Not enough reserved");
        }

        inventory.reserved -= quantity;
        inventory.soldCount += quantity;

        await inventory.save();

        res.send({
            message: "Sold success",
            inventory
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
});


module.exports = router;