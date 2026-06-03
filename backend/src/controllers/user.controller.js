import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { User } from "../models/user.model.js";

import { Book } from "./../models/book.model.js";
import { QuestionPaper } from "./../models/questionPaper.model.js";
import { StudyMaterial } from "../models/studyMaterial.model.js";
import { Connection } from "./../models/connection.model.js";

const registerUser = asyncHandler(async (req, res) => {
  const { uid, fullName, email, username, institute, role } = req.body;
  if (
    [fullName, email, username, institute, role].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "Please fill all fields");
  }
  if (uid == "" || uid == null || uid == undefined) {
    throw new ApiError(400, "uid is required");
  }

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existedUser) {
    throw new ApiError(400, "Email or Username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Something went wrong while uploading avatar");
  }
  const user = await User.create({
    uid,
    fullName,
    avatar: avatar.secure_url,
    institute,
    role,
    email,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "uid username email fullName institute role avatar"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  if (!user) {
    throw new ApiError(401, "User Data not found");
  }
  return res.status(200).json(new ApiResponse(200, user, "User details"));
});

const verifyUser = asyncHandler(async (req, res) => {
  let user = await User.findOne({
    uid: req.user.uid,
  });
  if (!user) {
    throw new ApiError(400, "User Data not found");
  }
  if (req.user.email != user.email) {
    throw new ApiError(400, "Email do not match");
  }
  const merged = {
    ...user.toObject(), // convert mongoose doc to plain object
    ...req.user, // override with req.user fields (if any overlap)
    isVerified: true,
    username: user.username.toLowerCase(),
  };

  console.log("Verify User", merged);
  return res
    .status(200)
    .json(new ApiResponse(200, merged, "User verified successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, role, institute, email, username } = req.body;
  const avatarLocalPath = req.files?.avatar ? (req.files.avatar[0] ? req.files.avatar[0].path : null) : null;
  console.log(avatarLocalPath);
  console.log(fullName, email, username, role, institute);
  // Check if any required fields are empty
  if (
    [fullName, email, username, institute, role].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "Please fill all fields");
  }
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      throw new ApiError(400, "User Data not found");
    }

    // Upload avatar to Cloudinary if an avatar file is provided
    if (avatarLocalPath) {
      const avatar = await uploadOnCloudinary(avatarLocalPath);
      if (!avatar) {
        throw new ApiError(500, "Something went wrong while uploading avatar");
      }

      // Update user's avatar URL in the database
      user.avatar = avatar.secure_url;
    }
    // Update user's details in the database
    user.fullName = fullName;
    user.role = role;
    user.institute = institute;
    
    const updatedUser = await user.save();
    // Respond with the updated user object and success message
    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Account details updated"));
  } catch (error) {
    // Handle any errors that occur during avatar upload or database update
    console.error("Error updating account details:", error.message);
    throw new ApiError(500, error.message || "Failed to update account details");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  let username;
  if (req.params.username) {
    username = req.params.username;
  } else {
    username = req.user.username;
  }

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  const userProfile = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "connections",
        localField: "uid",
        foreignField: "following",
        as: "followers",
      },
    },
    {
      $lookup: {
        from: "connections",
        localField: "uid",
        foreignField: "followedBy",
        as: "follows",
      },
    },
    {
      $addFields: {
        followerCount: { $size: "$followers" },
        followingCount: { $size: "$follows" },
        isFollowing: {
          $cond: {
            if: { $in: [req.user.uid, "$followers.followedBy"] },
            then: true,
            else: false,
          },
        },
        disableButton: {
          $cond: {
            if: { $eq: [req.user.username, username] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        uid: 1,
        fullName: 1,
        username: 1,
        avatar: 1,
        followerCount: 1,
        followingCount: 1,
        isFollowing: 1,
        disableButton: 1,
        email: 1,
        role: 1,
        institute: 1,
      },
    },
  ]);

  if (!userProfile.length) {
    throw new ApiError(404, "User not found");
  }
  const user = userProfile[0];
  const books = await Book.find({ uploadedBy: user.uid });
  const questionPapers = await QuestionPaper.find({ uploadedBy: user.uid });
  const studyMaterials = await StudyMaterial.find({ uploadedBy: user.uid });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userProfile, items: { questionPapers, studyMaterials, books } },
        "User profile fetched successfully"
      )
    );
});

const followUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    throw new ApiError(400, "User id is required");
  }
  const user = await User.findOne({ uid: uid });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (uid == req.user.uid) {
    throw new ApiError(400, "You cannot follow yourself");
  }
  const connection = await Connection.findOne({
    followedBy: req.user.uid,
    following: uid,
  });
  if (connection) {
    throw new ApiError(400, "Already following the user");
  }
  await Connection.create({
    followedBy: req.user.uid,
    following: uid,
  });
  return res.status(200).json(new ApiResponse(200, {}, "User followed"));
});

const unfollowUser = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    throw new ApiError(400, "User id is required");
  }
  const user = await User.findOne({ uid: uid });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (uid == req.user.uid) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }
  const connection = await Connection.findOneAndDelete({
    followedBy: req.user.uid,
    following: uid,
  });
  if (!connection) {
    throw new ApiError(400, "Not following the user");
  }
  return res.status(200).json(new ApiResponse(200, {}, "User unfollowed"));
});

const checkUsernameExists = asyncHandler(async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    return res.status(200).json(new ApiResponse(200, true, "Username exists"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, false, "Username does not exist"));
});

const searchUser = asyncHandler(async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) {
    res.status(400);
    throw new Error("Keyword is required");
  }
  const users = await User.aggregate([
    {
      $match: {
        $or: [
          { fullName: { $regex: keyword, $options: "i" } },
          { username: { $regex: keyword, $options: "i" } },
        ],
        username: { $ne: req.user.username },
      },
    },
    {
      $lookup: {
        from: "connections",
        localField: "uid",
        foreignField: "following",
        as: "followers",
      },
    },
    {
      $addFields: {
        isFollowing: {
          $in: [req.user.uid, "$followers.followedBy"],
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        isFollowing: 1,
        uid: 1,
      },
    },
  ]);
  return res.status(200).json(new ApiResponse(200, users, "Search Results"));
});

export {
  registerUser,
  getCurrentUser,
  checkUsernameExists,
  getUserProfile,
  searchUser,
  followUser,
  unfollowUser,
  updateAccountDetails,
  verifyUser,
};
