import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnCloudinary = async (LocalfilePath) => {
  try {
    if (!LocalfilePath) return null;
    const res = await cloudinary.uploader.upload(LocalfilePath,
      {
        resource_type: "auto",
      })
    // File Has Been Uploaded
    console.log("File Has Been Uploaded🔥", res.url);
    return res;
  } catch (error) {
    fs.unlinkSync(LocalfilePath); // remove temp file
    return null;
  }
  finally {
    fs.unlinkSync(LocalfilePath); // remove temp file
  }
};


export default UploadOnCloudinary;