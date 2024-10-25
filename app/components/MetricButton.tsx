import React from 'react';

interface MetricButtonProps {
  label: string;
  value: string | number;
}

export const MetricButton: React.FC<MetricButtonProps & { selected: boolean; onClick: () => void }> = ({ label, value, selected, onClick }) => {
  return (
    <div
      className={`btn-primary dark:btn-secondary border border-primary-light dark:border-primary-dark flex flex-col items-center justify-center text-white p-2 shadow-md ${selected ? 'selected opacity-50' : ''}`}
      onClick={onClick}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
};
