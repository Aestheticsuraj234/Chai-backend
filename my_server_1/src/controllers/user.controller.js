import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from "../models/user.model.js"
import { ApiError } from '../utils/ApiError.js'
import { UploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"



const generateAccess_And_refreshTokens = await (userId)=> {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({
            validateBeforeSave: false
        })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something Went Wrong while Generating referesh and access token")
    }
}


const registerUser = asyncHandler(async (req, res) => {

    // TODO: Implement registerUser controller steps
    // * Step-1 Get the user data; 
    // * step-2 Check if the user already exists in the database or it is not empty ( check with username and email)
    //  * check for images , check for avatar
    // *Upload the image to the cloudinary and get the url , avatar
    //  * Create User Object - Create entry in db.
    // *remove the password from the user object and refresh token
    //  *check if the user is created successfully or not
    // * If user is created successfully then send the response with the user object and token
    // * If user is not created successfully then send the error response with the error message

    const { username, email, fullname, password } = req.body
    console.log(req.body)

    if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Please provide all the fields")
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload the avatar")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath)
    const coverImage = await UploadOnCloudinary(coverImageLocalPath)

    if (!avatar || !coverImage) {
        throw new ApiError(500, "Image upload failed")
    }

    const user = await User.create({
        username: username?.toLowerCase(),
        email,
        fullname,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",

    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "User creation failed")
    }




    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully🔥"))

})

const loginUser = asyncHandler(async (req, res) => {
    // TODO:-
    // get the data from the requ body
    const { username, email, password } = req.body()
    // check is Username or email is exists

    if (!username || !email) {
        throw new ApiError(400, "username or email is required")
    }
    // find the user
    const user = await User.findOne({ $or: [{ username }, { email }] })

    if (!user) {
        throw new ApiError(404, "User Does Not Exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    // return error
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user Credentials")
    }
    const { accessToken, refreshToken } = await generateAccess_And_refreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User Logged In SuccessFully"
            )
        )
    // send in secure cookies
    //  send rsponse 
})



const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id
        ,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"))
})




export { registerUser, loginUser, logoutUser }