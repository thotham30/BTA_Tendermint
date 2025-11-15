// src/components/QuorumCertificateViewer.jsx
import React, { useState } from "react";
import "../styles/QuorumCertificateViewer.css";

/**
 * QuorumCertificateViewer component displays a Quorum Certificate (QC)
 * with all its fields including block height, round, stage, block hash,
 * and the list of signatures from validators.
 */
export default function QuorumCertificateViewer({
  qc,
  stage,
  compact = false,
}) {
  const [expanded, setExpanded] = useState(false);

  if (!qc) {
    return (
      <div className="qc-viewer qc-empty">
        <p className="qc-no-data">
          {stage
            ? `No ${stage} QC generated`
            : "No QC available"}
        </p>
      </div>
    );
  }

  const toggleExpanded = () => setExpanded(!expanded);

  if (compact) {
    return (
      <div className="qc-viewer qc-compact">
        <div className="qc-badge" onClick={toggleExpanded}>
          <span className={`qc-stage-badge ${qc.stage}`}>
            {qc.stage.toUpperCase()} QC
          </span>
          <span className="qc-signature-count">
            {qc.signatureCount}/{qc.totalValidators}
          </span>
          <span
            className={`qc-threshold-badge ${
              qc.thresholdMet ? "met" : "not-met"
            }`}
          >
            {qc.thresholdMet ? "✓" : "✗"}
          </span>
        </div>
        {expanded && (
          <div className="qc-details-popup">
            <div className="qc-details-content">
              <h4>Quorum Certificate Details</h4>
              <QuorumCertificateDetails qc={qc} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="qc-viewer">
      <div className="qc-header">
        <h4>
          Quorum Certificate - {qc.stage.toUpperCase()}
          {qc.thresholdMet && (
            <span className="qc-verified-badge">✓ VERIFIED</span>
          )}
        </h4>
        <button
          className="qc-toggle-btn"
          onClick={toggleExpanded}
        >
          {expanded ? "▼ Collapse" : "▶ Expand"}
        </button>
      </div>

      <div className="qc-summary">
        <div className="qc-field">
          <span className="qc-label">Block Height:</span>
          <span className="qc-value">{qc.height}</span>
        </div>
        <div className="qc-field">
          <span className="qc-label">Round:</span>
          <span className="qc-value">{qc.round}</span>
        </div>
        <div className="qc-field">
          <span className="qc-label">Stage:</span>
          <span className={`qc-value qc-stage ${qc.stage}`}>
            {qc.stage}
          </span>
        </div>
        <div className="qc-field">
          <span className="qc-label">Block Hash:</span>
          <span className="qc-value qc-hash">
            {qc.blockHash}
          </span>
        </div>
        <div className="qc-field">
          <span className="qc-label">Proposer:</span>
          <span className="qc-value">Node {qc.proposer}</span>
        </div>
        <div className="qc-field">
          <span className="qc-label">Signatures:</span>
          <span className="qc-value qc-signatures-count">
            {qc.signatureCount}/{qc.totalValidators}
          </span>
        </div>
        <div className="qc-field">
          <span className="qc-label">Threshold:</span>
          <span
            className={`qc-value qc-threshold ${
              qc.thresholdMet ? "met" : "not-met"
            }`}
          >
            {qc.thresholdMet ? "✓ Met" : "✗ Not Met"} (
            {(qc.threshold * 100).toFixed(1)}%)
          </span>
        </div>
        <div className="qc-field">
          <span className="qc-label">Created:</span>
          <span className="qc-value">
            {new Date(qc.createdAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="qc-signatures">
          <h5>Validator Signatures ({qc.signatures.length}):</h5>
          <div className="qc-signatures-table">
            <div className="qc-signatures-header">
              <span className="qc-sig-col-node">Node ID</span>
              <span className="qc-sig-col-vote">Vote</span>
              <span className="qc-sig-col-signature">
                Signature
              </span>
              <span className="qc-sig-col-time">Timestamp</span>
            </div>
            {qc.signatures.map((sig, idx) => (
              <div key={idx} className="qc-signature-entry">
                <span className="qc-sig-col-node">
                  <span className="qc-node-badge">
                    Node {sig.nodeId}
                  </span>
                </span>
                <span className="qc-sig-col-vote">
                  <span
                    className={`qc-vote-badge ${
                      sig.vote ? "yes" : "no"
                    }`}
                  >
                    {sig.vote ? "✓ YES" : "✗ NO"}
                  </span>
                </span>
                <span className="qc-sig-col-signature qc-sig-value">
                  {sig.signature}
                </span>
                <span className="qc-sig-col-time">
                  {new Date(sig.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {qc.blockReference && expanded && (
        <div className="qc-block-reference">
          <h5>Block Reference:</h5>
          <div className="qc-block-info">
            <span>
              <strong>Height:</strong> {qc.blockReference.height}
            </span>
            <span>
              <strong>Hash:</strong> {qc.blockReference.hash}
            </span>
            <span>
              <strong>Proposer:</strong> Node{" "}
              {qc.blockReference.proposer}
            </span>
            <span>
              <strong>Transactions:</strong>{" "}
              {qc.blockReference.txCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Detailed QC view for popups/modals
 */
function QuorumCertificateDetails({ qc }) {
  return (
    <div className="qc-details">
      <div className="qc-detail-grid">
        <div className="qc-detail-item">
          <span className="qc-detail-label">Height:</span>
          <span className="qc-detail-value">{qc.height}</span>
        </div>
        <div className="qc-detail-item">
          <span className="qc-detail-label">Round:</span>
          <span className="qc-detail-value">{qc.round}</span>
        </div>
        <div className="qc-detail-item">
          <span className="qc-detail-label">Stage:</span>
          <span
            className={`qc-detail-value qc-stage ${qc.stage}`}
          >
            {qc.stage}
          </span>
        </div>
        <div className="qc-detail-item">
          <span className="qc-detail-label">Block Hash:</span>
          <span className="qc-detail-value qc-hash">
            {qc.blockHash}
          </span>
        </div>
        <div className="qc-detail-item">
          <span className="qc-detail-label">Signatures:</span>
          <span className="qc-detail-value">
            {qc.signatureCount}/{qc.totalValidators}
          </span>
        </div>
        <div className="qc-detail-item">
          <span className="qc-detail-label">Threshold:</span>
          <span
            className={`qc-detail-value ${
              qc.thresholdMet
                ? "qc-threshold-met"
                : "qc-threshold-not-met"
            }`}
          >
            {qc.thresholdMet ? "✓ Met" : "✗ Not Met"}
          </span>
        </div>
      </div>
      <div className="qc-signatures-list">
        <h5>Signatures:</h5>
        {qc.signatures.map((sig, idx) => (
          <div key={idx} className="qc-sig-item">
            <strong>Node {sig.nodeId}:</strong> {sig.signature}
          </div>
        ))}
      </div>
    </div>
  );
}
