const app = require("../app")

app.on("error", (error, ctx) => {
  ctx.body = {
    data: null,
    msg: "文件不能超过200M"
  }
})
