const User = require("../../models/userModel");
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    console.log({ body: req.body })
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).{8,}$/;
    try {
      const { fullname, email, password, phone } = req.body;
      if (req.body.email == undefined || req.body.email == '') {
        return ErrorResponse(res, 'Email  is Required !');
      }
      if (req.body.password == undefined || req.body.password == '') {
        return ErrorResponse(res, 'Password  is Required !');
      }
      const userExists = await User.findOne({ email: req.body.email.toLowerCase().replace(/\s/g, '') })
      if (userExists) {
        return ErrorResponse(res, 'This Email Is Already Registered Please Login Instead ')
      }
      if (!passwordRegex.test(req.body.password)) {
        return ErrorResponse(res, 'Password Should must contain : A Capital letter, A Number  and A special Character');
      }
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(password, salt);
      const reqBody = new User({
        fullname,
        email: email.toLowerCase(),
        phone,
        profilePic: "/assets/user_profile.png",
        salt,
        password: hash,
      })
      let user = await reqBody.save()
      const token = await genJwtToken(user._id)
      console.log({ token })
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      delete userWithoutPassword.salt;
      return SuccessResponse(res, { token, user: userWithoutPassword })
    } catch (error) {
      console.error("Error during user registration:", error);
      ErrorResponse(res, error.message)
    }
  }
  const downloadAndProcessImage = async (url, destination) => {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
      });
      await sharp(response.data)
        .toFile(destination);
    } catch (error) {
      console.error('Failed:', error);
    }
  };
  const continue_with_google = async (req, res) => {
    try {
      const { email, fullname, photoURL, phoneNumber, fcm_token } = req.body
      console.log({ gogoleBody: req.body })
      const userExists = await User.findOne({ email })
      console.log({ userExists })
      let fileName;
      const emailName = email.toString().split("@")[0]
      if (photoURL) {
        fileName = `/uploads/${emailName}_${Date.now()}.webp`
        downloadAndProcessImage(photoURL, `./public${fileName}`)
      }
      if (!userExists) {
        const newUser = User({
          fullname,
          email,
          profilePic: fileName,
          phone: phoneNumber
        })
        newUser.fcm_token = fcm_token
        const saveUser = await newUser.save()
        const token = await genJwtToken(saveUser._id)
        console.log({ token })
        const userWithoutPassword = saveUser.toObject();
        delete userWithoutPassword.password;
        delete userWithoutPassword.salt;
        await sendRegistrationEmail(email, fullname);
        return SuccessResponse(res, { token, user: userWithoutPassword })
      } else {
        const token = await genJwtToken(userExists._id)
        const userWithoutPassword = userExists.toObject();
        delete userWithoutPassword.salt
        delete userWithoutPassword.password
        return SuccessResponse(res, { token, user: userWithoutPassword })
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return ErrorResponse(res, error.message);
    }
  };
  const loginUser = async function (req, res) {
    console.log(req.body)
    const { email, password, fcm_token } = req.body
    try {
      if (!email) {
        return ErrorResponse(res, 'Email is Required!');
      }
      let userExists = await User.findOne({ email });
      if (userExists == null || userExists.length < 1) {
        return ErrorResponse(res, 'User Not Matched !');
      }
      if (userExists.accountStatus === 'freezed') {
        return ErrorResponse(res, 'Your Account is temporarily blocked!');
      }
      if (userExists.accountStatus === 'suspended') {
        return ErrorResponse(res, 'Your Account is suspended!');
      }
      if (!userExists.password || userExists.password == "") {
        return ErrorResponse(res, 'Please login via Google');
      }
      const match = await bcrypt.compare(password, userExists.password);
      if (!match) {
        return ErrorResponse(res, 'Invalid Password!');
      }
      userExists.fcm_token = fcm_token
      await userExists.save()
      const token = await genJwtToken(userExists._id)
      const userWithoutPassword = userExists.toObject();
      delete userWithoutPassword.salt
      delete userWithoutPassword.password
      return SuccessResponse(res, { token, user: userWithoutPassword })
    } catch (error) {
      console.error(error);
      return ErrorResponse(res, 'Internal Server Error !' + error.message);
    }
  }


  const ErrorResponse = (res, message, statusCode = 400) => {
    res.status(statusCode).json({
      success: false,
      error: message
    });
  };
  
  const SuccessResponse = (res, message, statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      error: message
    });
  };

  module.exports = {loginUser,registerUser,continue_with_google};