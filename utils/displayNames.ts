// Helper function to convert image filenames or any option to display names
export const getDisplayName = (option: string): string => {
  // Map of image filenames to display names
  const displayNameMap: Record<string, string> = {
    'red_sox.jpg': 'Red Sox',
    'yankees.jpg': 'Yankees',
    'cat_one.jpeg': 'Mewing Cat',
    'cat_two.jpg': 'Giga Cat',
  };

  // Check if it's a mapped filename
  if (displayNameMap[option]) {
    return displayNameMap[option];
  }

  // If it's an image path (contains .jpg, .jpeg, etc.), try to extract filename
  if (option.includes('.jpg') || option.includes('.jpeg') || option.includes('.png')) {
    const filename = option.split('/').pop() || option;
    if (displayNameMap[filename]) {
      return displayNameMap[filename];
    }
    // Fallback: remove extension and convert underscores to spaces
    return filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').replace(/_/g, ' ');
  }

  // Return as-is for regular text options
  return option;
};
