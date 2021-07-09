import MD5 = require("crypto-js/md5");
const axios = require("axios").default;

export let hexToBytes = function (hex: string): number[] {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
};

export let hextoString = function (hex: string): string {
    var arr = hex.split("")
    var out = ""
    for (var i = 0; i < arr.length / 2; i++) {
        var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
        var charValue = String.fromCharCode(parseInt(tmp));
        out += charValue
    }
    return out
}

export let bytesToHex = function (bytes: number[]): string {
    let hex = [];
    for (let i = 0; i < bytes.length; i++) {
        let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
};

export let applyProperties = function (target: any, props: any): any {
    let result = null;
    if (target == null || target instanceof Array) {
        result = props;
    } else if (typeof target === "object" && typeof props === "object") {
        result = {};
        for (let key in target) {
            if (!target.hasOwnProperty(key)) {
                continue;
            }
            result[key] = target[key];
        }
        for (let key in props) {
            if (!props.hasOwnProperty(key)) {
                continue;
            }
            result[key] = applyProperties(target[key], props[key]);
        }
    } else {
        result = props;
    }
    return result;
};

// 生成随机字符串（32位）
export let generateUUID = function (len, radix) {
    let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return uuid.join("");
};

export const Base64 = {
    _PADCHAR: "=",
    _ALPHA: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    _VERSION: "1.1", // Mr. Ruan fix to 1.1 to support asian char(utf8)
    _getbyte64: function (s, i) {
        // This is oddly fast, except on Chrome/V8.
        // Minimal or no improvement in performance by using a
        // object with properties mapping chars to value (eg. 'A': 0)

        var idx = this._ALPHA.indexOf(s.charAt(i));

        if (idx === -1) {
            return '';
            // throw "Cannot decode base64";
        }

        return idx;
    },
    _decode_chars: function (y, x) {
        while (y.length > 0) {
            var ch = y[0];
            if (ch < 0x80) {
                y.shift();
                x.push(String.fromCharCode(ch));
            } else if ((ch & 0x80) == 0xc0) {
                if (y.length < 2) break;
                ch = y.shift();
                var ch1 = y.shift();
                x.push(String.fromCharCode(((ch & 0x1f) << 6) + (ch1 & 0x3f)));
            } else {
                if (y.length < 3) break;
                ch = y.shift();
                var ch1 = y.shift();
                var ch2 = y.shift();
                x.push(String.fromCharCode(((ch & 0x0f) << 12) + ((ch1 & 0x3f) << 6) + (ch2 & 0x3f)));
            }
        }
    },
    base64Decode: function (s, obj) {
        var pads = 0,
            i,
            b10,
            imax = s.length,
            x = [],
            y = [];

        s = String(s);

        if (imax === 0) {
            return s;
        }

        if (imax % 4 !== 0) {
            if (obj) {
                return obj.returnValue;
            } else {
                throw "Cannot decode base64";
            }
        }

        if (s.charAt(imax - 1) === this._PADCHAR) {
            pads = 1;

            if (s.charAt(imax - 2) === this._PADCHAR) {
                pads = 2;
            }

            // either way, we want to ignore this last block
            imax -= 4;
        }

        for (i = 0; i < imax; i += 4) {
            var ch1 = this._getbyte64(s, i);
            var ch2 = this._getbyte64(s, i + 1);
            var ch3 = this._getbyte64(s, i + 2);
            var ch4 = this._getbyte64(s, i + 3);

            if (ch1 === '' || ch2 === '' || ch3 === '' || ch4 === '') {
                return obj.returnValue
            }


            b10 = (this._getbyte64(s, i) << 18) | (this._getbyte64(s, i + 1) << 12) | (this._getbyte64(s, i + 2) << 6) | this._getbyte64(s, i + 3);
            y.push(b10 >> 16);
            y.push((b10 >> 8) & 0xff);
            y.push(b10 & 0xff);
            this._decode_chars(y, x);
        }
        switch (pads) {
            case 1:
                b10 = (this._getbyte64(s, i) << 18) | (this._getbyte64(s, i + 1) << 12) | (this._getbyte64(s, i + 2) << 6);
                y.push(b10 >> 16);
                y.push((b10 >> 8) & 0xff);
                break;

            case 2:
                b10 = (this._getbyte64(s, i) << 18) | (this._getbyte64(s, i + 1) << 12);
                y.push(b10 >> 16);
                break;
        }
        this._decode_chars(y, x);
        if (y.length > 0) {
            if (obj) {
                return obj.returnValue;
            } else {
                throw "Cannot decode base64";
            }
        }
        return x.join("");
    },
    _get_chars: function (ch, y) {
        if (ch < 0x80) y.push(ch);
        else if (ch < 0x800) {
            y.push(0xc0 + ((ch >> 6) & 0x1f));
            y.push(0x80 + (ch & 0x3f));
        } else {
            y.push(0xe0 + ((ch >> 12) & 0xf));
            y.push(0x80 + ((ch >> 6) & 0x3f));
            y.push(0x80 + (ch & 0x3f));
        }
    },
    base64Encode: function (s) {
        if (arguments.length !== 1) {
            throw "SyntaxError: exactly one argument required";
        }

        s = String(s);
        if (s.length === 0) {
            return s;
        }

        //s = _encode_utf8(s);
        var i,
            b10,
            y = [],
            x = [],
            len = s.length;
        i = 0;
        while (i < len) {
            this._get_chars(s.charCodeAt(i), y);
            while (y.length >= 3) {
                var ch1 = y.shift();
                var ch2 = y.shift();
                var ch3 = y.shift();
                b10 = (ch1 << 16) | (ch2 << 8) | ch3;
                x.push(this._ALPHA.charAt(b10 >> 18));
                x.push(this._ALPHA.charAt((b10 >> 12) & 0x3F));
                x.push(this._ALPHA.charAt((b10 >> 6) & 0x3f));
                x.push(this._ALPHA.charAt(b10 & 0x3f));
            }
            i++;
        }


        switch (y.length) {
            case 1:
                var ch = y.shift();
                b10 = ch << 16;
                x.push(this._ALPHA.charAt(b10 >> 18) + this._ALPHA.charAt((b10 >> 12) & 0x3F) + this._PADCHAR + this._PADCHAR);
                break;

            case 2:
                var ch1 = y.shift();
                var ch2 = y.shift();
                b10 = (ch1 << 16) | (ch2 << 8);
                x.push(this._ALPHA.charAt(b10 >> 18) + this._ALPHA.charAt((b10 >> 12) & 0x3F) + this._ALPHA.charAt((b10 >> 6) & 0x3f) + this._PADCHAR);
                break;
        }

        return x.join("");
    }

};

export let arrayRemove = function (array, value) {
    let index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
    }
};

export let each = function (obj, callback, context?) {
    if (!obj) {
        return;
    }
    let key;
    if (typeof (obj.length) !== "undefined") {
        for (key = 0; key < obj.length; key++) {
            if (callback.call(context, obj[key], key) === false) {
                return;
            }
        }
    } else {
        for (key in obj) {
            if (obj.hasOwnProperty(key) && callback.call(context, obj[key], key) === false) {
                return;
            }
        }
    }
};

export let async = function (fn, context) {
    setTimeout(fn.bind(context), 0);
};

export let evalOpts = function (data, ...args) {
    if (typeof data === "function") {
        // `arguments` is an object, not array, in FF, so:
        args = Array.prototype.slice.call(arguments);
        data = data.apply(null, args.slice(1));
    }
    return data;
};

export class SimuFormData {
    private fake: boolean = true;
    private boundary: string = "--------FormData" + Math.random();
    private _fields: Array<Array<any>> = [];

    public append(key: string, value: any) {
        this._fields.push([key, value]);
    }

    public toString() {
        let boundary = this.boundary;
        let body = "";
        this._fields.forEach(function (field) {
            body += "--" + boundary + "\r\n";
            // file upload
            if (field[1].name) {
                let file = field[1]
                body += "Content-Disposition: form-data; name=\'" + field[0] + "\'; filename=\'" + file.name + "\'\r\n";
                body += "Content-Type: " + file.type + "\r\n\r\n";
                body += file.getAsBinary() + "\r\n";
            } else {
                body += "Content-Disposition: form-data; name=\"" + field[0] + "\"\r\n";
                body += "Content-Type: text/plain; charset=UTF-8" + "\r\n";
                body += "\r\n" + field[1] + "\r\n";
            }
        });
        body += "--" + boundary + "--";
        return body;
    }

    public getBoundaryString() {
        return "boundary=" + this.boundary;
    }
}

export const encodeQueryString = function (args) {
    const items = [];
    let qs = "";
    for (const key in args) {
        if (!args[key]) {
            continue;
        }
        const name = encodeURIComponent(key);
        const value = encodeURIComponent(args[key]);
        const item = name + "=" + value;
        items.push(item);
    }
    qs = items.length ? items.join("&") : "";
    return qs;
};

export const getHexMd5 = function (s) {
    return MD5(s);
};

export const MediaUtil = {
    currGetPhotosInputObj: null,
    currGetThumbCanvasObj: null,
    transferCompressMax: {
        width: 200,
        height: 200
    },
    previewCompressMax: {
        width: 60,
        height: 60,
    },
    async createDataURL(rawFile) {
        return new Promise(function (resolve) {
            const reader = new FileReader();
            reader.onload = function (e) {
                resolve(e.target.result);
            };
            reader.readAsDataURL(rawFile);
        });
    },
    async createObjectURL(rawFile) {
        return new Promise(function (resolve) {
            const _URL = window.URL || window.webkitURL;
            const url = _URL.createObjectURL(rawFile);
            resolve(url);
        });
    },
    async getUid(rawFile) {
        return new Promise(resolve => {
            const binaryStringReader = new FileReader();
            binaryStringReader.readAsBinaryString(rawFile);
            binaryStringReader.onload = function (binaryReaderEvent) {
                // console.log('binaryReaderEvent', JSON.stringify(binaryReaderEvent))
                let md5Name = "";
                if (!binaryReaderEvent) {
                    md5Name = binaryStringReader.content;
                } else {
                    md5Name = <string>binaryReaderEvent.target.result;
                }
                // 1.1 生成MD5文件名
                resolve(getHexMd5(md5Name).toString());
            };
        });
    },
    async getImagePreview(rawFile) {
        const url = await MediaUtil.createObjectURL(rawFile);
        return url;
    },
    async getImagePreviewForIE(fileInput) {
        return new Promise(function (resolve) {
            fileInput.select();
            return document.selection.createRange().text;
        });
    },
    async getPreviewThumb(imgSource, max, imgType, needUrl) {
        let img = null;
        let width = 0;
        let height = 0;
        if (imgSource instanceof Image) {
            img = img.imgSource;
            width = img.width;
            height = img.height;
        } else {
            let imgInfo = null;
            if (imgSource instanceof File) {
                imgInfo = await MediaUtil.getImageDimension(await MediaUtil.createObjectURL(imgSource));
            } else if (typeof imgSource === "string") {
                imgInfo = await MediaUtil.getImageDimension(imgSource);
            }
            img = imgInfo.img;
            width = imgInfo.width;
            height = imgInfo.height;
        }
        await MediaUtil.compress(img, width, height, max || MediaUtil.previewCompressMax, imgType, needUrl);
    },
    async getTransferThumb(imgSource, max, imgType, needUrl) {
        return new Promise(async (resolve) => {
            let img = null;
            let width = 0;
            let height = 0;
            if (imgSource instanceof Image) {
                img = img.imgSource;
                width = img.width;
                height = img.height;
            } else {
                let imgInfo = null;
                if (imgSource instanceof File) {
                    imgInfo = await MediaUtil.getImageDimension(await MediaUtil.createObjectURL(imgSource));
                } else if (typeof imgSource === "string") {
                    imgInfo = await MediaUtil.getImageDimension(imgSource);
                }
                img = imgInfo.img;
                width = imgInfo.width;
                height = imgInfo.height;
            }
            const blob = await MediaUtil.compress(img, width, height, max || MediaUtil.transferCompressMax, imgType, needUrl);
            resolve(blob);
        });
    },
    async getImageDimension(url) {
        return new Promise(resolve => {
            // 1.3.1 异步获取图片尺寸
            const img = new Image();
            img.src = url;
            if (img.complete) {
                const width = img.width;
                const height = img.height;
                resolve({ img, url, width, height });
                return;
            }
            img.onload = function () {
                // 1.3.1.1 发出[添加文件和消息]指令
                const width = img.width;
                const height = img.height;
                resolve({ img, url, width, height });
            };
        });
    },
    async compress(img, width, height, max, imgType, needUrl) {
        return new Promise((resolve) => {
            const ratio = MediaUtil.getImageResizeRatio({ width, height }, max);
            let targetWidth = ratio < 1 ? width * ratio : width;
            let targetHeight = ratio < 1 ? height * ratio : height;
            if (!MediaUtil.currGetThumbCanvasObj) {
                console.log("设置currGetThumbCanvasObj对象");
                MediaUtil.currGetThumbCanvasObj = document.createElement("canvas");
            }
            MediaUtil.currGetThumbCanvasObj.width = targetWidth;
            MediaUtil.currGetThumbCanvasObj.height = targetHeight;
            const context = MediaUtil.currGetThumbCanvasObj.getContext("2d");
            context.drawImage(img, 0, 0, targetWidth, targetHeight);
            imgType = imgType || "image/png";
            let quality = imgType === "image/jpeg" ? 0.3 : 1;
            let dataUrl = "";
            if (needUrl) {
                dataUrl = MediaUtil.currGetThumbCanvasObj.toDataURL(imgType, quality);
            }
            MediaUtil.currGetThumbCanvasObj.toBlob(function (blob) {
                resolve({ blob, dataUrl });
            }, imgType, quality);
        });
    },
    getImageResizeRatio(origin, max) {
        const width = origin.width;
        const height = origin.height;
        const maxWidth = max.width || 0;
        const maxHeight = max.width || 0;
        let ratio = 1;

        if (maxWidth > 0 && width > maxWidth) {
            ratio = maxWidth / width;
        }
        if (maxHeight > 0 && height > maxHeight) {
            let ratioHeight = maxHeight / height;
            ratio = Math.min(ratio, ratioHeight);
        }
        return ratio;
    },
    async runGetFiles(event, param, cb) {
        if (!MediaUtil.currGetPhotosInputObj) {
            console.log("设置currGetPhotosInputObj对象");
            MediaUtil.currGetPhotosInputObj = document.createElement("input");
            const id = "getPhotos" + Math.floor(Math.random() * 1000);
            MediaUtil.currGetPhotosInputObj.setAttribute("id", id);
            MediaUtil.currGetPhotosInputObj.setAttribute("type", "file");
            // MediaUtil.currGetPhotosInputObj.setAttribute('accept', 'image/*')
            MediaUtil.currGetPhotosInputObj.setAttribute("multiple", "multiple");
            MediaUtil.currGetPhotosInputObj.setAttribute("style", "display:none;");
            document.body.appendChild(MediaUtil.currGetPhotosInputObj);
            const changeListener = (res) => {
                console.log(res, MediaUtil.currGetPhotosInputObj.files);
                const files = MediaUtil.currGetPhotosInputObj.files;
                cb(files);
                // 1
                console.log("回收currGetPhotosInputObj对象");
                MediaUtil.currGetPhotosInputObj.removeEventListener("change", changeListener);
                document.body.removeChild(MediaUtil.currGetPhotosInputObj);
                // 2
                MediaUtil.currGetPhotosInputObj.files = null;
                MediaUtil.currGetPhotosInputObj.value = null;
                MediaUtil.currGetPhotosInputObj = null;
            };
            MediaUtil.currGetPhotosInputObj.addEventListener("change", changeListener);
        }
        if (param === 1) {
            // capture
            MediaUtil.currGetPhotosInputObj.setAttribute("capture", "camera");
            MediaUtil.currGetPhotosInputObj.removeAttribute("accept");
        } else if (param === 2) {
            // accept
            MediaUtil.currGetPhotosInputObj.setAttribute("accept", "image/*");
            MediaUtil.currGetPhotosInputObj.removeAttribute("capture");
        } else {
            // accept + capture
            MediaUtil.currGetPhotosInputObj.setAttribute("accept", "image/*");
            MediaUtil.currGetPhotosInputObj.setAttribute("capture", "camera");
        }
        MediaUtil.currGetPhotosInputObj.click();
    },
    createSlicedFileBlock(rawFile, byteStart, byteEnd) {
        const name = rawFile.name || rawFile.fileName;
        const type = rawFile.type;
        const lastModified = rawFile.lastModified;
        // const lastModifiedDate = rawFile.lastModifiedDate;
        const relativePath = rawFile.relativePath || rawFile.webkitRelativePath;
        const targetBlob = rawFile.slice(byteStart, byteEnd);
        return MediaUtil.blobToFile(targetBlob, name, type, lastModified, relativePath);
    },
    blobToFile(targetBlob, fileName, type, lastModified, relativePath) {
        const options = {
            type,
            lastModified,
            // lastModifiedDate,
            relativePath
        };
        return new File([targetBlob], fileName, options);
    },
    async fileExist(baseURL, { fileId, fileSize, fileType }, token) {
        try {
            const query = {
                file_id: fileId + '_' + fileType.toUpperCase(),
                file_size: fileSize
            };
            const result = await axios({
                method: "get",
                url: `/check?${encodeQueryString(query)}`,
                baseURL: baseURL || "http://124.42.103.164:8083",
                headers: {
                    token: `${token}`
                }
            });
            return result;
        } catch (e) {
            console.log(e);
            return null;
        }
    }
};

export const doMultiTasks = async (targets, handler) => {
    return new Promise(function (resolve) {
        if (!handler || typeof handler !== "function") {
            console.error("doMultiTasks: lack of handler");
            return resolve(null);
        }
        const tasks = [];
        const taskIndexInfo = {};
        let taskIndex = 0;
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            const subTasks = handler(target);
            for (let j = 0; j < subTasks.length; j++) {
                tasks.push(subTasks[j]);
                taskIndexInfo[taskIndex] = {
                    pos: i,
                    target: target
                };
                taskIndex++;
            }
        }
        const outs = [];
        Promise.all(tasks).then(function (results) {
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const pos = taskIndexInfo[i].pos;
                const target = taskIndexInfo[i].target;
                if (!outs[pos]) {
                    outs[pos] = { target, result: [] };
                }
                outs[pos].result.push(result);
            }
            resolve(outs);
        });
    });
};

declare global {

    interface Document {
        selection: any;
    }

    interface FileReader {
        content: string;
    }
}
