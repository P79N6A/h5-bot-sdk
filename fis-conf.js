/**
 * @file fis推送配置文件
 * @description 推送文件到个人开发机，用于线下环境测试
 * @author dengxuening<dengxuening@baidu.com>
 */

fis.media('static').match('*.js', {
    deploy: fis.plugin('http-push', {
        // host: 'http://cp01-dengxuening.epc.baidu.com:8210',
        receiver: 'http://cp01-dengxuening.epc.baidu.com:8080/receiver.php',
        to: '/home/users/dengxuening/static-server/static/dbp/sdk'
    })
});

fis.media('html').match('*.html', {
    deploy: fis.plugin('http-push', {
        // host: 'http://cp01-dengxuening.epc.baidu.com:8210',
        receiver: 'http://cp01-dengxuening.epc.baidu.com:8080/receiver.php',
        to: '/home/users/dengxuening/static-server/html'
    })
});
