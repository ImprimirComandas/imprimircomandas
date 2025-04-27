
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center py-2">
      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
}
