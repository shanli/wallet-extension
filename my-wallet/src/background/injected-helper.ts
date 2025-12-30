
 
export default function injectMyWallet() {
  console.log("=======1======injected-helper");
  
  if (window.myWallet || window.myWalletInjected) {
    return
  }

  const WALLET_CONNECT = 'WALLET_CONNECT'
  const WALLET_GET_ACCOUNT = 'WALLET_GET_ACCOUNT'
  const WALLET_SIGN_MESSAGE = 'WALLET_SIGN_MESSAGE'
  const WALLET_DISCONNECT = 'WALLET_DISCONNECT'
  // 请求id
  const generateRequestId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  const myWallet = {
    // 连接钱包
    connect: async () => {
      console.log('connect');
      
      return new Promise((resolve, reject) => {
        console.log('发送信息到 message-bridge');
        
        const requestId = generateRequestId()
        console.log('requestId :', requestId);
        console.log("aaaaaa");
        
        console.log(WALLET_CONNECT);
        
        
        
        // 向桥接发送连接请求
        const message = {
          type: WALLET_CONNECT,
          requestId,
          from : 'injected-helper'
        }
        // window.postMessage(message, '*')
        console.log(message);
        console.log(window.location.origin);
        
        
        window.postMessage(message, "*")

        // 监听连接结果
        const handleResponse = (event: MessageEvent) => {
          console.log("handleResponse:", event);
          
          // if (
          //   event.source !== window || 
          //   !event.data || 
          //   event.data.from !== 'injected-helper' || 
          //   event.data.requestId !== requestId) {
          //   return
          // }
          if (!_isValidResponse(event, requestId)) return
          //  清除监听
          window.removeEventListener('message', handleResponse)

          if (event.data.success) {
            resolve(event.data.data.account)
          } else {
            reject(event.data.error || '连接失败')
          }
        }
        window.addEventListener('message', handleResponse)

        // 超时处理
        setTimeout(() => {
          window.removeEventListener('message', handleResponse)
          reject('连接超时')
        }, 30000)
      })
    },
    // 获取当前账户信息
    getAccount: async () => {
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId()
        const message = {
          type: WALLET_GET_ACCOUNT,
          requestId,
          from : 'injected-helper'
        }
        window.postMessage(message, "*")

        const handleResponse = (event: MessageEvent) => {
          // if (
          //   event.source !== window || 
          //   !event.data || 
          //   event.data.from !== 'injected-helper' || 
          //   event.data.requestId !== requestId) {
          //   return
          // }
          if (!_isValidResponse(event, requestId)) return
          window.removeEventListener('message', handleResponse)

          if (event.data.success) {
            resolve(event.data.data.account)
          } else {
            reject(event.data.error || '获取账户信息失败')
          }
        }
        window.addEventListener('message', handleResponse)
      })
    },
    // 签名信息
    signMessage: async (message: string) => {
      console.log('signMessage:', message);
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId()
        const messageData = {
          type: WALLET_SIGN_MESSAGE,
          data: { message },
          requestId,
          from : 'injected-helper'
        }
        console.log(messageData);
        window.postMessage(messageData, window.location.origin)
        console.log('22');
        const handleResponse = (event: MessageEvent) => {
          console.log(event);
          
          if (!_isValidResponse(event, requestId)) return
          window.removeEventListener('message', handleResponse)

          if (event.data.success) {
            resolve(event.data.data.signedMessage)
          } else {
            reject(event.data.error || '签名失败')
          }
        }
        window.addEventListener('message', handleResponse)
        setTimeout(() => {
          window.removeEventListener('message', handleResponse)
          reject('签名超时')
        }, 30000)
      })
    },
    // 断开连接
    disconnect: async () => {
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId()
        const message = {
          type: WALLET_DISCONNECT,
          requestId,
          from : 'injected-helper'
        }
        window.postMessage(message, "*")

        const handleResponse = (event: MessageEvent) => {
          if (!_isValidResponse(event, requestId)) return
          window.removeEventListener('message', handleResponse)
          resolve(true)
        }
        window.addEventListener('message', handleResponse)
      })
    }
  }
  function _isValidResponse(event: MessageEvent, requestId: string) {
    return event.source === window &&
            event.data &&
            event.data.from === 'message-bridge' &&
            event.data.requestId === requestId
  }
  window.myWallet = myWallet
  window.myWalletInjected = true
  console.log("myWallet 已经注入到页面"); 
}  