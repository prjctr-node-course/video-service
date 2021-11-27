const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const router = require('./middlewares/routes/router');

const app = new Koa();

app.use(bodyparser());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
