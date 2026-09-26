const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// GET /api/customers (Pagination, Search, Filter)
const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(res, 200, 'Customers fetched successfully', {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/:id
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return errorResponse(res, 404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    }

    // Fetch appointment history for customer
    const history = await Appointment.find({ customerId: customer._id })
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'name' },
      })
      .populate('serviceId')
      .sort({ appointmentDate: -1, startTime: -1 });

    return successResponse(res, 200, 'Customer details fetched', {
      customer,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, gender } = req.body;

    // Check if customer with phone already exists
    const existing = await Customer.findOne({ phone: phone.trim() });
    if (existing) {
      return errorResponse(res, 409, 'Customer with this phone number already exists', 'DUPLICATE_PHONE');
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      gender,
    });

    return successResponse(res, 201, 'Customer created successfully', customer);
  } catch (error) {
    next(error);
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, gender } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return errorResponse(res, 404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    }

    if (phone && phone !== customer.phone) {
      const existingPhone = await Customer.findOne({ phone: phone.trim(), _id: { $ne: customer._id } });
      if (existingPhone) {
        return errorResponse(res, 409, 'Phone number already in use by another customer', 'DUPLICATE_PHONE');
      }
    }

    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.email = email !== undefined ? email : customer.email;
    customer.gender = gender || customer.gender;

    await customer.save();

    return successResponse(res, 200, 'Customer updated successfully', customer);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return errorResponse(res, 404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    }

    return successResponse(res, 200, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
