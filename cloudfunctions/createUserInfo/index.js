// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
      try {
            return await db.collection('users').add({
                  // data 字段表示需新增的 JSON 数据
                  data: {
                        user_name: event.user_info.user_name,
                        phone: parseInt(event.user_info.phone, 10),
                        make: event.user_info.make,
                        plate: event.user_info.plate,
                        record_num: event.record_num,
                  }
            })
      } catch (e) {
            console.error(e)
      }
}