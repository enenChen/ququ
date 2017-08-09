var gui = require('nw.gui');
var pkg = require('./package.json'); // Insert your app's manifest here
var updater = require('node-webkit-updater');
var upd = new updater(pkg);
var copyPath, execPath;

if (gui.App.argv.length) {
    copyPath = gui.App.argv[0];
    execPath = gui.App.argv[1];

    // Replace old app
    console.log("intall:" + copyPath);
    upd.install(copyPath, function (err) {
        console.log("install err:" + err);
        if (!err) {
            upd.run(execPath, null);
            gui.App.quit();
        }
    });
} else {
    upd.checkNewVersion(function (error, newVersionExists, manifest) {
        console.log("new version:" + newVersionExists);
        //升级信息页
        if (newVersionExists) {
            gui.Window.open('update.html', {
                "min_width": 900,
                "min_height": 600,
                "width": 900,
                "height": 600,
                "show": true,
                "frame": true,
                "title": 'update',
                "focus": true
            }, function (win) {

            });
        }
        return;
        if (!error && newVersionExists) {
            //todo 提醒用户是否下载安装最新版本
            upd.download(function (error, filename) {
                console.log("download err:" + error);
                if (!error) {
                    var mainWindow = process.mainModule.exports.mainWindow;
                    if (!mainWindow.window.confirmUpdate) {
                        return;
                    }
                    mainWindow.window.confirmUpdate(function (up) {
                        if (!up) {
                            return;
                        }
                        if (process.platform == "win32") {
                            filename = filename.replace(/\\/g, "/");
                            gui.Shell.openItem(filename);
                            gui.App.quit();
                        } else {
                            console.log("run installer");
                            upd.unpack(filename, function (error, newAppPath) {
                                if (!error) {
                                    console.log("unpacked:" + newAppPath);
                                    upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()], {});
                                    gui.App.quit();
                                }
                            }, manifest);
                        }
                    });
                }
            }, manifest);
        }
    });
}
