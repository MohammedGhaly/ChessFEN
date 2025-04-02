import * as tf from "@tensorflow/tfjs";
import cv from "@techstark/opencv-js";

async function loadPiecesModel() {
  const modelJson = await fetch("/chess_FEN_model.json").then((res) =>
    res.json()
  );
  const model = await tf.models.modelFromJSON(modelJson);
  // Load weights
  const weightsJson = await fetch("/weights.json").then((res) => res.json());
  const tensors = weightsJson.map((w) => tf.tensor(w));
  // Set weights
  model.setWeights(tensors);
  console.log("pieces Model loaded successfully!");
  return model;
}
async function loadColorModel() {
  const modelJson = await fetch("/chess_color_classifier.json").then((res) =>
    res.json()
  );
  const model = await tf.models.modelFromJSON(modelJson);
  const weightsJson = await fetch("./color_classifier_weights.json").then(
    (res) => res.json()
  );
  const tensors = weightsJson.map((w) => tf.tensor(w));
  model.setWeights(tensors);
  console.log("color Model loaded successfully!");
  return model;
}

export async function getPrediction(squares, canvasRef = null) {
  const classLabels = ["b", ".", "k", "n", "p", "q", "r"];
  const board = [];

  const piecesModel = await loadPiecesModel();
  const colorModel = await loadColorModel();

  for (let row of squares) {
    const fenRow = [];
    for (let square of row) {
      // cv.imshow(canvasRef.current, square);
      // await delay(1000);
      const processedSquare = preprocessImage(square);
      // convert the type of processed square from cv.Mat to tf.Tensor
      const piecePrediction = piecesModel.predict(processedSquare);
      const colorPrediction = colorModel.predict(processedSquare);

      const predictedClassIndex = piecePrediction.argMax(-1).dataSync()[0];
      const pieceName = classLabels[predictedClassIndex];

      const predictedColorIndex = colorPrediction.dataSync()[0];

      const isWhite = predictedColorIndex > 0.5;
      // const color = classLabels[predictedClassIndex];
      if (isWhite && pieceName !== ".") {
        fenRow.push(pieceName.toUpperCase());
      } else {
        fenRow.push(pieceName);
      }
      // Clean up
      processedSquare.dispose();
      piecePrediction.dispose();
    }
    board.push([...fenRow]);
  }
  return board;
}

function preprocessImage(img) {
  const resized = new cv.Mat();
  cv.resize(img, resized, new cv.Size(44, 44)); // Resize to 44x44
  const gray = new cv.Mat();
  cv.cvtColor(resized, gray, cv.COLOR_BGR2GRAY); // Convert to grayscale
  const normalized = new cv.Mat();
  gray.convertTo(normalized, cv.CV_32F, 1.0 / 255.0); // Normalize to [0, 1]
  const inputTensor = tf.tensor4d(normalized.data32F, [1, 44, 44, 1]); // Add batch and channel dimensions

  // Clean up
  resized.delete();
  gray.delete();
  normalized.delete();

  return inputTensor;
}

// export function matVectorToTensor(matVector) {
//   // Assuming matVector contains a batch of images
//   let batchSize = matVector.size();
//   let mat = matVector.get(0); // Extract the first image
//   let height = mat.rows;
//   let width = mat.cols;
//   let channels = mat.channels();
//   // Create a tensor from the entire batch
//   let batchTensor = tf.tidy(() => {
//     let tensors = [];

//     for (let i = 0; i < batchSize; i++) {
//       let imgMat = matVector.get(i);
//       let imgData = new Float32Array(imgMat.data); // Already normalized, so keep float32

//       let tensor = tf
//         .tensor(imgData, [height, width, channels], "float32")
//         .expandDims(0); // Add batch dimension (1, H, W, C)

//       tensors.push(tensor);
//     }

//     return tf.concat(tensors, 0); // Concatenate into batch tensor (B, H, W, C)
//   });

//   return batchTensor;
// }
