import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import styles from "./ConfirmModal.module.scss";

const cx = classNames.bind(styles);

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className={cx("modal-overlay")} onClick={onCancel}>
      <div className={cx("modal-content")} onClick={(e) => e.stopPropagation()}>
        <h3 className={cx("modal-title")}>{title}</h3>
        <p className={cx("modal-message")}>{message}</p>
        <div className={cx("modal-actions")}>
          <button className={cx("btn", "btn-cancel")} onClick={onCancel}>
            Hủy
          </button>
          <button className={cx("btn", "btn-confirm")} onClick={onConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmModal;
