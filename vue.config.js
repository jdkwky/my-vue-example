module.exports = {
    devServer: {
        proxy: {
            '/reactJson': {
                target: 'http://127.0.0.1:8081/',
                changeOrigin: true,
                pathRewrite: { '/reactJson': '' }, // 重写路径
            },
        },
    },
};
