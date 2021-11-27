const Router = require('@koa/router');

const routes = require('../../consts/routes');
const uploadController = require('../../controllers/upload');

const router = new Router();

router.post(routes.uploadRoutes.upload, async (ctx, next) => {
  try {
    const { code, message } = await uploadController.postUpload(ctx);

    ctx.status = code;
    ctx.body = message;
  } catch (error) {
    console.log(error);
  }

  await next();
});

module.exports = router;
