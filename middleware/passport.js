const passport = require('passport')
//passport-jwt là 1 method sử dụng ở trong passport, nó dùng để giải mã đoạn code đã mã hóa
const JwtStrategy = require('passport-jwt').Strategy
const LocalStrategy = require('passport-local').Strategy
const FacebookTokenStrategy = require('passport-facebook-token')
const GooglePlusTokenStrategy = require('passport-google-plus-token')
const { ExtractJwt } = require('passport-jwt')
const { JWT_SECRET, auth } = require('../config')

const User = require('../models/User')

//passport jwt
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'), //cái này bây h còn mỗi fromAuthHeaderAsBearerToken() còn hoạt động, khi điền vào postman, ta cần vô header, chọn key(tức là đoạn string cho vào để chèn ấy) là Authorization, còn value(Bearer + "_" + mã endcode bất kỳ đã được tạo trước đó)
  secretOrKey: JWT_SECRET, //cái này cần cái chuỗi NodejsApiAuthentication để giải mã, kiểu như cái này là key mà, nên mã hóa hay giải mã đều cần dùng
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub)
    if (!user) return done(null, false); //nếu không tồn tại user đấy thì có thể do csdl không lưu nhưng vẫn trả ra token với cái id đấy
    //null là không có lỗi gì á, và nó có giá trị là user chứ ko phải là false thì hàm này cho phép nhảy sang hàm khác, hàm khác ở đây sẽ là phần code bên trong đoạn user.controller của secret, hiện tại nó đang là console.log
    done(null, user)
  } catch (error) {
    done(error, false);
  } //nếu callback gặp lỗi thì nó done cái lỗi đó, kèm theo false có nghĩa là ko cho vượt qua
}))
//đầu vào của cái callback(cái thứ 2 sau dấu phảy á) gồm payload thì hiểu trong jwt rồi, còn done là một cái hàm giống như next() của middleware, tức khi xong thì nó chuyển sang hàm tiếp theo

//passport Google
passport.use(new GooglePlusTokenStrategy({
  clientID: auth.google.CLIENT_ID,
  clientSecret: auth.google.CLIENT_SECRET,
}, async (accessToken, refreshToken, profile, done) => {
  try {

    //kiểm tra xem user hiện tạn đã tồn tại trong hệ thống chưa?
    //nếu chưa thì tạo tài khoản và trả token cho người dùng
    //nếu đã tồn tại thì lấy ra và trả token cho người dùng
    //const isExistUser = await User.countDocuments({}) //cái này cũng là 1 câu lệnh truy vấn như findOne, nhưng thay vì trả ra kết quả thì nó trả ra số lượng thỏa mãn đk
    const user = await User.findOne({ authGoogleID: profile.id, authType: "google" })

    if (user) return done(null, user) //nếu người dùng đã có tk gg khi đăng nhập

    const newUser = new User({
      authType: 'google',
      authGoogleID: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName
    })

    await newUser.save()
    done(null, newUser)

  } catch (error) {
    next(error);
  }
}))


//passport Facebook
passport.use(new FacebookTokenStrategy({
  clientID: auth.facebook.CLIENT_ID,
  clientSecret: auth.facebook.CLIENT_SECRET,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    //kiểm tra xem user hiện tạn đã tồn tại trong hệ thống chưa?
    const user = await User.findOne({ authFacebookID: profile.id, authType: "facebook" })

    if (user) return done(null, user) //nếu người dùng đã có tk gg khi đăng nhập

    const newUser = new User({
      authType: 'facebook',
      authFacebookID: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName
    })

    await newUser.save()
    done(null, newUser)

  } catch (error) {
    console.error('error: ', error)
    next(error);
  }
}))


//passport local
passport.use(new LocalStrategy({
  usernameField: 'email',
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email }) //check user thông quan email

    //nếu không tồn tại user
    if (!user)
      return done(null, false)

    //so sánh password này với password trong csdl, ở đây cần dùng bcryt tiếp vì pass trong csdl là đã hash, còn mã ở đây thì chưa
    const isCorrectPassword = await user.isValidPassword(password)

    if (!isCorrectPassword)
      return done(null, false) //nếu không đúng, trả ra false

    done(null, user) //nếu đúng trả ra user
    //ở đây có nghĩa nó sẽ cho chạy hàm tiếp theo ở controller và nó sẽ giao phó 1 trường use có chứa thông tin user ở trên chỗ đoạn findOne bên trên của hàm á vào trong cái request
  } catch (error) {
    done(error, false)
  }
}))