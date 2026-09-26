const Service = require('../models/Service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/services
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ serviceName: 1 });
    return successResponse(res, 200, 'Services fetched successfully', services);
  } catch (error) {
    next(error);
  }
};

// GET /api/services/:id
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return errorResponse(res, 404, 'Service not found', 'SERVICE_NOT_FOUND');
    }
    return successResponse(res, 200, 'Service details fetched', service);
  } catch (error) {
    next(error);
  }
};

// POST /api/services (Admin Only)
const createService = async (req, res, next) => {
  try {
    const { serviceName, duration, price, description } = req.body;

    const existing = await Service.findOne({ serviceName: { $regex: new RegExp(`^${serviceName.trim()}$`, 'i') } });
    if (existing) {
      return errorResponse(res, 409, 'Service with this name already exists', 'DUPLICATE_SERVICE');
    }

    const service = await Service.create({
      serviceName,
      duration,
      price,
      description,
    });

    return successResponse(res, 201, 'Service created successfully', service);
  } catch (error) {
    next(error);
  }
};

// PUT /api/services/:id (Admin Only)
const updateService = async (req, res, next) => {
  try {
    const { serviceName, duration, price, description } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return errorResponse(res, 404, 'Service not found', 'SERVICE_NOT_FOUND');
    }

    if (serviceName && serviceName !== service.serviceName) {
      const existing = await Service.findOne({
        serviceName: { $regex: new RegExp(`^${serviceName.trim()}$`, 'i') },
        _id: { $ne: service._id },
      });
      if (existing) {
        return errorResponse(res, 409, 'Service with this name already exists', 'DUPLICATE_SERVICE');
      }
    }

    service.serviceName = serviceName || service.serviceName;
    service.duration = duration !== undefined ? duration : service.duration;
    service.price = price !== undefined ? price : service.price;
    service.description = description !== undefined ? description : service.description;

    await service.save();

    return successResponse(res, 200, 'Service updated successfully', service);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/services/:id (Admin Only)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return errorResponse(res, 404, 'Service not found', 'SERVICE_NOT_FOUND');
    }
    return successResponse(res, 200, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
