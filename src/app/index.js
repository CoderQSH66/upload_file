const Koa = require("koa")
const fs = require("fs")
const koaStatic = require("koa-static")
const path = require("path")
const { koaBody } = require("koa-body")
const loginRouter = require("../router/login.router")
const fileRouter = require("../router/file.router")

// 创建app应用程序
const app = new Koa()

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
      maxFieldsSize: 1024 * 1024 * 1024,
      // onFileBegin(name, file) {
      //   console.log(name, file)
      //   // const fileName = file.originalFilename.split(".")[0]
      //   // const dirPath = path.join(__dirname, `../../public/${fileName}`)
      //   // if (!fs.existsSync(dirPath)) {
      //   //   fs.mkdirSync(dirPath)
      //   // }
      //   // file.filepath = dirPath + "\\" + Date.now() + "_" + file.originalFilename
      // },
      filter(other) {
        console.log(other)
      }
    }
  })
)

// 部署静态资源
app.use(koaStatic(path.resolve(__dirname, "../../static/dist")))
app.use(koaStatic(path.resolve(__dirname, "../../static/dist")))

// 注册路由中间件
app.use(loginRouter.routes())
app.use(loginRouter.allowedMethods())
app.use(fileRouter.routes())
app.use(fileRouter.allowedMethods())

module.exports = app
