const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bcrypt = require('bcryptjs') //tất cả các hàm của bcrypt đều trả ra promise nên buộc sử dụng await

const UserSchema = new Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String, //kiểu dữ liẹu
    required: true,  //yêu cầu luôn luôn phải có
    unique: true,//cái này để là duy nhất trong document
    lowercase: true //email hoa hoặc thường tránh trường hợp kiểm tra nhiều lần

  },
  password: {
    type: String,
  },

  authGoogleID: {
    type: String,
    default: null,
  },
  authFacebookID: {
    type: String,
    default: null,
  },
  authType: {
    type: String,
    enum: ['local', 'google', 'facebook'], //enum chỉ cho phép các giá trị string trùng với một trong các ptu ở trong array thôi
    default: 'local',
  },
  decks: [{
    type: Schema.Types.ObjectId,
    ref: 'Deck'
  }]
})

//sử dụng hàm mã hóa mật khẩu trước khi lâu mật khẩu đó, vì vậy cần tiền tố pre đó 
// không có tác động của router promise nên phải tự túc dùng try catch phát hiện và sử lý lỗi
UserSchema.pre('save', async function (next) { //ở đây phải viết nomal function chứ ko đc dùng arout function vì this của nó khác nhau, học ở f8 rồi, arout cái là chính là cái function đấy, nomal chỉ là gt truyền vào
  try {
    if (this.authType !== 'local') next()
    //mã hóa mật khẩu
    //trước hết cần random ra 1 đoạn để kết hợp với cái mk, để băm sẽ bảo mật hơn
    const salt = await bcrypt.genSalt(10)
    //tạo ra password đã được hash (pass + random)
    const passwordHashed = await bcrypt.hash(this.password, salt) //this chính là cái model của userschema được khởi tạo bên trên
    //lưu lại password đã đc hash
    this.password = passwordHashed

    next()
    return false //trong callback function, thì câu lệnh này vô dụng, bởi nó vân sẽ tiếp tục chạy và lưu pass ở func tiếp (đây là callback func mà) chứ không dừng ở func này là xong đâu
  } catch (error) {
    next(error);
  }
})

//những cái nào không muốn sử lý trong controller mà trước khi làm công việc đó thì nên lấy ra ở đây
//hàm so sánh giá trị pass trong csdl(đã hash) với hàm được khai báo
//hàm trả giá trị true, false
UserSchema.methods.isValidPassword = async function (newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password)
  } catch (error) {
    throw new Error(error)
  }
}

const User = mongoose.model('User', UserSchema)
module.exports = User