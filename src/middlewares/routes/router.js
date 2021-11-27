const Router = require('@koa/router');

const routes = require('../../consts/routes');
const uploadController = require('../../controllers/upload');

const router = new Router();

router.post(routes.uploadRoutes.upload, async (ctx, next) => {
  await uploadController.postUpload(ctx);

  await next();
});

module.exports = router;
