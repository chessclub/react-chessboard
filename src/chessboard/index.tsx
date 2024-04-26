import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

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

export const Chessboard = forwardRef<ClearPremoves, ChessboardProps>(
  (props, ref) => {
    const { customDndBackend, customDndBackendOptions, ...otherProps } = props;
    const [boardWidth, setBoardWidth] = useState<number>(Number(localStorage.getItem('boardSize')));

    const [boardContainerPos, setBoardContainerPos] = useState({
      left: 0,
      top: 0,
    });

    const boardRef = useRef<HTMLObjectElement>(null);

    useEffect(() => {
      if (props.boardWidth === undefined && boardRef.current?.offsetWidth) {
        const resizeObserver = new ResizeObserver(() => {
          localStorage.setItem('boardSize', `${boardRef.current?.offsetWidth}`);
          setBoardWidth(boardRef.current?.offsetWidth as number);
        });
        resizeObserver.observe(boardRef.current);

        return () => {
          resizeObserver.disconnect();
        };
      }
    }, [boardRef.current]);

    const metrics = useMemo(
      () => boardRef.current?.getBoundingClientRect(),
      [boardRef.current]
    );

    useEffect(() => {
      setBoardContainerPos({
        left: metrics?.left ? metrics?.left : 0,
        top: metrics?.top ? metrics?.top : 0,
      });
    }, [metrics]);

    const backend =
      customDndBackend || ("ontouchstart" in window ? TouchBackend : HTML5Backend);

    return (
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
              <CustomDragLayer boardContainer={boardContainerPos} />
              <Board />
            </ChessboardProvider>
          </DndProvider>
        </div>
      </ErrorBoundary>
    )
  }
);
