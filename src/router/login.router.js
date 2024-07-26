const Router = require("@koa/router")
const { makeToken, verifyToken } = require("../controller/login.controller")
// 创建路由对象
const router = new Router({ prefix: "/login" })

// 登录
router.post("/", makeToken, (ctx, next) => {
  console.log(ctx.token)
  console.log(ctx.decoded)
  ctx.body = {
    code: 200,
    data: {
      token: ctx.token,
      decode: ctx.decoded
    },
    msg: "登录成功"
  }
})

module.exports = router
