/* eslint strict: 0 */
'use strict';

const PROJECT_INFO = require('./package.json');
const ProductName = PROJECT_INFO.productName;
const ProductCompany = PROJECT_INFO.companyName;
const DefaultUser = PROJECT_INFO.defaultUser;

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const crashReporter = electron.crashReporter;
const shell = electron.shell;
let menu;
let template;
let mainWindow = null;

// load api
const apiServer = require('./app/utils/api');
const userApi = require('./app/api/user');

crashReporter.start({
    productName : ProductName,
    companyName : ProductCompany,
    submitURL   : 'https://your-domain.com/url-to-submit',
    autoSubmit  : false
});

if (process.env.NODE_ENV === 'development') {
    require('electron-debug')();
}


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


app.on('ready', () => {
    mainWindow = new BrowserWindow({width : 1024, height : 728});
    // apiServer('stop');
    apiServer('start');

    // init default user
    userApi('register', DefaultUser);

    if (process.env.HOT) {
        mainWindow.loadURL(`file://${__dirname}/app/hot-dev-app.html`);
    } else {
        mainWindow.loadURL(`file://${__dirname}/app/app.html`);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.openDevTools();

        BrowserWindow.addDevToolsExtension('/Users/soulteary/fox/react-devtools/shells/chrome');

    }

    if (process.platform === 'darwin') {
        template = [{
            label   : `${ProductName}`,
            submenu : [{
                label    : `关于 ${ProductName}`,
                selector : 'orderFrontStandardAboutPanel:'
            }, {
                type : 'separator'
            }, {
                label   : '偏好设置',
                submenu : []
            }, {
                type : 'separator'
            }, {
                label       : `隐藏 ${ProductName}`,
                accelerator : 'Command+H',
                selector    : 'hide:'
            }, {
                label       : '隐藏其他窗口',
                accelerator : 'Command+Shift+H',
                selector    : 'hideOtherApplications:'
            }, {
                label    : '显示所有窗口',
                selector : 'unhideAllApplications:'
            }, {
                type : 'separator'
            }, {
                label       : '退出程序',
                accelerator : 'Command+Q',
                click () {
                    app.quit();
                }
            }]
        }, {
            label   : '编辑',
            submenu : [{
                label       : '撤销',
                accelerator : 'Command+Z',
                selector    : 'undo:'
            }, {
                label       : '重做',
                accelerator : 'Shift+Command+Z',
                selector    : 'redo:'
            }, {
                type : 'separator'
            }, {
                label       : '剪切',
                accelerator : 'Command+X',
                selector    : 'cut:'
            }, {
                label       : '复制',
                accelerator : 'Command+C',
                selector    : 'copy:'
            }, {
                label       : '粘贴',
                accelerator : 'Command+V',
                selector    : 'paste:'
            }, {
                label       : '全选',
                accelerator : 'Command+A',
                selector    : 'selectAll:'
            }]
        }, {
            label   : '查看',
            submenu : (true || process.env.NODE_ENV === 'development') ? [{
                label       : '刷新',
                accelerator : 'Command+R',
                click () {
                    mainWindow.restart();
                }
            }, {
                label       : '全屏模式',
                accelerator : 'Ctrl+Command+F',
                click () {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }, {
                label       : '切换展示开发者工具',
                accelerator : 'Alt+Command+I',
                click () {
                    mainWindow.toggleDevTools();
                }
            }]: [{
                label       : '全屏模式',
                accelerator : 'Ctrl+Command+F',
                click () {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }]
        }, {
            label   : '窗口',
            submenu : [{
                label       : '最小化',
                accelerator : 'Command+M',
                selector    : 'performMiniaturize:'
            }, {
                label       : '关闭',
                accelerator : 'Command+W',
                selector    : 'performClose:'
            }, {
                type : 'separator'
            }, {
                label    : '前置窗口',
                selector : 'arrangeInFront:'
            }]
        }, {
            label   : '帮助',
            submenu : [{
                label : '了解更多',
                click () {
                    shell.openExternal('https://github.com/soulteary/fox');
                }
            }, {
                label : '查看文档',
                click () {
                    shell.openExternal('https://github.com/soulteary/fox/tree/desktop-application');
                }
            }, {
                label : '社区讨论',
                click () {
                    shell.openExternal('https://github.com/soulteary/fox/issues');
                }
            }, {
                label : '搜索ISSUE',
                click () {
                    shell.openExternal('https://github.com/soulteary/fox/issues');
                }
            }]
        }];

        menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    } else {
        template = [{
            label   : '文件(&F)',
            submenu : [{
                label       : '打开(&O)',
                accelerator : 'Ctrl+O'
            }, {
                label       : '关闭(&C)',
                accelerator : 'Ctrl+W',
                click () {
                    mainWindow.close();
                }
            }]
        }, {
            label   : '查看(&V)',
            submenu : (process.env.NODE_ENV === 'development') ? [{
                label       : '刷新(&R)',
                accelerator : 'Ctrl+R',
                click () {
                    mainWindow.restart();
                }
            }, {
                label       : '全屏模式(&F)',
                accelerator : 'F11',
                click () {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }, {
                label       : '切换展示开发者工具(&D)',
                accelerator : 'Alt+Ctrl+I',
                click () {
                    mainWindow.toggleDevTools();
                }
            }]: [{
                label       : '全屏模式(&F)',
                accelerator : 'F11',
                click () {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }]
        }, {
            label   : '帮助',
            submenu : [{
                label : '了解更多',
                click () {
                    shell.openExternal('https://github.com/soulteary/fox');
                }
            }, {
                label : '查看文档',
                click () {
                    shell.openExternal('https://github.com/soulteary/fox/tree/desktop-application');
                }
            }, {
                label : '社区讨论',
                click () {
                    shell.openExternal('https://github.com/soulteary/fox/issues');
                }
            }, {
                label : '搜索ISSUE',
                click () {
                    shell.openExternal('https://github.com/soulteary/fox/issues');
                }
            }]
        }];
        menu = Menu.buildFromTemplate(template);
        mainWindow.setMenu(menu);
    }
});
