import { PageAgent } from 'page-agent'

export const usePageAgent = () => {
  let agent = null

  function show() {
    agent = new PageAgent({
      model: 'qwen3.5-plus',
      // baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      baseURL: 'https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run',
      apiKey: "NA"
    })
    agent.panel.show()//显示page agent
  }

  function close() {
    agent.panel.dispose() //销毁page Agent的DOM
  }
  return {
    show,
    close
  }
}
