export const msgScrollBottom = (id) => {
  setTimeout(() => {
    let chatSection = document.getElementById(id)
    chatSection.scrollTop = chatSection.scrollHeight
  }, 1)
}

export const emojiMap = {
  '#:z': `<img src="${require('./assets/imgs/emojis/smiley_01.png')}">`,
  '#-.-': `<img src="${require('./assets/imgs/emojis/smiley_02.png')}">`,
  '#:D': `<img src="${require('./assets/imgs/emojis/smiley_03.png')}">`,
  '#:)': `<img src="${require('./assets/imgs/emojis/smiley_04.png')}">`,
  '#:]': `<img src="${require('./assets/imgs/emojis/smiley_05.png')}">`,
  '#;-L': `<img src="${require('./assets/imgs/emojis/smiley_06.png')}">`,
  '#;-D': `<img src="${require('./assets/imgs/emojis/smiley_07.png')}">`,
  '#:<': `<img src="${require('./assets/imgs/emojis/smiley_08.png')}">`,
  '#*_*': `<img src="${require('./assets/imgs/emojis/smiley_09.png')}">`,
  '#+_+': `<img src="${require('./assets/imgs/emojis/smiley_10.png')}">`,
  '#>_<': `<img src="${require('./assets/imgs/emojis/smiley_11.png')}">`,
  '#^_+': `<img src="${require('./assets/imgs/emojis/smiley_12.png')}">`,
  '#;P': `<img src="${require('./assets/imgs/emojis/smiley_13.png')}">`,
  '#0o0': `<img src="${require('./assets/imgs/emojis/smiley_14.png')}">`,
  '#:-D': `<img src="${require('./assets/imgs/emojis/smiley_15.png')}">`,
  '#ToT': `<img src="${require('./assets/imgs/emojis/smiley_16.png')}">`,
  '#>P': `<img src="${require('./assets/imgs/emojis/smiley_17.png')}">`,
  '#z_z': `<img src="${require('./assets/imgs/emojis/smiley_18.png')}">`,
  '#-_,-': `<img src="${require('./assets/imgs/emojis/smiley_19.png')}">`,
  '#^_^': `<img src="${require('./assets/imgs/emojis/smiley_20.png')}">`,
  '#>o<': `<img src="${require('./assets/imgs/emojis/smiley_21.png')}">`,
  '#;<': `<img src="${require('./assets/imgs/emojis/smiley_22.png')}">`,
  '#@_@': `<img src="${require('./assets/imgs/emojis/smiley_23.png')}">`,
  '#+o+': `<img src="${require('./assets/imgs/emojis/smiley_24.png')}">`,
  '#;z*': `<img src="${require('./assets/imgs/emojis/smiley_25.png')}">`,
  '#x_x': `<img src="${require('./assets/imgs/emojis/smiley_26.png')}">`,
  '#.-b': `<img src="${require('./assets/imgs/emojis/smiley_27.png')}">`,
  '#@,@': `<img src="${require('./assets/imgs/emojis/smiley_28.png')}">`,
  '#>-<': `<img src="${require('./assets/imgs/emojis/smiley_29.png')}">`,
  '#:-<': `<img src="${require('./assets/imgs/emojis/smiley_30.png')}">`,
  '#(cute)': `<img src="${require('./assets/imgs/emojis/smiley_31.png')}">`,
  '#(bh)': `<img src="${require('./assets/imgs/emojis/smiley_32.png')}">`,
  '#(b)': `<img src="${require('./assets/imgs/emojis/smiley_33.png')}">`,
  '#(g)': `<img src="${require('./assets/imgs/emojis/smiley_34.png')}">`,
  '#-@': `<img src="${require('./assets/imgs/emojis/smiley_35.png')}">`,
  '#(p)': `<img src="${require('./assets/imgs/emojis/smiley_36.png')}">`,
  '#(18)': `<img src="${require('./assets/imgs/emojis/smiley_37.png')}">`,
  '#(kiss)': `<img src="${require('./assets/imgs/emojis/smiley_38.png')}">`,
  '#(flag)': `<img src="${require('./assets/imgs/emojis/smiley_39.png')}">`,
  '#(d)': `<img src="${require('./assets/imgs/emojis/smiley_40.png')}">`,
  '#(pig)': `<img src="${require('./assets/imgs/emojis/smiley_41.png')}">`,
  '#(bg)': `<img src="${require('./assets/imgs/emojis/smiley_42.png')}">`,
  '#(qiu)': `<img src="${require('./assets/imgs/emojis/smiley_43.png')}">`,
  '#(dance)': `<img src="${require('./assets/imgs/emojis/smiley_44.png')}">`,
  '#(good)': `<img src="${require('./assets/imgs/emojis/smiley_45.png')}">`,
  '#(bingo)': `<img src="${require('./assets/imgs/emojis/smiley_46.png')}">`,
  '#(ok)': `<img src="${require('./assets/imgs/emojis/smiley_47.png')}">`,
  '#(strong)': `<img src="${require('./assets/imgs/emojis/smiley_48.png')}">`,
  '#(b3g)': `<img src="${require('./assets/imgs/emojis/smiley_49.png')}">`,
  '#(blg)': `<img src="${require('./assets/imgs/emojis/smiley_50.png')}">`,
  '#(yoga)': `<img src="${require('./assets/imgs/emojis/smiley_51.png')}">`,
  '#(cut)': `<img src="${require('./assets/imgs/emojis/smiley_52.png')}">`,
  '#(head)': `<img src="${require('./assets/imgs/emojis/smiley_53.png')}">`,
  '#(no)': `<img src="${require('./assets/imgs/emojis/smiley_54.png')}">`,
  '#(^L)': `<img src="${require('./assets/imgs/emojis/smiley_55.png')}">`,
  '#(love)': `<img src="${require('./assets/imgs/emojis/smiley_56.png')}">`
}

window.Date.prototype.Format = function (fmt) {
  var o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    'S': this.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

export const doMultiTasks = async (targets, handler) => {
  console.log(targets)
  console.log(handler)
  return new Promise(function (resolve) {
    if (!handler || typeof handler !== 'function') {
      console.error('doMultiTasks: lack of handler')
      return resolve(null)
    }
    const tasks = []
    const taskIndexInfo = {}
    let taskIndex = 0
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      console.log(target)
      const subTasks = handler(target)
      console.log(subTasks)
      for (let j = 0; j < subTasks.length; j++) {
        tasks.push(subTasks[j])
        taskIndexInfo[taskIndex] = {
          pos: i,
          target: target
        }
        taskIndex++
      }
    }
    const outs = []
    Promise.all(tasks).then(function (results) {
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const pos = taskIndexInfo[i].pos
        const target = taskIndexInfo[i].target
        if (!outs[pos]) {
          outs[pos] = { target, result: [] }
        }
        outs[pos].result.push(result)
      }
      resolve(outs)
    })
  })
}
