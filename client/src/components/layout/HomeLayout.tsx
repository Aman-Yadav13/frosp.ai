import React from "react";

const HomeLayout = (props: { children?: React.ReactNode }) => {

  return <main className="w-full h-auto">{props.children}</main>;
};

export default HomeLayout;
