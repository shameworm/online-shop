const imagePickerElement = document.querySelector("#image-preview input");
const imagePreviewElement = document.querySelector("#image-preview img");

imagePickerElement.addEventListener("change", () => {
  const files = imagePickerElement.files;

  if (!files || files.length === 0) {
    imagePreviewElement.style.display = "none";
    return;
  }

  const pickedFile = files[0];

  imagePreviewElement.src = URL.createObjectURL(pickedFile);
  imagePreviewElement.style.display = "inline";
});
