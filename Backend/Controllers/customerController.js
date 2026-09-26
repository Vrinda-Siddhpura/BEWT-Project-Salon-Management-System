const express = require("express");
const router = express.Router();
const Customer = require("../Schema/customers");
const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware("Administrator", "Receptionist"));

//getAllCustomer
router.get("/", async(req, res) => {
    try{
        const customer = await Customer.find();
        res.status(200).json(customer);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
})

//getByIdCustomer
router.get("/:id", async(req, res) => {
    try{
        const customer = await Customer.findById(req.params.id);

        if(!customer){
            return res.status(404).json({
                message: "Customer not found!"
            });
        }

        res.status(200).json(customer);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
})

//addCustomer
router.post("/", async(req, res) => {
    try{
        const customer = await Customer.create(req.body);

        res.status(201).json({
            message: "Customer added successfully",
            customer
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
})

//updateCustomer
router.put("/:id", async(req, res) => {
    try{
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )

        if(!customer){
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.status(200).json({
            message: "Customer updated successfully",
            customer
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
})

//deleteCustomer
router.delete("/:id", async(req, res) => {
    try{
        const customer = await Customer.findByIdAndDelete(req.params.id)

        if(!customer){
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.status(200).json({
            message: "Customer deleted successfully",
            customer
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
})

module.exports = router;