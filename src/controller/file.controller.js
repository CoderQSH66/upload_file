const fs = require("fs")
const path = require("path")
const SparkMD5 = require("spark-md5")

class FileController {
  /** 上传文件 */
  async uploadFile(ctx, next) {
    console.log(ctx.request.files)
    console.log(ctx.request.body)
    // 跨域设置
    ctx.set("Access-Control-Allow-Origin", "*")
    ctx.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild"
    )
    ctx.type = "json"
    ctx.body = {
      code: 200,
      data: ctx.request.files,
      msg: "上传成功"
    }
  }

  /** 下载文件 */
  downloadFile(ctx, next) {
    const { name } = ctx.request.body
    const fileReadStream = fs.createReadStream(
      path.resolve(
        __dirname,
        "../../public/数字人极简版员工信息20240531/1721897666886_数字人极简版员工信息20240531.xls"
      )
    )
    ctx.set("Access-Control-Expose-Headers", "content-disposition")
    ctx.set("Content-Disposition", "attachment; filename=" + encodeURIComponent(name))
    ctx.body = fileReadStream
  }

  /** base64上传文件 */
  async uploadImage(ctx, next) {
    // 获取传入的base64、文件名称
    let { file, filename } = ctx.request.body
    // 截取文件base64
    file = decodeURIComponent(file).replace(/data:image\/\w+;base64,/, "")
    file = Buffer.from(file, "base64")
    // 根据文件内容获取hash（SparkMD5）
    const spark = new SparkMD5.ArrayBuffer()
    spark.append(file)
    const filehash = spark.end()
    // 获取文件的后缀
    const suffix = filename.slice(filename.lastIndexOf("."))
    // 写入的文件路径
    const filePath = path.join(__dirname, `../../public/images/${filehash}${suffix}`)
    // 判断文件是否存在
    if (FileController.isHashExist(filePath)) {
      return (ctx.body = {
        code: -1001,
        data: null,
        msg: "文件已存在！"
      })
    }
    // 将文件写入服务器
    fs.createWriteStream(filePath, { encoding: "base64" }).write(file)
    ctx.body = {
      code: 200,
      data: {
        originname: filename,
        filename: `${filehash}${suffix}`,
        date: Date.now()
      },
      msg: "上传成功"
    }
  }

  /** 客户端处理图片hash */
  async clientUploadImage(ctx, next) {
    console.log(ctx.request.body)
    ctx.body = {
      data: ctx.request.files
    }
  }

  /** 判断hash是否存在 */
  static isHashExist(filePath) {
    return fs.existsSync(filePath)
  }
}

module.exports = new FileController()
