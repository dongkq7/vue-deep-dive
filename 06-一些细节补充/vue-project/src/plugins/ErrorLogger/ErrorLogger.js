import ErrorLogger from "./ErrorLogger.vue"

export default {
  install(app, options = {}) {

    // 参数归一化：将传入的options与默认配置进行合并
    const defaultOptions = {
      logToConsole: true, // 是否将错误打印到控制台
      remoteToLogging: false, // 是否将错误发送到服务器
      remoteUrl: ''
    }

    const config = {...defaultOptions, ...options}

    // 全局vue错误
    app.config.errorHandler = (err, vm, info) => {
      logError(err, info)
    }

    // 捕获未处理的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      logError(event.reason, 'unhandled promise rejection error')
    })

    function logError(error, info) {
      if (config.logToConsole) {
        console.error(`错误：${info}`, error)
      }

      if (config.remoteToLogging && config.remoteUrl) {
        fetch(config.remoteUrl, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            info,
            time: new Date().toISOString()
          })
        }).catch(console.error)
      }
    }
    // 注册ErrorLogger组件
    app.component('ErrorLogger', ErrorLogger)
  }
}