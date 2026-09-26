const express = require("express");
const router = express.Router();
const Service = require("../Schema/services");

const authMiddleware = require("../Middleware/authMiddleware");
const roleMiddleware = require("../Middleware/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware("Administrator", "Receptionist"));

//getAllServices
router.get("/", async(req, res) => {
    try{
        const service = await Service.find();
        res.status(200).json(service);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
});

//getServiceById
router.get("/:id", async(req, res) => {
    try{
        const service = await Service.findById(req.params.id);

        if(!service){
            return res.status(404).json({
                message: "Service not found!"
            });
        }

        res.status(200).json(service);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
})

//addServices
router.post("/", async(req, res) => {
    try{
        console.log("BODY:", req.body);
        
        const service = await Service.create(req.body);

        res.status(201).json({
            message: "Service added successfully",
            service
        });
    }
    catch(err){
        console.log("SERVICE ERROR:", err.message);
        res.status(500).json({message: err.message});
    }
})

//updateServices
router.put("/:id", async(req, res) => {
    try{
        const service = await Service.findByIdAndUpdate(
            req.params.id, 
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if(!service){
            return res.status(404).json({
                message: "Service not found!"
            });
        }

        res.status(200).json({
            message: "Service updated successfully",
            service
        });
    }
    catch(err){
        res.status(500).json({message: err.message});   
    }
})

//deleteServices
router.delete("/:id", async(req, res) => {
    try{
        const service = await Service.findByIdAndDelete(req.params.id);

        if(!service){
            return res.status(404).json({
                message: "Service not found!"
            });
        }

        res.status(200).json({
            message: "Service deleted successfully",
            service
        });
    }
    catch(err){
        res.status(500).json({message: err.message});   
    }
})

module.exports = router;