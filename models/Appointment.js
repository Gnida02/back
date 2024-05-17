const mongoose = require('mongoose');
const { Schema } = mongoose;

const AppointmentSchema = new Schema(
  {
    dentNumber: Number,
    diagnosis: String,
    comment: String,
    price: Number,
    date: Date,
    time: String,
    patient: { type: Schema.Types.ObjectId, ref: 'Patient' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
  },
  {
    timestamps: true
  }
);

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;