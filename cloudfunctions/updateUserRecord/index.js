// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var update_field = event.update_field
  try {
    return await db.collection('user_records').where({
      _id: event.update_id
    })
    .update({
      data: {
        [update_field]: event.update_data
      }
    })
  } catch (e) {
    console.error(e)
  }
}