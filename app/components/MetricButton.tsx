import React from 'react';
import { MetricButtonProps } from '../types';

export const MetricButton: React.FC<MetricButtonProps> = ({ label, value, selected, onClick }) => {
  return (
    <div
      className={`btn btn-responsive flex flex-col items-center justify-center p-1 xs:p-1 sm:p-2 ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="text-[10px] xs:text-xs sm:text-sm font-semibold text-center">{label}</div>
      <div className="text-[10px] xs:text-xs sm:text-sm text-center">{value}</div>
    </div>
  );
};
