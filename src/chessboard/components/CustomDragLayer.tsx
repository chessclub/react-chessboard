import { ReactNode, useEffect } from "react";
import { XYCoord, useDragLayer } from "react-dnd";

import { useChessboard } from "../context/chessboard-context";
import { getBoundPieceCoordinates } from "../functions";
import { CustomPieceFn, Piece, Square } from "../types";

const getItemStyle = (
  clientOffset: XYCoord | null,
  sourceClientOffset: XYCoord | null,
  snapToCursor: boolean,
  allowDragOutsideBoard: boolean,
  pieceSize: number,
  boardOffset: XYCoord,
  boardWidth: number
) => {
  if (!clientOffset || !sourceClientOffset) return { display: "none" };

  let { x, y } = snapToCursor ? clientOffset : sourceClientOffset;
  const halfSquareWidth = pieceSize / 2;

  if (snapToCursor) {
    x -= halfSquareWidth;
    y -= halfSquareWidth;
  }

  if (!allowDragOutsideBoard) {
    [x, y] = getBoundPieceCoordinates(
      { x, y },
      boardOffset,
      boardWidth,
      halfSquareWidth
    );
  }

  const transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
    WebkitTransform: transform,
    touchAction: "none",
  };
};

export function CustomDragLayer() {
  const { boardWidth, chessPieces, id, snapToCursor, allowDragOutsideBoard, boardRef, currentPosition, positionDifferences, clearPremove } =
    useChessboard();

  const collectedProps = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    sourceClientOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));


  const {
    isDragging,
    item,
    clientOffset,
    sourceClientOffset,
  }: {
    item: { piece: Piece; square: Square; id: number };
    clientOffset: XYCoord | null;
    sourceClientOffset: XYCoord | null;
    isDragging: boolean;
  } = collectedProps;

  const boardOffset = {
    x: boardRef.current?.getBoundingClientRect().left || 0,
    y: boardRef.current?.getBoundingClientRect().top || 0,
  };

  const pieceSize = boardWidth / 8;

  const itemStyle = getItemStyle(
    clientOffset,
    sourceClientOffset,
    snapToCursor,
    allowDragOutsideBoard,
    pieceSize,
    boardOffset,
    boardWidth
  );

  const itemRemoved = currentPosition[item?.square] !== item?.piece

  useEffect(() => {
    if (itemRemoved) {
      clearPremove()
    }
  }, [itemRemoved])



  return isDragging && item.id === id && !itemRemoved ? (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 10,
        left: 0,
        top: 0,
      }}
    >
      <div style={itemStyle}>
        {typeof chessPieces[item.piece] === "function" ? (
          (chessPieces[item.piece] as CustomPieceFn)({
            squareWidth: boardWidth / 8,
            isDragging: true,
          })
        ) : (
          <svg
            viewBox={"1 1 43 43"}
            width={boardWidth / 8}
            height={boardWidth / 8}
          >
            <g>{chessPieces[item.piece] as ReactNode}</g>
          </svg>
        )}
      </div>
    </div>
  ) : null;
}