/* eslint strict: 0 */
'use strict';

const PROJECT_INFO = require('./package.json');
const ProductName = PROJECT_INFO.productName;
const ProductCompany = PROJECT_INFO.companyName;

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
            label   : 'Edit',
            submenu : [{
                label       : 'Undo',
                accelerator : 'Command+Z',
                selector    : 'undo:'
            }, {
                label       : 'Redo',
                accelerator : 'Shift+Command+Z',
                selector    : 'redo:'
            }, {
                type : 'separator'
            }, {
                label       : 'Cut',
                accelerator : 'Command+X',
                selector    : 'cut:'
            }, {
                label       : 'Copy',
                accelerator : 'Command+C',
                selector    : 'copy:'
            }, {
                label       : 'Paste',
                accelerator : 'Command+V',
                selector    : 'paste:'
            }, {
                label       : 'Select All',
                accelerator : 'Command+A',
                selector    : 'selectAll:'
            }]
        }, {
            label   : 'View',
            submenu : (true || process.env.NODE_ENV === 'development') ? [{
                label       : 'Reload',
                accelerator : 'Command+R',
                click () {
                    mainWindow.restart();
                }
            }, {
                label       : 'Toggle Full Screen',
                accelerator : 'Ctrl+Command+F',
                click () {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }, {
                label       : 'Toggle Developer Tools',
                accelerator : 'Alt+Command+I',
                click () {
                    mainWindow.toggleDevTools();
                }
            }]: [{
                label       : 'Toggle Full Screen',
                accelerator : 'Ctrl+Command+F',
                click () {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }]
        }, {
            label   : 'Window',
            submenu : [{
                label       : 'Minimize',
                accelerator : 'Command+M',
                selector    : 'performMiniaturize:'
            }, {
                label       : 'Close',
                accelerator : 'Command+W',
                selector    : 'performClose:'
            }, {
                type : 'separator'
            }, {
                label    : 'Bring All to Front',
                selector : 'arrangeInFront:'
            }]
        }, {
            label   : 'Help',
            submenu : [{
                label : 'Learn More',
                click () {
                    shell.openExternal('http://electron.atom.io');
                }
            }, {
                label : 'Documentation',
                click () {
                    shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
                }
            }, {
                label : 'Community Discussions',
                click () {
                    shell.openExternal('https://discuss.atom.io/c/electron');
                }
            }, {
                label : 'Search Issues',
                click () {
                    shell.openExternal('https://github.com/atom/electron/issues');
                }
            }]
        }];

        menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    } else {
        template = [{
            label   : '&File',
            submenu : [{
                label       : '&Open',
                accelerator : 'Ctrl+O'
            }, {
                label       : '&Close',
                accelerator : 'Ctrl+W',
                click () {
                    mainWindow.close();
                }
            }]
        }, {
            label   : '&View',
            submenu : (process.env.NODE_ENV === 'development') ? [{
                label       : '&Reload',
                accelerator : 'Ctrl+R',
                click () {
                    mainWindow.restart();
                }
            }, {
                label       : 'Toggle &Full Screen',
                accelerator : 'F11',
                click () {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }, {
                label       : 'Toggle &Developer Tools',
                accelerator : 'Alt+Ctrl+I',
                click () {
                    mainWindow.toggleDevTools();
                }
            }]: [{
                label       : 'Toggle &Full Screen',
                accelerator : 'F11',
                click () {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }]
        }, {
            label   : 'Help',
            submenu : [{
                label : 'Learn More',
                click () {
                    shell.openExternal('http://electron.atom.io');
                }
            }, {
                label : 'Documentation',
                click () {
                    shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
                }
            }, {
                label : 'Community Discussions',
                click () {
                    shell.openExternal('https://discuss.atom.io/c/electron');
                }
            }, {
                label : 'Search Issues',
                click () {
                    shell.openExternal('https://github.com/atom/electron/issues');
                }
            }]
        }];
        menu = Menu.buildFromTemplate(template);
        mainWindow.setMenu(menu);
    }
});
