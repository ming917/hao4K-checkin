import axios from "axios";
import xmlJs from "xml-js";
import iconv from "iconv-lite";

// server酱开关，填off不开启(默认)，填on同时开启cookie失效通知和签到成功通知
const server = process.env["SERVER"];

// 填写server酱sckey,不开启server酱则不用填
const sckey = process.env["SCKEY"];

// 填入glados账号对应cookie
const cookie = process.env["COOKIE"];

const checkInUrl =
  "https://www.hao4k.cn//qiandao/?mod=sign&operation=qiandao&formhash=f4b02e7d&format=empty&inajax=1&ajaxtarget=JD_sign";
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36";

const headers = {
  cookie: cookie ?? "",
  "User-Agent": userAgent,
};

function start() {
  axios
    .get(checkInUrl, {
      headers,
      responseType: "arraybuffer",
    })
    .then((response) => {
      const resUtf8 = iconv.decode(response.data, "GBK");
      const dataStr = xmlJs.xml2json(resUtf8, {
        compact: true,
        spaces: 4,
      });
      const data = JSON.parse(dataStr);
      const content = data?.root?._cdata;

      let message = "";
      if (!content) {
        message = "hao4K:签到成功";
      }
      if (content === "今日已签") {
        message = "hao4K:今日已签";
      } else {
        message = "hao4K:cookie 已过期，请重新设置！";
      }

      // 解决 Request path contains unescaped characters
      message = encodeURI(message)
      
      if (server === "on") {
        axios
          .get('https://sc.ftqq.com/' + sckey + '.send?text=' + message)
          // 解决 UnhandledPromiseRejectionWarning
          .catch((e) => {
            console.log(e);
          });
      }
    })
    .catch((error) => {
      console.log("hao4K:签到出错" + error);
    });
}

start();
