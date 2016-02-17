/**
 * 服务器模拟器入口
 */
var option = {
    'addr' : '127.0.0.1',
    'port' : 8000,
    'dir'  : 'data'
};

require('./common/server').start(option);

/*!

 useage: pm2 start npm --name "{app_name}" -- run {script_name}

 public domain: http://0.1.fox.pantimos.com:8000/

 curl -H "Content-Type: application/json" -X POST  --data '{"user":"1","pass":"1"}'  http://127.0.0.1:8000/user/register.json

 curl -H "Content-Type: application/json" -X POST --data '{"user":"1","pass":"1"}'  http://127.0.0.1:8000/user/login.json

 curl -H "Content-Type: application/json" -X POST --data '{"user":"1","pass":"1"}'  http://127.0.0.1:8000/case/list.json

 curl -H "Content-Type: application/json" -X POST --data '{"user":"1","pass":"1", "data":"var a=123"}'  http://127.0.0.1:8000/case/save.json

 */
