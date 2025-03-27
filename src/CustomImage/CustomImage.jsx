import React, { useState } from "react";
import PropTypes from "prop-types";

function CustomImage({
  src,
  alt,
  className,
  fallback: customFallback = "",
  ...props
}) {
  const [fallback, setFallback] = useState("");

  const handleError = () => {
    setFallback(customFallback);
  };

  return (
    <img
      className={className}
      src={fallback || src}
      alt={alt}
      {...props}
      onError={handleError}
    />
  );
}

CustomImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  fallback: PropTypes.string,
};

export default CustomImage;
