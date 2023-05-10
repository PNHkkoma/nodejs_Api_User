require('dotenv').config()


const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const mongoClient = require('mongoose')

// setup connect mongodb by mongoose
mongoClient.connect('mongodb://127.0.0.1:27017/nodejsapistarter', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected database from mongodb.'))
  .catch((error) => console.error(`❌ Connect database is failed with error which is ${error}`))

const app = express()

const deckRoute = require('./routes/deck')
const userRoute = require('./routes/user')


// Middlewares
app.use(logger('dev')) //dùng để log, biến dev dùng để in ra số giây hoàn thành 1 request
app.use(bodyParser.json())
//body chính là dữ liệu mà client gửi lên cho server(het, post, put, patch, delete) để server biết đường mà sử lý
//nếu ko có thư viện này thì request từ client lên server sẽ ko hiểu mà dịch đc(ko phải json)

// Routes
app.use('/decks', deckRoute)
app.use('/users', userRoute)

// Routes
//mặc định trả về (200)
app.get('/', (req, res, next) => {
  return res.status(200).json({
    message: 'Server is OK!'
  })
})

// Catch 404 Errors and forward them to error handler
//hàm bắt lỗi,sau đó chuyển sang hàm khác
app.use((req, res, next) => {
  //hàm bắt lỗi, ko truyền path đầu vào ngầm hiểu chạy mặc định
  const err = new Error('Not Found') //tạo biến lỗi, truyền tham số nt fornd
  err.status = 404 // loại lỗi 404, mã lỗi ko tìm thấy 
  next(err) //chuyển sang hàm kahsc
})

// Error handler function
//hàm hứng lỗi
app.use((err, req, res, next) => {
  const error = app.get('env') === 'development' ? err : {} // tạo biến error lấy từ biến env, nếu env bằng develoment thì trả về err, ko thì trả về {}
  const status = err.status || 500 //nếu ko lấy đc err.status =404 thì mặc định là lỗi 500: dev ko bắt đc lỗi hoặc lỗi ngoài ý muốn

  // response to client
  // tập return khi kết thúc hàm
  return res.status(status).json({
    error: {
      message: error.message
    }
  })
})

// Start the server
const port = app.get('port') || 3000
app.listen(port, () => console.log(`Server is listening on port ${port}`))