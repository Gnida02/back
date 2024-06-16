const { validationResult } = require('express-validator');
const dayjs = require('dayjs');
const ruLocale = require('dayjs/locale/ru');
const { groupBy, reduce } = require('lodash');
const { Appointment, Patient, User, Service } = require('../models');

const axios = require('axios'); 

function AppointmentController() {}

/*const create = async function(req, res) {
  const errors = validationResult(req);
  let patient;
  let user;
  let service;

  const data = {
    patient: req.body.patient,
    user: req.body.user,
    service: req.body.service,
    dentNumber: req.body.dentNumber,
    diagnosis: req.body.diagnosis,
    comment: req.body.comment,
    price: req.body.price,
    date: req.body.date,
    time: req.body.time,
  };

  //console.log('comment:', data.comment);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array(),
    });
  }

  try {
    patient = await Patient.findOne({ _id: data.patient });
    user = await User.findOne({ _id: data.user });
    service = await Service.findOne({ _id: data.service });
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: 'PATIENT_OR_USER_NOT_FOUND',
    });
  }
  
  Appointment.create(data, function(err, doc) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }

   
    res.status(201).json({
      success: true,
      data: doc,
    });
  });
};*/

const create = async function(req, res) {
  const errors = validationResult(req);
  let patient;
  let user;
  let service;

  const data = {
    patient: req.body.patient,
    user: req.body.user,
    service: req.body.service,
    dentNumber: req.body.dentNumber,
    diagnosis: req.body.diagnosis,
    comment: req.body.comment,
    price: req.body.price,
    date: req.body.date,
    time: req.body.time,
  };

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array(),
    });
  }

  try {
    patient = await Patient.findOne({ _id: data.patient });
    user = await User.findOne({ _id: data.user });
    service = await Service.findOne({ _id: data.service });

    Appointment.create(data, async function(err, doc) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err,
        });
      }

      if (patient && patient.phone) {
        try {
          // Отправляем SMS уведомление о создании записи на прием
          const smsResponse = await axios.post('https://app.sms.by/api/v1/sendQuickSMS', {
            token: 'c7423879d130b72543adc8e3ac3e6113', // Заменить на API ключ от sms.by
            message: `Здравствуйте, ${patient.fullname}! Вы записаны в стоматологическую клинику ${data.date} на ${data.time}`,
            phone: patient.phone, 
          });

          if (smsResponse.status === 200) {
            console.log('SMS sent successfully');
          } else {
            console.error('Failed to send SMS');
          }
        } catch (smsError) {
          console.error('Error sending SMS' );
        }
      }

      res.status(201).json({
        success: true,
        data: doc,
      });
    });
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: 'PATIENT_OR_USER_NOT_FOUND',
    });
  }
};

const addComment = async function(req, res) {
  const appointmentId = req.params.id;
  const comment = req.body.comment; 

  if (!comment) {
    return res.status(400).json({
      success: false,
      message: 'COMMENT_REQUIRED',
    });
  }

  try {
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      { $set: { comment: comment } },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'APPOINTMENT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'INTERNAL_SERVER_ERROR',
    });
  }
};

const update = async function(req, res) {
  const appointmentId = req.params.id;
  const errors = validationResult(req);

  const data = {
    dentNumber: req.body.dentNumber,
    diagnosis: req.body.diagnosis,
    comment: req.body.comment,
    service: req.body.service,
    price: req.body.price,
    date: req.body.date,
    time: req.body.time,
  };

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array(),
    });
  }

  Appointment.updateOne({ _id: appointmentId }, { $set: data }, function(err, doc) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'APPOINTMENT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
    });
  });
};

const remove = async function(req, res) {
  const id = req.params.id;

  try {
    await Appointment.findOne({ _id: id });
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: 'APPOINTMENT_NOT_FOUND',
    });
  }

  Appointment.deleteOne({ _id: id }, err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }

    res.json({
      status: 'succces',
    });
  });
};

const all = async function(req, res) {
  //console.log(req.params.userId);
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
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1); // установка даты на один день назад
  
  Appointment.find({
    ...options,
    date: { $gte: currentDate } // Отбираем только записи, у которых дата больше или равна текущей дате и времени
  })
    .populate('patient')
    .populate({ 
      path: 'patient',
      populate: {
        path: 'user',
        model: 'User'
      }})
    .populate('service')
    .sort({ date: 1 }) // Сортировка по убыванию даты (более свежие сначала)
    .exec(function(err, docs) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: err,
        });
      }

      res.json({
        status: 'succces',
        data: reduce(
          groupBy(docs, 'date'),
          (result, value, key) => {
            result = [
              ...result,
              {
                title: dayjs(key)
                  .locale(ruLocale)
                  .format('D MMMM'),
                data: value,
              },
            ];
            return result;
          },
          [],
        ),
      });
    });
};

AppointmentController.prototype = {
  all,
  create,
  remove,
  update,
  addComment,
};

module.exports = AppointmentController;
