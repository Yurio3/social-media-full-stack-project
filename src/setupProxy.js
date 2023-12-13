const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target:"https://warm-escarpment-87709-bda476d0d31d.herokuapp.com/",
          //"http://localhost:5001",
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        "^/api": ""
      }
    })
  );
  
};
