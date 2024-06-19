const express = require("express");
const { getAllUsers, findUserByEmail } = require("../models/user");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Info
 *   description: API for retrieving user information
 */

/**
 * @swagger
 * /info/users:
 *   get:
 *     summary: Retrieve a list of users or a user by email
 *     tags: [Info]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: The user's email
 *     responses:
 *       200:
 *         description: A list of users or a single user by email
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Error retrieving users
 */
router.get("/users", (req, res) => {
  const { email } = req.query;

  if (email) {
    findUserByEmail(email, (err, user) => {
      if (err || !user) {
        return res
          .status(404)
          .json({ status: 404, message: "User not found", data: null });
      }
      return res.status(200).json({
        status: 200,
        message: "OK",
        data: user,
      });
    });
  } else {
    getAllUsers((err, users) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: "Error retrieving users",
          data: null,
        });
      }
      res.status(200).json({
        status: 200,
        message: "OK",
        data: users,
      });
    });
  }
});

module.exports = router;
