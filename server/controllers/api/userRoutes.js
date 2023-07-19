const router = require("express").Router();
const { User } = require("../../models");
// const withAuth = require("../../utils/auth");

//const findAvatar = require("../../scripts/avatar");

// not sure what this is for
router.get("/me", (req, res) => {
  // Find the logged in user based on the userId in the session
  User.findByPk(req.session.user_id)
    .then((user) => {
      // Send the user data as a response
      res.json(user);
    })
    .catch((error) => {
      // If an error occurs, send a 500 status code with the error message
      res.status(500).send(error.message);
    });
});

router.post("/", async (req, res) => {
  try {
    const userData = await User.create(req.body);

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.username = userData.username;
      req.session.logged_in = true;

      res.status(200).json(userData);
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect username or password, please try again." });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Incorrect username or password, please try again." });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.username = userData.username;
      // req.session.avatarurl = userData.avatar;
      req.session.current_win_count = userData.win_count;
      req.session.logged_in = true;

      res.json({ user: userData, message: "You are now logged in!" });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/logouts", (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

// needs work, id should be req.session.user_id
// router.put("/avatar/:id", async (req, res) => {
//   try {
//     const avatar = await User.update(req.body, {
//       where: {
//         id: req.session.user_id,
//       },
//     });

//     if (!avatar) {
//       res.status(200).end();
//     } else {
//       res.json({ message: "Successfully updated avatar." });
//       return;
//     }
//   } catch (err) {
//     res.status(400).json(err);
//   }
// });

// route to increment user wincount by 1
router.put("/:id", async (req, res) => {
  try {
    const userData = await User.increment(
      { win_count: 1 },
      {
        where: {
          id: req.session.user_id,
        },
      }
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json(err);
  }
});

// routes for testing
// get your user info
router.get("/user", async (req, res) => {
  try {
    const userData = await User.findOne({
      where: {
        id: req.session.user_id,
      },
    });
    res.json(userData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// get user info by id
router.get("/:id", async (req, res) => {
  try {
    const userData = await User.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.json(userData);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
