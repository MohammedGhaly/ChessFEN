import cv from "@techstark/opencv-js";
// import * as ort from "onnxruntime-web";

const img_size = 400;
const cell_size = img_size / 8;

export function cropBoard2(img) {
  const gray = new cv.Mat();
  const thresholded = new cv.Mat();
  // const binThresholded = new cv.Mat();

  cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY);
  const lap = getLaplacian(gray);
  //   return lap;
  gray.delete();
  cv.threshold(lap, thresholded, 40, 255, cv.THRESH_BINARY);
  // cv.threshold(thresholded, binThresholded, 35, 255, cv.THRESH_BINARY);

  lap.delete();
  // return binThresholded;
  const threshArr = matTo2DArray(thresholded);
  // downloadJsonFile("jsonTest3", imgArr);
  // return;

  let firstWhietP = [0, 0];
  let lastWhietP = [thresholded.cols - 1, thresholded.rows - 1];

  console.log("thresholded rows=> ", thresholded.rows);
  console.log("thresholded cols=> ", thresholded.cols);

  console.log("img rows=> ", img.rows);
  console.log("img cols=> ", img.cols);

  // Find the first white pixel
  outerLoop1: for (let j = 0; j < threshArr.length; j++) {
    for (let i = 0; i < threshArr[0].length; i++) {
      const pixel = threshArr[j][i];
      if (pixel > 0) {
        firstWhietP = [j, i];
        break outerLoop1;
      }
    }
  }
  // Find the last white pixel
  outerLoop2: for (let j = threshArr.length - 1; j >= 0; j--) {
    for (let i = threshArr[0].length - 1; i >= 0; i--) {
      const pixel = threshArr[j][i];
      if (pixel > 0) {
        lastWhietP = [j, i];
        break outerLoop2;
      }
    }
  }

  // old right code :
  // outerLoop1: for (let j = 0; j < thresholded.rows; j++) {
  //   for (let i = 0; i < thresholded.cols; i++) {
  //     const pixel = thresholded.ucharPtr(j, i)[0];
  //     if (pixel > 0) {
  //       firstWhietP = [j, i];
  //       break outerLoop1;
  //     }
  //   }
  // }
  // // Find the last white pixel
  // outerLoop2: for (let j = thresholded.rows - 1; j >= 0; j--) {
  //   for (let i = thresholded.cols - 1; i >= 0; i--) {
  //     const pixel = thresholded.ucharPtr(j, i)[0];
  //     if (pixel > 0) {
  //       lastWhietP = [j, i];
  //       break outerLoop2;
  //     }
  //   }
  // }

  // console.log(
  //   "pixel value of correct firstWhitep => ",
  //   thresholded.ucharPtr(33, 7)[0]
  // );

  console.log("first white pixel=> ", firstWhietP);
  console.log("last white pixel=> ", lastWhietP);

  // firstWhietP = [20, 5];

  const rect = new cv.Rect(
    firstWhietP[1],
    firstWhietP[0],
    lastWhietP[1] - firstWhietP[1],
    lastWhietP[0] - firstWhietP[0]
  );

  // Crop the image
  const cropped = img.roi(rect);

  // Resize the cropped image
  const resized = new cv.Mat();
  const imgSize = new cv.Size(img_size, img_size);
  cv.resize(cropped, resized, imgSize, 0, 0, cv.INTER_CUBIC);

  // Display or use the resized image
  //   cv.imshow(canvasRef.current, resized);

  // Clean up
  cropped.delete();
  return resized;
}

export function contoursCropping(img, img_size = 400) {
  const gray = new cv.Mat();
  const thresholded = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  // Convert to grayscale
  cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY);

  // Apply binary threshold (inverted)
  cv.threshold(gray, thresholded, 80, 255, cv.THRESH_BINARY);

  // return thresholded;
  // Find contours
  cv.findContours(
    thresholded,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  // Sort contours by area (descending)
  let sortedContours = [];
  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);
    sortedContours.push({ contour, area });
  }
  sortedContours.sort((a, b) => b.area - a.area);

  // Get the largest contour
  const boardContour = sortedContours[0].contour;

  // Get bounding rectangle
  const boardRect = cv.boundingRect(boardContour);

  // Crop the image
  const cropped = img.roi(boardRect);

  // Resize the cropped image
  const resized = new cv.Mat();
  const imgSize = new cv.Size(img_size, img_size);
  cv.resize(cropped, resized, imgSize, 0, 0, cv.INTER_CUBIC);

  // Clean up
  gray.delete();
  thresholded.delete();
  contours.delete();
  hierarchy.delete();
  cropped.delete();

  return resized;
}

export function resizeBoard(board) {
  const resized = new cv.Mat();
  const imgSize = new cv.Size(400, 400);
  cv.resize(board, resized, imgSize, 0, 0, cv.INTER_CUBIC);
  return resized;
}

export function getLaplacian(img) {
  const blurred = new cv.Mat();
  const laplacian = new cv.Mat();
  const lap = new cv.Mat();

  cv.GaussianBlur(img, blurred, new cv.Size(3, 3), 0);
  cv.Laplacian(blurred, laplacian, cv.CV_64F, 3);
  cv.convertScaleAbs(laplacian, lap);

  blurred.delete();
  laplacian.delete();

  return lap;
}

export function getSquares(img) {
  const squares = [];

  for (let i = 0; i < img_size; i += cell_size) {
    // Rows
    const row = [];
    for (let j = 0; j < img_size; j += cell_size) {
      // Columns
      // Extract each 50x50 region
      const rect = new cv.Rect(j, i, cell_size, cell_size);
      const cell = img.roi(rect);

      // Further crop the cell to 44x44 (removing 3 pixels from each side)
      const innerRect = new cv.Rect(3, 3, 44, 44);
      const innerCell = cell.roi(innerRect);

      // Clone the cell to avoid memory issues
      const clonedCell = innerCell.clone();

      // Add the cell to the row
      row.push(clonedCell);

      // Clean up
      cell.delete();
      innerCell.delete();
    }
    squares.push(row);
  }

  return squares;
}

function matTo2DArray(mat) {
  const rows = mat.rows;
  const cols = mat.cols;
  const data = mat.data; // For 8-bit integer data
  // const data = mat.data32F; // For 32-bit floating-point data

  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const index = i * cols + j; // Calculate the index in the flat array
      row.push(data[index]); // Add the pixel value to the row
    }
    matrix.push(row);
  }

  return matrix;
}

// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// function downloadJsonFile(filename, data) {
//   const blob = new Blob([JSON.stringify(data, null, 2)], {
//     type: "application/json",
//   });
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = filename;
//   link.click();
// }
