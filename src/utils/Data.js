const deepMerge = (obj1, obj2) => {
  const output = Object.assign({}, obj1);
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      // Don't merge arrays - just replace them
      if (Array.isArray(obj2[key])) {
        output[key] = obj2[key];
      } else if (typeof obj2[key] === 'object' && obj2[key] !== null && obj1[key] && !Array.isArray(obj1[key])) {
        output[key] = deepMerge(obj1[key], obj2[key]);
      } else {
        output[key] = obj2[key];
      }
    }
  }
  return output;
};
const generateUniqueToken = () => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8); // Random string of length 6

  return `${timestamp}-${randomString}`;
};
export { deepMerge, generateUniqueToken };