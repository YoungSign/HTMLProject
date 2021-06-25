import cryptojsMD5 from 'crypto-js/md5'
import Axios from 'axios'

export const doMultiTasks = async (targets, handler) => {
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
      const subTasks = handler(target)
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

export const MediaUtil = {
  currGetPhotosInputObj: null,
  async createDataURL (rawFile) {
    return new Promise(function (resolve) {
      const reader = new FileReader()
      reader.onload = function (e) {
        resolve(e.target.result)
      }
      reader.readAsDataURL(rawFile)
    })
  },
  async createObjectURL (rawFile) {
    return new Promise(function (resolve) {
      const _URL = window.URL || window.webkitURL
      const url = _URL.createObjectURL(rawFile)
      resolve(url)
    })
  },
  async getUid (rawFile) {
    return new Promise(resolve => {
      const binaryStringReader = new FileReader()
      binaryStringReader.readAsBinaryString(rawFile)
      binaryStringReader.onload = function (binaryReaderEvent) {
        // console.log('binaryReaderEvent', JSON.stringify(binaryReaderEvent))
        let md5Name = ''
        if (!binaryReaderEvent) {
          md5Name = binaryStringReader.content
        } else {
          md5Name = binaryReaderEvent.target.result
        }
        // 1.1 生成MD5文件名
        resolve(getHexMd5(md5Name))
      }
    })
  },
  async getImagePreview (rawFile) {
    const url = await MediaUtil.createObjectURL(rawFile)
    return url
  },
  async getImageDimension (url) {
    return new Promise(resolve => {
      // 1.3.1 异步获取图片尺寸
      const img = new Image()
      img.src = url
      img.onload = function () {
        // 1.3.1.1 发出[添加文件和消息]指令
        const width = img.width
        const height = img.height
        resolve({ url, width, height })
      }
    })
  },
  async runGetFiles (event, param, cb) {
    if (!MediaUtil.currGetPhotosInputObj) {
      console.log('设置currGetPhotosInputObj对象')
      MediaUtil.currGetPhotosInputObj = document.createElement('input')
      const id = 'getPhotos' + Math.floor(Math.random() * 1000)
      MediaUtil.currGetPhotosInputObj.setAttribute('id', id)
      MediaUtil.currGetPhotosInputObj.setAttribute('type', 'file')
      // MediaUtil.currGetPhotosInputObj.setAttribute('accept', 'image/*')
      MediaUtil.currGetPhotosInputObj.setAttribute('multiple', 'multiple')
      MediaUtil.currGetPhotosInputObj.setAttribute('style', 'display:none;')
      document.body.appendChild(MediaUtil.currGetPhotosInputObj)
      const changeListener = (res) => {
        console.log(res, MediaUtil.currGetPhotosInputObj.files)
        const files = MediaUtil.currGetPhotosInputObj.files
        cb(files)
        // 1
        console.log('回收currGetPhotosInputObj对象')
        MediaUtil.currGetPhotosInputObj.removeEventListener('change', changeListener)
        document.body.removeChild(MediaUtil.currGetPhotosInputObj)
        // 2
        MediaUtil.currGetPhotosInputObj.files = null
        MediaUtil.currGetPhotosInputObj.value = null
        MediaUtil.currGetPhotosInputObj = null
      }
      MediaUtil.currGetPhotosInputObj.addEventListener('change', changeListener)
    }
    if (param === 1) {
      // capture
      MediaUtil.currGetPhotosInputObj.setAttribute('capture', 'camera')
      MediaUtil.currGetPhotosInputObj.removeAttribute('accept')
    } else if (param === 2) {
      // accept
      MediaUtil.currGetPhotosInputObj.setAttribute('accept', 'image/*')
      MediaUtil.currGetPhotosInputObj.removeAttribute('capture')
    } else {
      // accept + capture
      MediaUtil.currGetPhotosInputObj.setAttribute('accept', 'image/*')
      MediaUtil.currGetPhotosInputObj.setAttribute('capture', 'camera')
    }
    MediaUtil.currGetPhotosInputObj.click()
  }
}

export const getHexMd5 = function (s) {
  return cryptojsMD5(s)
}

export const fileExist = async function ({ fileId, fileSize }, token) {
  try {
    const query = {
      file_id: fileId,
      file_size: fileSize
    }
    const result = await Axios({
      method: 'get',
      url: `/check?${encodeQueryString(query)}`,
      baseURL: '',
      // baseURL: 'http://124.42.103.164:8083',
      headers: {
        token: `${token}`
      }
    })
    return result
  } catch (e) {
    console.log(e)
    return null
  }
}

export const encodeQueryString = function (args) {
  const items = []
  let qs = ''
  for (const key in args) {
    if (!args[key]) {
      continue
    }
    const name = encodeURIComponent(key)
    const value = encodeURIComponent(args[key])
    const item = name + '=' + value
    items.push(item)
  }
  qs = items.length ? items.join('&') : ''
  return qs
}

export const createSlicedFileBlock = function (rawFile, byteStart, byteEnd) {
  const name = rawFile.name || rawFile.fileName
  const type = rawFile.type
  const lastModified = rawFile.lastModified
  // const lastModifiedDate = rawFile.lastModifiedDate
  const relativePath = rawFile.relativePath || rawFile.webkitRelativePath
  const newFile = new File([rawFile.slice(byteStart, byteEnd)], name, {
    type,
    lastModified,
    // lastModifiedDate,
    relativePath
  })
  return newFile
}
