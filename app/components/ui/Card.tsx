import React from "react";

type CardProps = {
  title?: string;
  children: React.ReactNode;
};

export default function Card({
  title,
  children,
}: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      {title && (
        <h2 className="text-xl font-bold text-blue-700 mb-4">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}