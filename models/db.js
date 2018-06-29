var config = require("../config/default.js");
//创建数据库终端
const MongoClient = require('mongodb').MongoClient;

/**
 * 数据库的链接
 * @param callback 返回数据库实例
 * @private
 */
function _connectDB(callback) {
    var url = config.database.url;
    MongoClient.connect(url,function (err,client) {
        if (err) {
            callback(err,null);
            return
        }
        callback(err,client);
    })
}

/**
 * 插入文档
 * @param collectionName
 * @param docs
 * @param callback
 */
exports.insertOne = function (collectionName,doc,callback) {
    // 连接数据库
    _connectDB(function (err,client) {
        const db = client.db(config.dbName);
        db.collection(collectionName).insertOne(doc,function (err,result) {
            callback(err,result);
            client.close();
        })
    })
}

/**
 * 删除文档
 * @param collectionName
 * @param query
 * @param callback
 */
exports.deleteMany = function (collectionName,query,callback) {
    // 连接数据库
    _connectDB(function (err,client) {
        const db = client.db(config.dbName);
        db.collection(collectionName).deleteMany(query,function (err,result) {
            callback(err,result);
            client.close();
        })
    })
}

/**
 * 修改文档
 * @param collectionName
 * @param query
 * @param update
 * @param callback
 */
exports.updateMany = function (collectionName,query,update,callback) {
    // 链接数据库
    _connectDB(function (err,client) {
        const db = client.db(config.dbName);
        db.collection(collectionName).updateMany(query,update,function (err,result) {
            callback(err,result);
            client.close();
        })
    })
}

/**
 *
 * @param collectionName
 * @param query 查询条件
 * @param options 分页-pageSize(页容量) pageNum（页码）  sortObj(排序) 该参数不是必须的
 * @param callback
 */
exports.find = function (collectionName,query,C,D) {
    var result = [];
    if (arguments.length === 3) { //缺省options，表示查询所有，不分页
        var limitNum = 0;
        var skipNum = 0;
        var callback = C;
        var sortObj = {};
    } else {
        var callback = D;
        var options = C;
        var limitNum = options.pageSize || 0;
        var skipNum = limitNum * (options.pageNum || 0);
        var sortObj = options.sortObj ;
    }
    // 链接数据库库
    _connectDB(function (err,client) {
        const db = client.db(config.dbName);
        var cursor = db.collection(collectionName).find(query).limit(limitNum).skip(skipNum).sort(sortObj);
        cursor.each(function (err,doc) {
            if (err) {
                callback(err,null);
                return
            };
            if (doc != null) {
                result.push(doc);
            } else  { //遍历结束
                callback(err,result);
                client.close();
            }
        })
    })
}