// ===============================
// Cloudinary Image Upload Service
// ===============================

const compressImage = (file, maxWidth = 1600, quality = 0.75) => {
  return new Promise((resolve, reject) => {

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {

        const canvas = document.createElement("canvas");

        let width = img.width;
        let height = img.height;

        // Resize if too large
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed."));
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".jpg"),
              { type: "image/jpeg" }
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Invalid image file."));
    };

    reader.onerror = () => reject(new Error("Failed to read the image file."));
  });
};

// ===============================
// Upload Single Image
// ===============================

export const uploadImageToCloudinary = async (file, cloudName, uploadPreset) => {

  try {

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary configuration missing. Please contact the administrator."
      );
    }

    if (!file) {
      throw new Error("No file selected.");
    }

    // Allowed types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Unsupported file format. Please upload JPG, PNG, or WEBP images."
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    let uploadFile = file;

    // Compress large images
    if (file.size > MAX_FILE_SIZE) {
      console.warn("Image larger than 10MB, compressing...");

      uploadFile = await compressImage(file);

      if (uploadFile.size > MAX_FILE_SIZE) {
        throw new Error(
          "Image is too large even after compression. Please upload an image smaller than 10MB."
        );
      }
    }

    const formData = new FormData();

    formData.append("file", uploadFile);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error("Cloudinary Error:", data);

      if (data?.error?.message) {
        throw new Error(data.error.message);
      }

      throw new Error("Image upload failed. Please try again.");
    }

    return {
      url: data.secure_url,
      publicId: data.public_id
    };

  } catch (error) {

    console.error("Upload Error:", error);

    throw new Error(
      error.message ||
      "Something went wrong while uploading the image."
    );
  }
};

// ===============================
// Upload Multiple Images
// ===============================

export const uploadMultipleImages = async (files, cloudName, uploadPreset) => {

  if (!files || files.length === 0) {
    throw new Error("Please select at least one image.");
  }

  const uploadedImages = [];

  for (const file of files) {
    try {

      const result = await uploadImageToCloudinary(
        file,
        cloudName,
        uploadPreset
      );

      uploadedImages.push(result);

    } catch (error) {

      console.error("Failed to upload image:", file.name);

      throw new Error(
        `Failed to upload "${file.name}". ${error.message}`
      );
    }
  }

  return uploadedImages;
};