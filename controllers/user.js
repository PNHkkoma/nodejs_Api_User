/**
 * We can interact with mongoose in three diffirent ways:
 * [v] Callback
 * [v] Promises
 * [v] Async/await (Promises)
 */

const Deck = require('../models/Deck')
const User = require('../models/User')
const { } = require('../config')
const JWT = require('jsonwebtoken')

const endcodedToken = (userID) => {
  return JWT.sign({
    iss: "Hưng", //người phát hành
    sub: userID, //chứa thông tin mà mình muốn để định danh cho use đấy,thông tin này là duy nhất, ko user nào có, có thể là id hoặc username
    iat: new Date().getTime(), //ngày phát hành
    exp: new Date().setDate(new Date().getDate() + 3) //ngày hết hạn, ở đây đặt là 3 ngày, tức là hết 3 ngày thì mình cần tạo một phiên đăng nhập mới nếu ko có cookie lưu  ấy, như cái ctt thì hết hạn khoảng vài giờ thôi
  }, 'NodejsApiAuthentication')
}//cái tham số NodejsApiAuthentication là cái chuỗi mình tự chèn vào thêm à, chính là secretOrPrivateKey
//bên trên secretOrPrivateKey là payload, tức thông tin mình chèn vào để tạo endcode
//, ở đây ko chuyền thêm callback

const authFacebook = async (req, res, next) => {
  const token = endcodedToken(req.user._id)
  res.setHeader('Authorization', token)
  return res.status(200).json({ success: true })
}

const authGoogle = async (req, res, next) => {
  const token = endcodedToken(req.user._id)
  res.setHeader('Authorization', token)
  return res.status(200).json({ success: true })
}

const getUser = async (req, res, next) => {
  const { userID } = req.value.params

  const user = await User.findById(userID)

  return res.status(200).json({ user })
}

const getUserDecks = async (req, res, next) => {
  const { userID } = req.value.params //params là 1 tham số(ví dụ như id) gắn kèm trên request

  // Get user
  const user = await User.findById(userID).populate('decks')

  return res.status(200).json({ decks: user.decks })
}

const index = async (req, res, next) => {
  const users = await User.find({})

  return res.status(200).json({ users })
}

const newUser = async (req, res, next) => {
  const newUser = new User(req.value.body)

  await newUser.save()

  return res.status(201).json({ user: newUser })
}

const newUserDeck = async (req, res, next) => {
  const { userID } = req.value.params

  // Create a new deck
  const newDeck = new Deck(req.value.body)

  // Get user
  const user = await User.findById(userID)

  // Assign user as a deck's owner
  newDeck.owner = user

  // Save the deck
  await newDeck.save()

  // Add deck to user's decks array 'decks'
  user.decks.push(newDeck._id)

  // Save the user
  await user.save()

  res.status(201).json({ deck: newDeck })
}

const replaceUser = async (req, res, next) => {
  // enforce new user to old user
  const { userID } = req.value.params

  const newUser = req.value.body

  const result = await User.findByIdAndUpdate(userID, newUser)

  return res.status(200).json({ success: true })
}

const secret = async (req, res, next) => {
  return res.status(200).json({ resources: true }) //resources là tài nguyên
}

const singIn = async (req, res, next) => {
  const token = endcodedToken(req.user._id)
  res.setHeader('Authorization', token)
  return res.status(200).json({ success: true })
}

//khi authen cho 1 user, request signup thành công thì đc vào trong hệ thống luôn
const singUp = async (req, res, next) => {
  console.log("test singUp") //thông báo đã nhận vào signup này
  const { firstName, lastName, email, password } = req.value.body //lưu thông tin vào từng biến riêng biệt

  //check xem database đã tồn tại trong hệ thống chưa
  const foundUser = await User.findOne({ email })
  console.log("found user ", foundUser)
  if (foundUser) return res.status(403).json({ error: { message: "email is alrealy in use" } })

  const newUser = new User({ firstName, lastName, email, password }) //khởi tạo 1 user và gán vào 1 biến
  console.log("new user: ", newUser) //consoe.log ra cho dễ nhìn
  newUser.save() //lưu vào database

  const token = endcodedToken(newUser._id) // tạo một token bằng cách cho vô hàm endcode với id của user cần tạo

  res.setHeader("Authentication", token) //gửi vô phần heaer với 1 trường tên Authentication có giá trị là token
  return res.status(200).json({ success: true }) //trả về respont với status 200
}

const updateUser = async (req, res, next) => {
  // number of fields
  const { userID } = req.value.params

  const newUser = req.value.body

  const result = await User.findByIdAndUpdate(userID, newUser)

  return res.status(200).json({ success: true })
}

module.exports = {
  authGoogle,
  authFacebook,
  getUser,
  getUserDecks,
  index,
  newUser,
  newUserDeck,
  replaceUser,
  updateUser,
  secret,
  singIn,
  singUp
}

/*
phân trang:
var page = req.query.page
if(page<1)
  page = 1

var soluongboqua = (page-1)* PAGE_SIZE

User.find({}).skip(soluongboqua).limit(PAGE_SIZE)
.then(...)
.catch(err){}
*/