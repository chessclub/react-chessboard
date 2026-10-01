import { BackendFactory, Identifier } from "dnd-core";
import { forwardRef, useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend, TouchBackendImpl } from "react-dnd-touch-backend";

import { Board } from "./components/Board";
import { CustomDragLayer } from "./components/CustomDragLayer";
import { ConditionalDropLayer } from "./components/CustomDropLayer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ChessboardProvider } from "./context/chessboard-context";
import { ChessboardProps } from "./types";

// spare pieces component
// semantic release with github actions
// improved arrows

// npm publish --tag alpha
// npm publish --dry-run

// rewrite readme, add link to react-chessboard-svg for simply showing a chess position
// add other things from chessground
// change board orientation to 'w' or 'b'? like used in chess.js?
// Animation on premove? - only set manual drop to false in useEffect if not attempting successful premove

export type ClearPremoves = {
  clearPremoves: (clearLastPieceColour?: boolean) => void;
};

// The touch backend keeps touchstart source ids until the first touchmove; if
// that piece unmounted meanwhile (another finger's move still reaches the
// document), beginDrag throws "Expected sourceIds to be registered".
const GuardedTouchBackend: BackendFactory = (manager, context, options) => {
  const backend = TouchBackend(manager, context, options) as TouchBackendImpl;
  const handleTopMove = backend.handleTopMove;
  backend.handleTopMove = (e) => {
    const state = backend as unknown as { moveStartSourceIds?: Identifier[] };
    state.moveStartSourceIds = state.moveStartSourceIds?.filter((id) =>
      manager.getRegistry().getSource(id)
    );
    handleTopMove(e);
  };
  return backend;
};

export const Chessboard = forwardRef<ClearPremoves, ChessboardProps>(
  (props, ref) => {
    const { customDndBackend, customDndBackendOptions, ...otherProps } = props;
    const [boardWidth, setBoardWidth] = useState<number>(() => {
      try {
        return Number(localStorage.getItem("boardSize"));
      } catch {
        return 0;
      }
    });

    const boardRef = useRef<HTMLObjectElement>(null);

    useEffect(() => {
      if (props.boardWidth === undefined && boardRef.current?.offsetWidth) {
        const update = () => {
          try {
            localStorage.setItem(
              "boardSize",
              `${boardRef.current?.offsetWidth}`,
            );
          } catch {}
          setBoardWidth(boardRef.current?.offsetWidth as number);
        };
        // Some hardened WebKit profiles lack ResizeObserver: size once now, then follow window resizes.
        if (typeof ResizeObserver === "undefined") {
          update();
          window.addEventListener("resize", update);
          return () => window.removeEventListener("resize", update);
        }
        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(boardRef.current);

        return () => {
          resizeObserver.disconnect();
        };
      }
    }, [boardRef.current]);

    const backend =
      customDndBackend || ("ontouchstart" in window ? GuardedTouchBackend : HTML5Backend);

    return  (
      <ErrorBoundary>
        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <div ref={boardRef} style={{ width: "100%" }} />
          <DndProvider
            backend={backend}
            context={window}
            options={customDndBackend ? customDndBackendOptions : undefined}
          >
              <ChessboardProvider
                boardWidth={boardWidth}
                {...otherProps}
                ref={ref}
              >
                <ConditionalDropLayer />
                <CustomDragLayer />
                <Board />
              </ChessboardProvider>
          </DndProvider>
        </div>
      </ErrorBoundary>
    ) 
  }
);
