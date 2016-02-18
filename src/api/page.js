var util = require('../utils/common');


export default {
    generate (data) {
        if (!data.snapshots.length) {
            return 'no snapshots.';
        }

        var template = util.hereDoc(function () {/*!
         <!DOCTYPE html>
         <html lang="en">
         <head>
         <meta charset="UTF-8">
         <title>Case Result</title>
         <style>
         body {background: #eee;}
         #album {width: 800px;height: 600px;margin: 0 auto;text-align: center;overflow: hidden;}
         ul {display: block;width: 100%;height: 300px;margin-top: 20px;list-style: none;}
         li {float: left;width: 100px;margin: 2px;}
         li a img {width: 100%;border: 1px solid #79C3F7;}
         </style>
         </head>
         <body>
         <script type="application/javascript">
         var $CONFIG = %DATA%;
         var html = [];

         html.push('<h1>title</h1>');
         html.push('<h2>' + (new Date($CONFIG.date)) + '</h2>');

         html.push('<div id="album">');
         html.push('<a href="' + $CONFIG.snapshots[0] + '">');
         html.push('<img src="' + $CONFIG.snapshots[0] + '" alt="view:' + $CONFIG.snapshots[0] + '">');
         html.push('</a>');
         html.push('</div>');

         html.push('<ul>');
         for (var i = 0, j = $CONFIG.snapshots.length; i < j; i++) {
         html.push('<li>');
         html.push('<a href="' + $CONFIG.snapshots[i] + '">');
         html.push('<img src="' + $CONFIG.snapshots[i] + '" alt="view:' + $CONFIG.snapshots[i] + '">');
         html.push('</a>');
         html.push('</li>');
         }
         html.push('</ul>');

         document.body.innerHTML = html.join('');

         var images = document.querySelectorAll('ul li a img');
         for (var i = 0, j = images.length; i < j; i++) {
         (function (image) {
         image.addEventListener('mouseenter',function () {
         document.querySelector('#album img').src = image.src;
         });
         }(images[i]));
         }

         </script>

         </body>
         </html>
         */
            return 1;
        }).replace(/%DATA%/g, JSON.stringify(data));
        return template;
    }
};
