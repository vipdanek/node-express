const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session); //После передачи параметра с которым мы будем исп-л для синхронизации, он нам вернет класс кот-й будем использовать
const csrf = require("csurf");
const flash = require("connect-flash");

const homeRoutes = require("./routes/home");
const cardRoutes = require("./routes/card");
const addRoutes = require("./routes/add");
const ordersRoutes = require("./routes/orders");
const coursesRoutes = require("./routes/courses");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");
const errorHandler = require("./middleware/error");
const fileMiddleware = require("./middleware/file");
const keys = require("./keys");

const PORT = process.env.PORT || 3000;

const app = express();
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: require("./utils/hbs-helpers"),
});

const store = new MongoStore({
  collection: "sessions",
  uri: keys.MONGODB_URI,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(fileMiddleware.single("avatar"));
// --- Middleware ---
app.use(csrf());
app.use(flash());

app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/card", cardRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

//404 error
app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} .....`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();
