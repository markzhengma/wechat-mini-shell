// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('users').where({
      record_num: event.record_num
    })
    .update({
      data: {
        user_name: event.userInfo.user_name,
        phone: event.userInfo.phone,
        plate: event.userInfo.plate,
        make: event.userInfo.make,
      }
    })
  } catch (e) {
    console.error(e)
  }
}