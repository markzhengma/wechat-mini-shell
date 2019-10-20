// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
      let adminRecord = await db.collection('admins').where({
            admin_name: event.admin_name,
            pass: event.pass
      }).limit(1).get();
      
      return { location: adminRecord.data[0].location, is_super: adminRecord.data[0].is_super, location_char: adminRecord.data[0].location_char };
}