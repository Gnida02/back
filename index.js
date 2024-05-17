const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authMiddleware = require('./middlewaree/authMiddleware')
const roleMiddleware = require('./middlewaree/roleMiddleware')

dotenv.config();

const db = require('./core/db');
const { patientValidation, appointmentValidation,userValidation,serviceValidation } = require('./utils/validations');
const { PatientCtrl, AppointmentCtrl,authCtrl,ServiceCtrl } = require('./controllers');


const app = express();
app.use(express.json());
app.use(cors());


app.post('/registration',userValidation.registration,authCtrl.registration);
app.post('/login', authCtrl.login);
app.get('/users', authCtrl.getUsers);
app.get('/roles', authCtrl.getRoles);
app.get('/currentUser',  authCtrl.getCurrentUser)
app.post('/changeRole', authCtrl.changeUserRole);
app.delete('/users/:id', authCtrl.deleteUser);
app.post('/changePassword', authCtrl.changePassword);


app.get('/patients/:userId', PatientCtrl.all);
app.post('/patients', patientValidation.create, PatientCtrl.create);
app.delete('/patients/:id', PatientCtrl.remove);
app.patch('/patients/:id', patientValidation.create, PatientCtrl.update);
app.get('/patients/show/:id', PatientCtrl.show);

app.get('/appointments/:userId', AppointmentCtrl.all);
app.post('/appointments', appointmentValidation.create , AppointmentCtrl.create);
app.delete('/appointments/:id', AppointmentCtrl.remove);
app.patch('/appointments/:id',  appointmentValidation.update, AppointmentCtrl.update);
app.post('/appointments/:id',appointmentValidation.createcomment, AppointmentCtrl.addComment);

app.get('/services', ServiceCtrl.getAllServices);
app.get('/services/:id', ServiceCtrl.getServiceById);
app.post('/services',serviceValidation.createServices, ServiceCtrl.createService);
app.post('/services/:category', ServiceCtrl.createServiceByCategory);
app.patch('/services/:id', serviceValidation.updateServices, ServiceCtrl.updateService);
app.patch('/services/:id/:category', ServiceCtrl.updateServiceByCategory);
app.delete('/services/:id', ServiceCtrl.deleteService);


app.listen(6666, function(err) {
  if (err) {
    return console.log(err);
  }
  console.log('Server runned!');
});