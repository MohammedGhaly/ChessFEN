/* eslint-disable react/prop-types */
import { useRef } from "react";
import cv from "@techstark/opencv-js";
import boardPlaceHolder from "../../public/board_placeholder.png";

function ImageProcessor({
  viewedBoard,
  isBoardLoaded,
  setIsBoardLoaded,
  setBoard,
  canvasRef,
  setCropOption,
  cropOption,
}) {
  const imageInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        // Create a canvas to draw the uploaded image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Get image data from the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Create an OpenCV Mat object from the image data
        const src = new cv.Mat(imageData.height, imageData.width, cv.CV_8UC4);
        src.data.set(imageData.data);
        setBoard(src);
        setIsBoardLoaded(true);
        return;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadButtonClick = () => {
    imageInputRef.current?.click();
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div className="flex flex-col justify-center items-center gap-4">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "auto" }}
          className={!isBoardLoaded ? "hidden" : ""}
        ></canvas>

        <img
          src={boardPlaceHolder}
          className={`w-[400px] ${isBoardLoaded ? "hidden" : ""}`}
        />

        <div className="flex justify-center gap-4 w-full">
          <button
            onClick={handleUploadButtonClick}
            className="p-4 rounded-xl text-xl bg-red-500 text-white shadow-xl font-semibold transition-all duration-300 hover:scale-105 "
          >
            Upload
          </button>
          {/* crop button */}
          <button
            className={`border-4 bg-green-500  ${
              viewedBoard
                ? cropOption
                  ? "border-orange-500"
                  : "border-green-500"
                : "border-gray-400"
            } font-semibold px-4 py-3 text-xl rounded-xl transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed`}
            onClick={() => setCropOption((corp) => !corp)}
            disabled={viewedBoard === null}
          >
            Crop
          </button>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default ImageProcessor;
