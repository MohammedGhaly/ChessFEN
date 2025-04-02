import { useRef } from "react";
import cv from "@techstark/opencv-js";
import { contoursCropping, getSquares } from "../utils/cvFunctions";
import { getPrediction } from "../utils/modelsFunctions";
import { getFen } from "../utils/FENGeneration";

function TestImageProcessor() {
  // const [processedImage, setProcessedImage] = useState(null);
  const canvasRef = useRef(null);
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

        // Process the image using cropBoard2
        const resized = contoursCropping(src);
        // Display the processed image on the webpage
        cv.imshow(canvasRef.current, resized);

        const squares = getSquares(resized);
        const predictedBoard = await getPrediction(squares, canvasRef);
        console.log("predictoin:\n", predictedBoard);
        const fen = getFen(predictedBoard);
        console.log(fen);

        // Clean up
        src.delete();
        resized.delete();
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
      <div className="flex flex-col justify-center ">
        {/* <button className="p-4 rounded-3xl text-3xl bg-blue-400 text-white border-2 transition-all duration-300 hover:scale-105 hover:">
          how to use
        </button> */}
        <canvas
          ref={canvasRef}
          style={{ maxWidth: "100%", height: "auto" }}
        ></canvas>
        <button
          onClick={handleUploadButtonClick}
          className="p-4 rounded-3xl text-3xl bg-red-500 text-white border-2 transition-all duration-300 hover:scale-105 hover:"
        >
          Upload chess board
        </button>
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

export default TestImageProcessor;
