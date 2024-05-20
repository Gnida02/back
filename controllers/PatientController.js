const { validationResult } = require('express-validator');
const { Patient,User,Appointment } = require('../models');

function PatientContoller() {}

const create = function(req, res) {
  const errors = validationResult(req);
  const data = {
    user: req.body.user,
    fullname: req.body.fullname,
    phone: req.body.phone
  };

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()
    });
  }

  Patient.create(data, function(err, doc) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err
      });
    }

    res.status(201).json({
      success: true,
      data: doc
    });
  });
};

const update = async function(req, res) {
  const patientId = req.params.id;
  const errors = validationResult(req);

  const data = {
    fullname: req.body.fullname,
    phone: req.body.phone
  };

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()
    });
  }

  Patient.updateOne({ _id: patientId }, { $set: data }, function(err, doc) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err
      });
    }

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'PATIENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Пациент обновлен'
    });
  });
};

const remove = async function(req, res) {
  const id = req.params.id;

  try {
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'PATIENT_NOT_FOUND'
      });
    }

    // Delete the patient's appointments first
    await Appointment.deleteMany({ patient: id });

    // Delete the patient
    await Patient.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Пациент и его приемы удалены успешно'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err
    });
  }
};

const show = async function(req, res) {
  const id = req.params.id;
  try {
    const patient = await Patient.findById(id)
      .populate({ 
        path: 'appointments',
        populate: {
          path: 'user',
          model: 'User'
        }})
      .exec();

    res.json({
      status: 'succces',
      data: { ...patient._doc, appointments: patient.appointments }
    });
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: 'PATIENT_NOT_FOUND'
    });
  }
};

const all = async function(req, res) {
  let user;
  try {
    user = await User.findById(req.params.userId)
      .exec();
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: 'USER_NOT_FOUND'
    });
  }
  const options = user?.roles.includes('ADMIN') ? {} : {user:req.params.userId}
  Patient.find(options, function(err, docs) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err
      });
    }

    res.json({
      status: 'succces',
      data: docs
    });
  });
};

PatientContoller.prototype = {
  all,
  create,
  update,
  remove,
  show
};

module.exports = PatientContoller;
