const { User, Role, Appointment,Patient } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')
const {secret} = require("../config")

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"} )
}
function authController() {}

    const registration = async function(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка при регистрации", errors})
            }
            const {username, email, password} = req.body;
            const candidate = await User.findOne({ $or: [{ email }, { username }] });
        
            if (candidate) {
                return res.status(400).json({message: "Пользователь с таким username и email уже существует"});
            }
            
            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({value: "USER"})
            const user = new User({username,email, password: hashPassword, roles: [userRole.value]})
            await user.save()
            return res.json({message: "Пользователь успешно зарегистрирован"})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Registration error'})
        }
    }

    const login = async function(req, res) {
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})
            if (!user) {
                return res.status(400).json({message: `Пользователь ${email} не найден`})
            }
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                return res.status(400).json({message: `Введен неверный пароль`})
            }
            const token = generateAccessToken(user._id, user.roles)
            return res.json({token})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Login error'})
        }
    }

    const getUsers = async function(req, res) {
        try {
            const users = await User.find()
            res.json(users)
        } catch (e) {
            console.log(e)
        }
    }

    const getRoles = async function(req, res) {
        try {
            const roles = await Role.find()
            res.json(roles)
        } catch (e) {
            console.log(e)
        }
    }
      
      const getCurrentUser = async function(req, res) {
        try {
            // Получаем токен из заголовка Authorization
            const token = req.headers.authorization.split(' ')[1];
            // Проверяем наличие токена
            if (!token) {
                return res.status(401).json({ message: 'Отсутствует токен авторизации' });
            }
            // Верифицируем токен
            const decoded = jwt.verify(token, secret);
            // Извлекаем id пользователя из токена
            const userId = decoded.id;
            // Находим пользователя в базе данных
            const user = await User.findById(userId);
            // Проверяем, найден ли пользователь
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            // Если пользователь найден, возвращаем его данные
            return res.json(user);
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Ошибка при получении текущего пользователя' });
        }
    }

    // Изменение роли пользователя
    const changeUserRole = async function(req, res) {
        try {
            const { userId, newRole } = req.body;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const role = await Role.findOne({ value: newRole });
            if (!role) {
                return res.status(404).json({ message: 'Указанной роли не существует' });
            }

            user.roles = [role.value];
            await user.save();

            return res.json({ message: 'Роль пользователя успешно изменена' });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: 'Ошибка при изменении роли пользователя' });
        }
    }

    // Удаление пользователя
    /*const deleteUser = async function (req, res) {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            await user.remove();
            return res.json({ message: 'Пользователь успешно удален' });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: 'Ошибка при удалении пользователя' });
        }
    }*/
    
      const deleteUser = async function (req, res) {
    try {
        const userId = req.params.id;

        // Находим пользователя по userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

       // console.log(`Пользователь найден: ${user._id}`);

        // Удаляем все приемы, связанные с пользователем (как врачом)
        const deletedUserAppointments = await Appointment.deleteMany({ user: userId });
       // console.log(`Удалено приемов, связанных с пользователем: ${deletedUserAppointments.deletedCount}`);

        // Находим запись пациента, связанную с этим пользователем
        const patient = await Patient.findOne({ user: userId });
        if (patient) {
            //console.log(`Пациент найден: ${patient._id}`);

            // Удаляем все приемы, связанные с этим пациентом
            const deletedPatientAppointments = await Appointment.deleteMany({ patient: patient._id });
            //console.log(`Удалено приемов, связанных с пациентом: ${deletedPatientAppointments.deletedCount}`);

            // Удаляем запись пациента
            const deletedPatient = await Patient.findByIdAndDelete(patient._id);
           // console.log(`Пациент удален: ${deletedPatient}`);
        } else {
            console.log('Пациент не найден');
        }

        // Удаляем самого пользователя
        const deletedUser = await User.findByIdAndDelete(userId);
       // console.log(`Пользователь удален: ${deletedUser}`);

        return res.json({ message: 'Пользователь и и его пациенты и приемы удалены' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Ошибка при удалении пользователя и связанных данных' });
    }
}
    const changePassword = async function(req, res) {
        try {
            const { userId, oldPassword, newPassword } = req.body;
    
            // Находим пользователя в базе данных по ID
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
    
            // Проверяем соответствие старого пароля
            const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Старый пароль указан неверно' });
            }
    
            // Хешируем новый пароль
            const hashNewPassword = bcrypt.hashSync(newPassword, 7);
    
            // Обновляем пароль пользователя
            user.password = hashNewPassword;
            await user.save();
    
            return res.json({ message: 'Пароль успешно изменен' });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: 'Ошибка при смене пароля' });
        }
    }

	authController.prototype = {
		registration,
		login,
		getUsers,
        getRoles,
        getCurrentUser,
        changeUserRole,
        deleteUser,
        changePassword,
	};

module.exports = authController;
