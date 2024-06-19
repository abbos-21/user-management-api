const express = require("express");
const bcrypt = require("bcryptjs");
const {
  createUser,
  deleteUserById,
  updateUserDetails,
  findUserById,
} = require("../models/user");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: User with this email already exists
 */
router.post("/", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 400,
      message: "Email is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      status: 400,
      message: "Password is required",
    });
  }

  if (!firstName) {
    return res.status(400).json({
      status: 400,
      message: "First name is required",
    });
  }

  if (!lastName) {
    return res.status(400).json({
      status: 400,
      message: "Last name is required",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  createUser(email, hashedPassword, firstName, lastName, (err, userId) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: "User with this email already exists",
      });
    }
    res.status(201).json({
      status: 201,
      message: "User created successfully",
    });
  });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  deleteUserById(id, (err, changes) => {
    if (err) {
      return res.status(500).json({
        status: 500,
        message: "Error deleting user",
      });
    }
    if (changes === 0) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: 200,
      message: "User deleted successfully",
    });
  });
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user's details
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newEmail:
 *                 type: string
 *               newFirstName:
 *                 type: string
 *               newLastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: No changes detected
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user details
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { newEmail, newFirstName, newLastName } = req.body;

  if (!newEmail && !newFirstName && !newLastName) {
    return res.status(400).json({
      status: 400,
      message:
        "At least one of new email, first name, or last name is required",
    });
  }

  updateUserDetails(id, newEmail, newFirstName, newLastName, (err, result) => {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({
          status: 400,
          message: "User with this email already exists",
        });
      }
      if (err.message === "User not found") {
        return res.status(404).json({
          status: 404,
          message: err.message,
        });
      }
      return res.status(500).json({
        status: 500,
        message: "Error updating user details",
      });
    }
    if (result === "No changes detected") {
      return res.status(400).json({
        status: 400,
        message: result,
      });
    }
    res.status(200).json({
      status: 200,
      message: "User updated successfully",
    });
  });
});

module.exports = router;
