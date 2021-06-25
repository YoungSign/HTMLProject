<template>
  <div class="upload">
    <div v-show="loading" class="loading-mask">
      loading...
    </div>
    <!-- 操作 -->
    <div class="upload-bar">
      <button @click="select($event)">上传</button>
    </div>
    <!-- 预览 -->
    <h1>文件选择预览</h1>
    <div class="upload-select-result">
      <button v-show="prepareFileQueue.length" @click="multiUpload()">确定开始</button>
      <ul>
        <li
          class="prepare-file"
          v-for="(fileInfo, index) in prepareFileQueue"
          :key="fileInfo.uid"
        >
          <div class="prepare-file-info">
            <p><span>文件序号:</span><span>{{index + 1}}</span></p>
            <p><span>文件MD5:</span><span>{{fileInfo.uid}}</span></p>
            <p><span>文件名称:</span><span>{{fileInfo.file.fileName || fileInfo.file.name}}</span></p>
            <p><span>文件类型:</span><span>{{fileInfo.file.type}}</span></p>
            <p><span>文件大小:</span><span>{{fileInfo.file.size}}</span></p>
            <p v-if="fileInfo.preview"><span>缩略图:</span><img :src="fileInfo.preview" alt="" width="100"></p>
            <p v-if="fileInfo.preview"><span>缩略图尺寸:</span><span>{{fileInfo.width}}X{{fileInfo.height}}</span></p>
          </div>
        </li>
      </ul>
    </div>
    <!-- 详情 -->
    <h1>上传列表</h1>
    <div class="upload-result">
      <ul>
        <li
          class="uploading-file"
          v-for="(file, index) in uploadingFileQueue"
          :key="file.uploadFile.uniqueIdentifier"
        >
          <ul class="uploading-file-chunkList">
            <li
              class="uploading-chunk-wrap"
              v-for="chunk in file.uploadFile.uploadFileChunkQuene"
              :key="chunk.offset"
            ><file-chunk :chunk="chunk"></file-chunk></li>
          </ul>
          <span>
            <span class="file-operate-btn" @click="filePause(file.uploadFile)" v-show="!file.uploadFile.paused">暂停</span>
            <span class="file-operate-btn" @click="fileResume(file.uploadFile)" v-show="file.uploadFile.paused && !file.uploadFile.error">恢复</span>
            <span class="file-operate-btn" @click="fileCancel(file.uploadFile, index)">取消</span>
            <span class="file-operate-btn" @click="fileRetry(file.uploadFile)" v-show="file.uploadFile.paused && file.uploadFile.error"> 重试</span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
// @ is an alias to /src

import { doMultiTasks, MediaUtil, fileExist, encodeQueryString, createSlicedFileBlock } from './../utils'
import FileChunk from './../components/fileChunk'
export default {
  name: 'Testupload',
  components: {
    fileChunk: FileChunk
  },
  data () {
    return {
      loading: false,
      prepareFileQueue: [],
      uploadingFileQueue: [],
      uploadInstance: null
    }
  },
  created () {
    const vm = this
    window.vm = vm
    window.TeatalkSdk.invoke('createUpload', {
      callback: instance => {
        vm.uploadInstance = instance
        vm.uploadInstance.updateOption({
          isCheckChunk: false,
          method: 'octet',
          uploadMethod: 'POST',
          chunkSize: 1024 * 4,
          forceChunkSize: true,
          maxChunkRetries: 0,
          chunkRetryInterval: 1000,
          totalSimultaneousChunksLimit: 6,
          fileSimultaneousChunksLimit: 1,
          totalSimultaneousFilesLimit: 6,
          generateUniqueIdentifier: function (file) {
            return file.uid
          },
          query: function (uploadFile, uploadFileChunk) {
            return {
              file_size: uploadFile.size,
              range: uploadFileChunk.startByte + '-' + uploadFileChunk.endByte,
              // status: '',
              is_temp: 'true'
            }
          },
          target: function (uploadFile, uploadFileChunk) {
            const query = {
              file_id: uploadFile.uniqueIdentifier,
              file_size: uploadFile.rawFile.fileSize
            }
            const baseUrl = '' // 本地nginx代理
            // const baseUrl = 'http://124.42.103.164:8083'
            return `${baseUrl}/upload?${encodeQueryString(query)}`
          },
          headers: function (uploadFile, uploadFileChunk) {
            return {
              token: window.TeatalkSdk.app.transferToken
            }
          }
        })
        // vm.uploadInstance.addEventListener('filesAdded', addUploadFiles => {
        //   vm.uploadingFileInfoQueue = vm.uploadingFileInfoQueue.concat(
        //     addUploadFiles
        //   )
        // })
      }
    })
  },
  methods: {
    filePause (uploadFile) {
      uploadFile.pause()
    },
    fileResume (uploadFile) {
      uploadFile.resume()
    },
    fileCancel (uploadFile, index) {
      uploadFile.cancel()
      this.uploadingFileQueue.splice(index, 1)
    },
    fileRetry (uploadFile) {
      uploadFile.retry()
    },
    select (event) {
      const vm = this
      // 调用动态标签，打开文件选择
      MediaUtil.runGetFiles(event, 0, async function (files) {
        // 1 预封装原生文件预览对象
        const q = []
        for (let i = 0; i < files.length; i++) {
          const prepareFileInfo = {
            file: files[i]
          }
          q.push(prepareFileInfo)
        }
        // 2 并发获取文件信息
        const treatFileInfoResults = await doMultiTasks(q, function (prepareFileInfo) {
          const type = prepareFileInfo.file.type.split('/')[0]
          const subTreatTask = []
          // 生成文件UID
          subTreatTask.push(MediaUtil.getUid(prepareFileInfo.file))
          if (type === 'image') {
            // 获取预览图
            subTreatTask.push(MediaUtil.getImagePreview(prepareFileInfo.file).then(function (imagePreviewUrl) {
              // 获取图片尺寸
              return MediaUtil.getImageDimension(imagePreviewUrl)
            }))
          }
          return subTreatTask
        })
        // 3 装填预览对象数据
        for (let i = 0; i < treatFileInfoResults.length; i++) {
          const prepareFileInfo = treatFileInfoResults[i].target
          const uidResult = treatFileInfoResults[i].result[0]
          prepareFileInfo.uid = uidResult
          prepareFileInfo.file.uid = uidResult
          const type = prepareFileInfo.file.type.split('/')[0]
          if (type !== 'image') {
            continue
          }
          const imgResult = treatFileInfoResults[i].result[1]
          prepareFileInfo.preview = imgResult.url
          prepareFileInfo.width = imgResult.width
          prepareFileInfo.height = imgResult.height
        }
        // 4 交给页面渲染
        vm.prepareFileQueue = q
      })
    },
    async multiUpload () {
      const vm = this
      // 1 检查文件在服务器状态
      const treatFileCheckResults = await doMultiTasks(vm.prepareFileQueue, function (prepareFileInfo) {
        const subTreatTask = []
        subTreatTask.push(fileExist({
          fileId: prepareFileInfo.uid,
          fileSize: prepareFileInfo.file.size
        }, window.TeatalkSdk.app.transferToken))
        return subTreatTask
      })
      // 2 根据状态分别处理
      for (let i = 0; i < treatFileCheckResults.length; i++) {
        const prepareFileInfo = treatFileCheckResults[i].target
        const existResult = treatFileCheckResults[i].result[0]
        switch (existResult.status) {
          case 200: { // 已存在
            prepareFileInfo.uploadFile = null
            break
          }
          case 202: { // 部分存在
            const range = JSON.parse(existResult.data).range
            const currByteOffset = range.split('-')[1]
            const newFileBlob = createSlicedFileBlock(prepareFileInfo.file, currByteOffset)
            prepareFileInfo.uploadFile = vm.uploadInstance.addFile(newFileBlob)
            break
          }
          case 201: { // 不存在
            prepareFileInfo.uploadFile = vm.uploadInstance.addFile(prepareFileInfo.file)
            break
          }
          default: // 错误
        }
        vm.uploadingFileQueue.push(prepareFileInfo)
      }
      // 3 清空预览队列
      vm.prepareFileQueue = []
      // 4 开始加进上传队伍
      setTimeout(() => {
        vm.uploadInstance.upload()
      }, 1000)
    }
  }
}
</script>

<style scoped>
.loading-mask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.5;
  background: black;
  font-size: 30px;
  line-height: 100%;
}

.prepare-file {
  border: 1px solid black;
  text-align: left;
}

.upload-result .uploading-file {
  border: 1px solid black;
  display: block;
}

.upload-result .uploading-chunk-wrap {
  /* border: 1px solid blue; */
  width: 10px;
  height: 10px;
  margin-left: 1px;
  display: inline-block;
}

.upload-result .uploading-file-chunkList {
  text-align: left;
  padding: 0;
}

.file-operate-btn {
  cursor: pointer;
  border: 1px solid;
  border-radius: 10px;
  font-size: 10px;
  padding: 2px;
}
</style>
