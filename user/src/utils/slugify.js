export const slugify = (text) => {
  return text
    .toString()                 
    .trim()                       
    .toLowerCase()               
    .replace(/\s+/g, "-")         
    .replace(/[^\w\-]+/g, "")     
    .replace(/\-\-+/g, "-");     
};
