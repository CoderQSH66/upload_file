const Router = require("@koa/router")
const {
  uploadFile,
  downloadFile,
  uploadImage,
  clientUploadImage,
  uploadFilePlus,
  uploadFileChunk
} = require("../controller/file.controller")
const { koaBody } = require("koa-body")
const path = require("path")
const fs = require("fs")

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

// 文件上传-plus
router.post("/upload-plus", uploadFilePlus)

// 处理切片的中间件
const handleChunk = koaBody({
  multipart: true,
  formidable: {
    multipart: true,
    keepExtensions: true,
    uploadDir: path.join(__dirname, "../../public/chunks"),
    onFileBegin(name, file) {
      // console.log(name)
      // console.log(file)
      const dirPath = path.join(__dirname, `../../public/chunks/${file.originalFilename.split("_")[0]}`)
      // console.log(dirPath)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
      }
      file.filepath = dirPath + "/" + file.originalFilename
      file.newFilename = file.originalFilename
    }
  }
})

// 文件切片上传
router.post("/upload-chunk", handleChunk, uploadFileChunk)

// 文件合并
router.post("/merge", koaBody(), async (ctx, next) => {
  // 拿到客户端传递的文件hash
  const { hash: hashName, ext } = ctx.request.body
  // 找到切片存放的路径
  const dirPath = path.join(__dirname, `../../public/chunks/${hashName}`)
  // 获取每个切片名
  let chunks = await fs.promises.readdir(dirPath)
  // 合并切片
  chunks = chunks.sort((a, b) => {
    return a.split("_").at(-1) - b.split("_").at(-1)
  })
  console.log(chunks)
  chunks.forEach((chunk) => {
    fs.appendFileSync(
      path.join(__dirname, `../../public/big/${hashName}${ext}`),
      fs.readFileSync(dirPath + "/" + chunk)
    )
    // 合并一个就删一个切片
    fs.unlinkSync(dirPath + "/" + chunk)
  })
  // 删除切片目录
  fs.rmdirSync(dirPath)
  ctx.body = {
    code: 200,
    data: {
      filePath: path.join(__dirname, `../../public/big/${hashName}${ext}`),
      filename: `${hashName}${ext}`
    },
    msg: "合并成功！"
  }
})

module.exports = router
