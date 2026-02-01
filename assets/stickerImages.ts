// Map image paths to actual require() calls for React Native
// This is needed because require() cannot use dynamic paths in React Native

export const stickerImages: Record<string, any> = {
  'cat_one.jpeg': require('./images/events/cat_one.jpeg'),
  'cat_two.jpg': require('./images/events/cat_two.jpg'),
};

// Helper function to get image source from path string
export const getImageSource = (path: string) => {
  const filename = path.split('/').pop();
  return filename ? stickerImages[filename] : null;
};

// Helper function to check if the string is an image path
export const isImagePath = (str: string): boolean => {
  return str.includes('.jpg') || str.includes('.jpeg') || str.includes('.png') || str.includes('.gif') || str.includes('.webp');
};
