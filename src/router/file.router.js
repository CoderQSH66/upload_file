const Router = require("@koa/router")
const {
  uploadFile,
  downloadFile,
  uploadImage,
  clientUploadImage
} = require("../controller/file.controller")

// 创建路由对象
const router = new Router({ prefix: "/file" })

// 上传文件（任意多文件）
router.post("/upload", uploadFile)

// 下载文件
router.post("/download", downloadFile)

// Base64上传图片文件（服务端处理hash）
router.post(
  "/image",
  async (ctx, next) => {
    // 跨域设置
    ctx.set("Access-Control-Allow-Origin", "*")
    ctx.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild"
    )
    await next()
  },
  uploadImage
)

// 图片上传（客户端生成hash名称）
router.post("/image-client", clientUploadImage)
module.exports = router
