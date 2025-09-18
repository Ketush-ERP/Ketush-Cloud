import React from "react";
import { Outlet } from "react-router";

// components

export default function Auth({ children }) {
  return (
    <>
      <main>
        <section className="relative w-full h-full flex items-center justify-center min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-blueGray-800 bg-no-repeat bg-full"
            style={{
              backgroundImage:
                "url(" + require("assets/img/register_bg_2.png").default + ")",
            }}
          ></div>
          <Outlet></Outlet>
        </section>
      </main>
    </>
  );
}
