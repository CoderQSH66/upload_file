const Koa = require("koa")
const fs = require("fs")
const koaStatic = require("koa-static")
const path = require("path")
const { koaBody } = require("koa-body")
const loginRouter = require("../router/login.router")
const fileRouter = require("../router/file.router")

// 创建app应用程序
const app = new Koa()

// app跨域处理
app.use(async (ctx, next) => {
  // 跨域设置
  ctx.set("Access-Control-Allow-Origin", "*")
  ctx.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild"
  )
  // 解决option跨域
  await next()
})

// 处理body、文件上传
app.use(
  koaBody({
    multipart: true,
    formLimit: "10mb",
    jsonLimit: "10mb",
    textLimit: "10mb",
    formidable: {
      multipart: true,
      uploadDir: path.join(__dirname, "../../public"),
      keepExtensions: true,
      maxFieldsSize: 200 * 1024 * 1024,
      onFileBegin(name, file) {
        // console.log(name, file)
        const filepath = path.join(
          __dirname,
          `../../public/images/${file.originalFilename}`
        )
        file.isExist = fs.existsSync(filepath)
        file.filepath = filepath
        file.newFilename = file.originalFilename
      }

      // 过滤文件
      // filter({ originalFilename }) {
      //   const filepath = path.join(
      //     __dirname,
      //     `../../public/images/${originalFilename}`
      //   )
      //   if (fs.existsSync(filepath)) {
      //     return false
      //   }
      //   return true
      // },

      // 重命名文件名
      //   filename: function (name, ext, part, form) {
      //     const filepath = path.join(
      //       __dirname,
      //       `../../public/images/${part.originalFilename}`
      //     )
      //     // 监听文件上传过程，前置拦截
      //     form.on("fileBegin", function (_name, file) {
      //       file.filepath = filepath
      //     })
      //     form.on("error", (err) => {
      //       app.emit("error", err, app.context)
      //       throw err
      //     })
      //     return part.originalFilename
      //   }
      // },
    },
    onError(err, ctx) {
      ctx.errCode = err.code
    }
  })
)
app.on("error", (error, ctx) => {
  ctx.body = {
    code: -1001,
    data: error,
    msg: "文件不能超过200M"
  }
})

// 部署静态资源
app.use(koaStatic(path.resolve(__dirname, "../../static/dist")))
app.use(koaStatic(path.resolve(__dirname, "../../static/dist")))

// 注册路由中间件
app.use(loginRouter.routes())
app.use(loginRouter.allowedMethods())
app.use(fileRouter.routes())
app.use(fileRouter.allowedMethods())

module.exports = app
