const express = require('express')
// const router = express.Router()
const router = require('express-promise-router')() //gọi từ thư viện express-promise-router

const DeckController = require('../controllers/deck') //lấy biến được trả về từ file controller/deck

const { validateBody, validateParam, schemas } = require('../helpers/routerHelpers') //lấy 3 biến được trả về từ file routerHelpers

router.route('/') //tuyến đường mặc định
    .get(DeckController.index)
    .post(validateBody(schemas.newDeckSchema), DeckController.newDeck)

router.route('/:deckID') //tuyến đường có kèm id của deck
    .get(validateParam(schemas.idSchema, 'deckID'), DeckController.getDeck)
    .put(validateParam(schemas.idSchema, 'deckID'), validateBody(schemas.newDeckSchema), DeckController.replaceDeck)
    .patch(validateParam(schemas.idSchema, 'deckID'), validateBody(schemas.deckOptionalSchema), DeckController.updateDeck)
    .delete(validateParam(schemas.idSchema, 'deckID'), DeckController.deleteDeck)

module.exports = router

/*
sử dụng JWT:
jwt.sign (payload, secretOrPrivateKey, [options, callback])
async: nếu một callbacb được cung cấp, callback được gọi với hoặc JWT.err
sync: trả về JSONwebtoken dưới dạng chuỗi

payload có thể là một object theo nghĩa đen, bộ đệm hoặc chuỗi đại diện cho JSON hợp lệ.

secretOrPrivateKey là một chuỗi (được mã hóa utf-8), bộ đệm, đối tượng hoặc KeyObject chứa bí mật cho các thuật toán HMAC hoặc PEM khóa riêng được mã hóa cho RSA và ECDSA.

options: 
    algorithm (mặc định: HS256)
    expiresIn: được biểu thị bằng giây hoặc một chuỗi mô tả một khoảng thời gian vercel / ms.
    expiresIn: được biểu thị bằng giây hoặc một chuỗi mô tả một khoảng thời gian vercel / ms.


so sánh token, cookie
cookie: lưu 1 phiên đăng nhập
token: nhận token(như một thẻ ra vào), cần được lưu lại ở client-side(như localStorage)
token sẽ được kiểm tra tại server và được gửi trả về resont(tại header, tại body cũng đc nhưng cái này nhạy cảm, ko thường dùng)
dùng token(dựa vào người phát triển sẽ đính kèm vào request thế nào) dùng phù hợp với multidomanins, subdomaints(tức là dự án dùng với rất nhiều domains)
dùng cookie(tự động được gửi kèm vào tất cả request) phù hợp với singulardomanin và subdomains(tức là xét cookie cho domain chính thì subdomain cũng đc hưởng)

bây h thường xuyên sử dụng API => sử dụng với nhiều thiết bị => sử dụng token
*/