/**
 * Created by Administrator on 2016/5/25 0025.
 */
function CreateHTTPPoster() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }
    try {
        return new ActiveXObject('MSXML2.XMLHTTP.4.0');
    } catch (e) {
        try {
            return new ActiveXObject('MSXML2.XMLHTTP.3.0');
        } catch (e) {
            try {
                return new ActiveXObject('MSXML2.XMLHTTP.2.6');
            } catch (e) {
                try {
                    return new ActiveXObject('MSXML2.XMLHTTP');
                } catch (e) {
                    try {
                        return new ActiveXObject('MSXML3.XMLHTTP');
                    } catch (e) {
                        try {
                            return new ActiveXObject('Microsoft.XMLHTTP')
                        } catch (e) {
                            return null;
                        }
                    }
                }
            }
        }
    }
}