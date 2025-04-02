import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faCircleCheck,
  faCircleXmark,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "./Modal.module.scss";

const cx = classNames.bind(styles);

const Modal = ({ desc, note, onClose, type = "success" }) => {
  return (
    <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
      <div className={cx("modal_content")} onClick={(e) => e.stopPropagation()}>
        <button className={cx("icon_close")} onClick={onClose}>
          <FontAwesomeIcon icon={faClose} />
        </button>
        <div className={cx("modal_header")}>
          <FontAwesomeIcon
            className={cx("check_circle", {
              error: type === "error",
              warning: type === "warning",
            })}
            icon={
              type === "error"
                ? faCircleXmark
                : type === "warning"
                ? faExclamationCircle // Icon warning
                : faCircleCheck
            }
          />
        </div>
        <div className={cx("modal_body")}>
          <p className={cx("modal_desc")}>{desc}</p>
          <p className={cx("modal_note")}>{note}</p>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  desc: PropTypes.string.isRequired,
  note: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["success", "error", "warning"]),
};

export default Modal;
