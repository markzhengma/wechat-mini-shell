// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('user_records').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        date: event.date,
        gift: event.gift,
        milage: parseInt(event.milage),
        operator: event.operator,
        product_name: event.product_name,
        detail: event.detail,
        record_num: event.record_num
      }
    })
  } catch (e) {
    console.error(e)
  }
}