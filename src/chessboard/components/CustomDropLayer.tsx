import { CSSProperties, useEffect, useState } from "react";
import { useDragDropManager, useDrop } from "react-dnd";

const layerStyles: CSSProperties = {
  position: "fixed",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

export function CustomDropLayer() {
  const [, drop] = useDrop(() => ({
    accept: "piece",
    drop: () => {},
  }));

  return <div style={layerStyles} ref={drop}></div>;
}

export function ConditionalDropLayer() {
  const [isDragging, setIsDragging] = useState(false);

  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();

  useEffect(
    () =>
      monitor.subscribeToStateChange(() => {
        const isDragging = monitor.isDragging();
        setIsDragging(isDragging); // do stuff like setState, though consider directly updating style through refs for performance
      }),
    [monitor]
  );

  return isDragging ? <CustomDropLayer /> : null;
}
