import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ReduxState } from "reducers";
import { useSelector } from "react-redux";

export const GameEditor = () => {
  const singlePlayer = useSelector((state: ReduxState) => state.singlePlayer);
  return (
    <>
      <a className="btn btn-light btn-lg btn-block">Custom</a>
      <div className="modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Modal title</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Modal body text goes here.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
