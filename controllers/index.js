const PatientController = require('./PatientController');
const AppointmentController = require('./AppointmentController');
const authController = require('./authController');
const ServiceController = require('./ServiceController');

module.exports = {
  PatientCtrl: new PatientController(),
  AppointmentCtrl: new AppointmentController(),
  authCtrl: new authController(),
  ServiceCtrl: new ServiceController(),
};