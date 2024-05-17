const { validationResult } = require('express-validator');
const { Service } = require('../models');

function ServiceController() {}

const getAllServices = async function (req, res) {
  try {
    const services = await Service.find().sort({ price: 1 }); 
    if (!services || services.length === 0) {
      return res.status(404).json({ success: false, message: 'Services not found' });
    }

    const servicesByCategory = {};

    services.forEach(service => {
      const category = service.category;
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category].push(service);
    });

    res.json({ success: true, servicesByCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getServiceById = async (req, res) => {
  const serviceId = req.params.id;
  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { category, name, price } = req.body;

  try {
    const service = new Service({ category, name, price });
    await service.save();
    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createServiceByCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, price } = req.body;
  const category = req.params.category; // Получаем категорию из параметров запроса

  try {
    const service = new Service({ category, name, price });
    await service.save();
    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const updateService = async function (req, res) {
  const serviceId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const {category, name, price} = req.body;

  try {

    const updatedService = await Service.findByIdAndUpdate(serviceId, { category, name, price }, { new: true });

    if (!updatedService) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, service: updatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateServiceByCategory = async (req, res) => {
  const serviceId = req.params.id;
  const category = req.params.category;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, price } = req.body;

  try {
    const updatedService = await Service.findOneAndUpdate({ _id: serviceId, category: category }, { name, price }, { new: true });

    if (!updatedService) {
      return res.status(404).json({ success: false, message: 'Service not found in the specified category' });
    }

    res.json({ success: true, service: updatedService });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteService = async function (req, res) {
  const serviceId = req.params.id;
  try {
    const deletedService = await Service.findByIdAndDelete(serviceId);
    if (!deletedService) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


ServiceController.prototype = {
  getAllServices,
  getServiceById,
  createService,
  createServiceByCategory,
  updateService,
  updateServiceByCategory,
  deleteService,
};
  
module.exports = ServiceController;