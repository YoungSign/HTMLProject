import Message from './index.vue'

Message.install = (Vue) => {
  Vue.component(Message.name, Message)
}

export default Message
