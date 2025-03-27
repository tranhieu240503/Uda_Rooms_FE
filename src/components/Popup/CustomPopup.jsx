import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import HousePopupDetail from "./HousePopupDetail"; // Component popup

const CustomPopup = ({ house, onCoordinatesr, onShowRouting }) => {
  const popupRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (popupRef.current) {
      if (!rootRef.current) {
        rootRef.current = ReactDOM.createRoot(popupRef.current);
      }
      rootRef.current.render(<HousePopupDetail house={house} onCoordinatesr={onCoordinatesr} onShowRouting={onShowRouting} />);
    }
  }, [house]);
  return <div ref={popupRef} />;
};

export default CustomPopup;
