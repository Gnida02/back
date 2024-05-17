const {Schema, model} = require('mongoose')


const User = new Schema({
    username: String,
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    roles: [{type: String, ref: 'Role'}]
})


module.exports = model('User', User)