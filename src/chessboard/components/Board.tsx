import { useEffect } from "react";
import { useChessboard } from "../context/chessboard-context";
import { Arrows } from "./Arrows";
import { WhiteKing } from "./ErrorBoundary";
import { PromotionDialog } from "./PromotionDialog";
import { Squares } from "./Squares";

export function Board() {
  const {
    boardWidth,
    clearCurrentRightClickDown,
    onPromotionPieceSelect,
    setShowPromoteDialog,
    showPromoteDialog,
    customBoardStyle,
    boardRef,
  } = useChessboard();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        boardRef.current &&
        !boardRef.current.contains(event.target as Node)
      ) {
        clearCurrentRightClickDown();
      }
    }

    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, []);

  return boardWidth ? (
    <div style={{ perspective: "1000px" }}>
      <div
        ref={boardRef}
        style={{
          position: "relative",
          ...boardStyles(boardWidth),
          ...customBoardStyle,
        }}
      >
        <Squares />
        <Arrows />

        {showPromoteDialog && (
          <>
            <div
              onClick={() => {
                setShowPromoteDialog(false);
                onPromotionPieceSelect?.();
              }}
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                zIndex: "100",
                backgroundColor: "rgba(22,21,18,.7)",
                width: boardWidth,
                height: boardWidth,
              }}
            />
            <PromotionDialog />
          </>
        )}
      </div>
    </div>
  ) : (
    <WhiteKing />
  );
}

const boardStyles = (width: number) => ({
  cursor: "default",
  height: width,
  width,
});
