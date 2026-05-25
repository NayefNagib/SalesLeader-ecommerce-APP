export const uploadToCloudinary = async (localUri: string): Promise<string | null> => {
  const data = new FormData();
  data.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);

  data.append('upload_preset', 'unsigned_profile_upload'); // your preset name
  data.append('folder', 'ecommerce-profile');

  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/dprgtj9du/image/upload', {
      method: 'POST',
      body: data,
    });

    const result = await res.json();
    return result.secure_url; // <== THIS is the URL
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    return null;
  }
};
