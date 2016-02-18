## 调试开发

项目使用NPM进行依赖管理，请先通过命令，完成依赖安装。

```
npm install
```

在安装完成之后，执行`deploy`目录中的`*.sh`进行插件构建，如：

```
cd fox_project_dir/

./deploy/preRelease.sh
```

然后在项目的dist目录便可以找到生成的插件相关文件。


如果你需要在本地运行模拟服务器，请参考: [服务端运行](https://github.com/soulteary/fox/tree/cloud-server#run)
