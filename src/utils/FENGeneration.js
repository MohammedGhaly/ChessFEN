import { Chess } from "chess.js";
import { getSquares } from "./cvFunctions";
import { getPrediction } from "./modelsFunctions";

// Convert board to FEN format
function matrixToFen(matrix) {
  return (
    matrix
      .map((row) => {
        let emptyCount = 0;
        let fenRow = "";

        row.forEach((cell) => {
          if (cell === ".") {
            emptyCount++;
          } else {
            if (emptyCount > 0) {
              fenRow += emptyCount;
              emptyCount = 0;
            }
            fenRow += cell;
          }
        });

        if (emptyCount > 0) fenRow += emptyCount;
        return fenRow;
      })
      .join("/") + " w KQkq - 0 1"
  ); // Add standard game metadata
}

export function getFen(matrix, turn) {
  const fenString = matrixToFen(matrix);

  // Create a chess.js Board object
  const chess = new Chess(fenString);

  const fen = chess.fen();
  // return fen;
  const fenParts = fen.split(" ");
  console.log("parts=>  ", fenParts);
  fenParts[1] = turn[0];

  const castelingRights = getCastelingRights(matrix);
  fenParts[2] = castelingRights;

  return fenParts.join(" ");
  // Output: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
}

function getCastelingRights(matrix) {
  let whiteCasteling = "";
  let blackCasteling = "";
  if (matrix[7][4] === "K") {
    if (matrix[7][7] === "R") whiteCasteling += "K";
    if (matrix[7][0] === "R") whiteCasteling += "Q";
  }
  if (matrix[0][4] === "k") {
    if (matrix[0][7] === "r") blackCasteling += "K";
    if (matrix[0][0] === "r") blackCasteling += "Q";
  }

  const combinedCasteling = whiteCasteling + blackCasteling;

  if (combinedCasteling !== "") return combinedCasteling;
  return "-";
}

export async function imgToFen(img, prespective, turn) {
  const squares = getSquares(img);
  // console.log("squares=> ", squares);
  let whitePrespectiveBoard = await getPrediction(squares);
  console.log("whitePrespectiveBoard=> ", whitePrespectiveBoard);
  let predictedBoard = [];
  whitePrespectiveBoard.map((row) => predictedBoard.push(row.slice()));

  if (prespective === "black") {
    predictedBoard = predictedBoard.reverse();
    predictedBoard.map((l) => l.reverse());
    console.log("predictedBoard=> ", predictedBoard);
  }

  const fen = getFen(predictedBoard, turn);
  return fen;
}
