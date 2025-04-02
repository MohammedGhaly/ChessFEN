import cv from "@techstark/opencv-js";
import { useEffect, useRef, useState } from "react";
import ImageProcessor from "./components/ImageProcessor";
import { contoursCropping, resizeBoard } from "./utils/cvFunctions";

import "./App.css";
import { imgToFen } from "./utils/FENGeneration";
import Spinner from "./components/Spinner";

function App() {
  const [fen, setFen] = useState("");
  // options form states
  const [toPlay, setToPlay] = useState("white");
  const [prespective, setPrespective] = useState("white");
  const [cropOption, setCropOption] = useState(true);
  // image Processor states
  const [isBoardLoaded, setIsBoardLoaded] = useState(false);
  const [board, setBoard] = useState(null);
  const [croppedBoard, setCroppedBoard] = useState(null);
  const fenRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef();

  useEffect(
    function () {
      if (!board) return;

      setCroppedBoard(contoursCropping(board));
    },
    [board, cropOption]
  );
  useEffect(
    function () {
      if (!board) return;
      if (cropOption && croppedBoard) {
        cv.imshow(canvasRef.current, croppedBoard);
      } else if (!cropOption && board) {
        const resizedBoard = resizeBoard(board);
        cv.imshow(canvasRef.current, resizedBoard);
      }
    },
    [cropOption, croppedBoard, board]
  );

  const handleSubmit = async (e) => {
    // e.stopPropagation();
    setLoading(true);
    e.preventDefault();
    if (!board) return;

    let fen = "";
    if (cropOption) {
      if (!croppedBoard) return;
      fen = await imgToFen(croppedBoard, prespective, toPlay);
    } else {
      fen = await imgToFen(board, prespective, toPlay);
    }
    setFen(fen);
    setLoading(false);
  };

  const handleCopy = async () => {
    console.log("fen current");
    if (fenRef.current) {
      try {
        await navigator.clipboard.writeText(fenRef.current.innerText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1100); // Reset after 2s
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handleRedirect = (site) => {
    const chessComEncodedFen = encodeURIComponent(fen);
    const lichessEncodedFen = fen.replace(" ", "_");
    const url =
      site === "chesscom"
        ? `https://www.chess.com/analysis?fen=${chessComEncodedFen}`
        : `https://lichess.org/analysis/standard/${lichessEncodedFen}`;

    window.open(url, "_blank"); // Opens in a new tab
  };

  return (
    <div className="App flex flex-col justify-center items-center">
      <header className="w-full py-6 text-center text-4xl bg-[var(--bg)]  font-semibold rounded-b-xl">
        <p className="chessFen">ChessFEN</p>
      </header>

      <div className="flex flex-col px-12 md:flex-row w-screen items-center ">
        <ImageProcessor
          isBoardLoaded={isBoardLoaded}
          setIsBoardLoaded={setIsBoardLoaded}
          setBoard={setBoard}
          canvasRef={canvasRef}
          cropOption={cropOption}
          setCropOption={setCropOption}
          viewedBoard={cropOption ? croppedBoard : board}
        />

        {/* options */}
        <div className="flex-1 flex justify-center">
          <div className="options-div flex flex-col justify-center gap-6 items-center max-w-1/2">
            {/* to play */}
            <div className="toPlay-div flex gap-10 items-center justify-between w-full">
              <h3 className="font-semibold text-2xl md:text-4xl my-2">
                to play:
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (toPlay !== "white") setToPlay("white");
                  }}
                  className={`bg-white text-black rounded-full h-12 w-12 text-center text-2xl md:text-4xl md:w-16 md:h-16 font-bold transition-all duration-200 border-4 ${
                    toPlay === "white" ? " border-orange-500" : "border-white"
                  }`}
                >
                  W
                </button>

                <button
                  onClick={() => {
                    if (toPlay !== "black") setToPlay("black");
                  }}
                  className={`bg-black text-white rounded-full h-12 w-12 text-center text-2xl md:text-4xl md:w-16 md:h-16 font-bold transition-all duration-200 border-4 ${
                    toPlay === "black" ? "border-orange-500" : "border-black"
                  }`}
                >
                  B
                </button>
              </div>
            </div>
            {/* prespective */}
            <div className="prespective-div flex gap-10 items-center justify-between w-full">
              <h3 className="font-semibold text-2xl md:text-4xl my-2">
                prespective:
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (prespective !== "white") setPrespective("white");
                  }}
                  className={`bg-white text-black rounded-full h-12 w-12 text-center text-2xl md:text-4xl md:w-16 md:h-16 font-bold transition-all duration-200 border-4 ${
                    prespective === "white"
                      ? " border-orange-500"
                      : "border-white"
                  }`}
                >
                  W
                </button>

                <button
                  onClick={() => {
                    if (prespective !== "black") setPrespective("black");
                  }}
                  className={`bg-black text-white rounded-full h-12 w-12 text-center text-2xl md:text-4xl md:w-16 md:h-16 font-bold transition-all duration-200 border-4 ${
                    prespective === "black"
                      ? "border-orange-500"
                      : "border-black"
                  }`}
                >
                  B
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className={`bg-cyan-500 min-w-36 font-semibold px-4 py-3 text-xl rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center`}
              disabled={board === null}
            >
              {loading ? <Spinner /> : "get FEN"}
            </button>
          </div>
        </div>
      </div>

      {fen && (
        <div
          className={`flex justify-center flex-col gap-4 items-center mt-6 lg:mt-0 mb-4`}
        >
          <p
            className={`text-[0.64rem] lg:text-2xl font-semibold bg-[var(--box-bg)] p-5 rounded-xl border-2 transition-all duration-300 ${
              copied ? "border-green-500" : "border-[var(--box-bg)]"
            }`}
            ref={fenRef}
          >
            {fen}
          </p>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex gap-4">
              <button
                onClick={() => handleRedirect("chesscom")}
                className="bg-[var(--chessdotcom-btn)] w-fit p-4 rounded-xl font-semibold lg:text-xl shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                Chess.com Analysis
              </button>
              <button
                onClick={() => handleRedirect("lichess")}
                className="bg-[var(--lichess-btn)] w-fit p-4 rounded-xl font-semibold lg:text-xl shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                Lichess Analysis
              </button>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleCopy}
                className="bg-orange-500 min-w-44 p-4 rounded-xl font-semibold lg:text-xl shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
