import * as React from "react";

type ButtonProps = React.ComponentProps<"button"> & {
  children: React.ReactNode;
};

export const DivButton = ({ children, ...props }: ButtonProps) => {
  return (
    <div className="p-20">
      <button className="bg-blue-500" {...props}>
        {children}
      </button>
    </div>
  );
};
