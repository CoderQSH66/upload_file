const jwt = require("jsonwebtoken")

class LoginController {
  /** 生成token */
  async makeToken(ctx, next) {
    const payload = ctx.request.body
    const token = jwt.sign(payload, "secretKey", { expiresIn: 60 * 60 * 24 })
    ctx.token = token
    await next()
  }

  /** token校验 */
  async verifyToken(ctx, next) {
    const token = ctx.token
    jwt.verify(token, "secretKey", (err, decoded) => {
      if (err) {
        return (ctx.body = {
          code: -2001,
          data: err,
          msg: "token失效或过期~"
        })
      }
      ctx.decoded = decoded
    })
    await next()
  }
}

module.exports = new LoginController()
