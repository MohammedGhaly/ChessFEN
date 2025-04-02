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
      <header className="w-full py-3 text-center text-2xl bg-[var(--bg)]  font-semibold rounded-b-xl">
        <p className="chessFen">ChessFEN</p>
      </header>

      <div className="flex flex-col px-8 lg:px-12 md:flex-row w-screen  ">
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
        <div className="flex-1 flex justify-center h-fit lg:mt-14">
          <div className="options-div flex flex-col justify-center gap-6 items-center my-4 lg:my-0">
            {/* to play */}
            <div className="toPlay-div flex gap-10 items-center justify-center w-full">
              <h3 className="font-semibold text-2xl md:text-4xl my-2">
                to move:
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (toPlay !== "white") setToPlay("white");
                  }}
                  className={`bg-white text-black rounded-full h-12 w-12 text-center text-2xl md:text-4xl md:w-16 md:h-16 font-bold transition-all duration-200 border-4 ${
                    toPlay === "white" ? " border-green-600" : "border-white"
                  }`}
                >
                  W
                </button>

                <button
                  onClick={() => {
                    if (toPlay !== "black") setToPlay("black");
                  }}
                  className={`bg-black text-white rounded-full h-12 w-12 text-center text-2xl md:text-4xl md:w-16 md:h-16 font-bold transition-all duration-200 border-4 ${
                    toPlay === "black" ? "border-green-600" : "border-black"
                  }`}
                >
                  B
                </button>
              </div>
            </div>
            {/* prespective */}
            <div className="prespective-div flex gap-10 items-center justify-center w-full">
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
                      ? " border-green-600"
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
                      ? "border-green-600"
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
            {fen && (
              <div
                className={`flex justify-center flex-col gap-4 items-center my-2 lg:mt-10 mb-4 mx-`}
              >
                <p
                  className={`text-[0.64rem] lg:text-lg font-semibold bg-[var(--box-bg)] p-5 rounded-xl border-2 transition-all duration-300 ${
                    copied ? "border-green-500" : "border-[var(--box-bg)]"
                  }`}
                  ref={fenRef}
                >
                  {fen}
                </p>
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="flex gap-10">
                    <button
                      title="chess.com Analysis"
                      onClick={() => handleRedirect("chesscom")}
                      style={{
                        background:
                          "url(https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/44/56/f5/4456f56e-2e15-075a-152b-1f2475de00d4/AppIcon-1x_U007epad-0-10-0-0-85-220-0.png/246x0w.webp)",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        width: "60px",
                        height: "60px",
                      }}
                      className="w-fit p-4 rounded-xl font-semibold lg:text-xl shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                    ></button>

                    <button
                      title="lichess Analysis"
                      style={{
                        backgroundImage:
                          "url(https://i.pinimg.com/236x/93/b9/2d/93b92d778aa95a38d0d42c5def9f3305.jpg?nii=t)",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        width: "60px",
                        height: "60px",
                      }}
                      onClick={() => handleRedirect("lichess")}
                      className="bg-[var(--lichess-btn)] w-fit p-4 rounded-xl font-semibold lg:text-xl shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                    ></button>
                    <button
                      title="copy"
                      onClick={handleCopy}
                      className="bg-orange-500 flex justify-center items-center w-[60px] h-[60px] rounded-xl font-semibold lg:text-xl shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="35px"
                        height="35px"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-copy-icon lucide-copy"
                      >
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
