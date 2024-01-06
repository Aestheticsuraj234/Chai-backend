import { asyncHandler } from '../utils/asyncHandler.js';
import {User} from "../models/user.model.js"
import {ApiError} from '../utils/ApiError.js'
import {UploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
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

    const {username , email , fullname , password} = req.body
    console.log(req.body)
   
    if([username , email , fullname , password].some((field) => field?.trim() === "")){
        throw new ApiError(400 , "Please provide all the fields")
    }

   const existedUser =  await User.findOne({$or:[{username} , {email}]})

    if(existedUser){
        throw new ApiError(409 , "User already exists")
    }
    
   const avatarLocalPath =  req.files?.avatar?.[0]?.path
   const coverImageLocalPath =  req.files?.coverImage?.[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400 , "Please upload the avatar")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath)
    const coverImage = await UploadOnCloudinary(coverImageLocalPath)
       
    if(!avatar || !coverImage){
        throw new ApiError(500 , "Image upload failed")
    }

    const user = await User.create({
        username:username?.toLowerCase(),
        email,
        fullname,
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",

    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500 , "User creation failed")
    }


    

    return res.status(201).json(new ApiResponse(201 , createdUser , "User created successfully🔥"))

})


export { registerUser }