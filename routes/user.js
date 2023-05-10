const express = require('express')
// const router = express.Router()
const router = require('express-promise-router')()

const UserController = require('../controllers/user')

const { validateBody, validateParam, schemas } = require('../helpers/routerHelpers')

const passport = require('passport')
const passportConfig = require('../middleware/passport.js')

router.route('/')
  .get(UserController.index)
  .post(validateBody(schemas.userSchema), UserController.newUser)

router.route('/auth/google').post(passport.authenticate('google-plus-token', { session: false }), UserController.authGoogle)

router.route('/auth/facebook').post(passport.authenticate('facebook-token', { session: false }), UserController.authFacebook)


//sử dụng hàm kiểm tra pass cho middleware của cái router này
router.route('/signup').post(validateBody(schemas.authSignUpSchema), UserController.singUp)

router.route('/signin').post(validateBody(schemas.authSignIpSchema), passport.authenticate('local', { session: false }), UserController.singIn)

router.route('/secret').get(passport.authenticate('jwt', { session: false }), UserController.secret) //cái này chắc để chuyển những thông tin khi đã xác thực token
//cái này dùng để test unlock những mã secret trong quá trình sử dụng API => sử dụng router này để test cái config của passport

//jwt là một bên thứ 3, nó ko phải là bên chính, nên cần phải khai báo require để biết đc config của bạn(bạn là bên chính) với jwt nó là gì
//session(phiên họp) là false là vì đây là môi trường API

/*chatGPT: hỏi:tôi đang hiểu nó jwt là một bên thứ ba nên cần khai báo để biết config của chúng ta với jwt là gì, vậy tôi có hiểu đúng không?
session được gán là false do môi trường API thì như vậy, giải thích thêm chỗ này được không?

trả lời:
jwt trong đoạn code là tên chiến lược xác thực (authentication strategy) được đăng ký với Passport, và nó sử dụng JSON Web Token (JWT) để xác thực người dùng.
Trong khi sử dụng JWT để xác thực, không cần sử dụng phiên (session) giống như khi sử dụng xác thực cơ bản dựa trên phiên (session-based authentication). Vì vậy, chúng ta cần đặt session là false để đảm bảo rằng Passport không sử dụng phiên để lưu trữ thông tin xác thực của người dùng. Thay vào đó, thông tin xác thực sẽ được lưu trữ trong JWT được gửi đến bên server thông qua header của request.
Ngoài ra, khi chúng ta đặt session là false, chúng ta cũng giảm thiểu chi phí tính toán và tăng tốc độ xử lý của ứng dụng bởi vì không cần phải tạo và duy trì phiên cho mỗi yêu cầu của người dùng.*/

//nếu ko sài session: false để hủy cái phiên lưu trữ của passport thì thường sẽ gặp lỗi này: Login sessions require session support. Did you forget to use `express-session` middleware?
router.route('/:userID')
  .get(validateParam(schemas.idSchema, 'userID'), UserController.getUser)
  .put(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.userSchema), UserController.replaceUser)
  .patch(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.userOptionalSchema), UserController.updateUser)

router.route('/:userID/decks')
  .get(validateParam(schemas.idSchema, 'userID'), UserController.getUserDecks)
  .post(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.deckSchema), UserController.newUserDeck)

module.exports = router