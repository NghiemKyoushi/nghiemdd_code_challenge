import React from 'react';

export default function AnimatedBackground(): React.JSX.Element {
  return (
    <div className="bg-animation-container">
      <div className="bg-custom-blob bg-blob-1" />
      <div className="bg-custom-blob bg-blob-2" />
      <div className="bg-custom-particle bg-part-1" />
      <div className="bg-custom-particle bg-part-2" />
      <div className="bg-custom-particle bg-part-3" />
      <div className="bg-custom-particle bg-part-4" />
      <div className="bg-custom-particle bg-part-5" />
    </div>
  );
}