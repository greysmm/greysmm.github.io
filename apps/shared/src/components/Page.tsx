import { useState } from "react";
import DarkSvg from "../assets/dark.svg";
import LightSvg from "../assets/light.svg";
import MoonSvg from "../assets/moon.svg";
import SunSvg from "../assets/sun.svg";

type Props = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

const locArr: { icon?: any; label?: string; link: string }[] = [
  { label: "Home", link: "https://greysmm.github.io/#" },
  { label: "Projects", link: "https://greysmm.github.io/#/projects" },
  { label: "About", link: "https://greysmm.github.io/#/about" },
];

const NavBar = () => {
  const [darkmode, setDarkmode] = useState<boolean | undefined>();
  const spacing = window.innerWidth < 600 ? "mx-2" : "mx-4";
  if (
    darkmode === undefined &&
    window.localStorage.getItem("theme") === "dark"
  ) {
    setDarkmode(true);
    document.documentElement.setAttribute("data-theme", "dark");
  }
  return (
    <div className="flex p-4 border-theme">
      <a href="https://github.com/greysmm/greysmm.github.io">
        <img
          src={darkmode ? DarkSvg : LightSvg}
          width={270}
          height={75}
          alt="Grey's Magnificent Monorepo"
        />
      </a>
      <div className="flex justify-end w-full">
        {locArr.map((item, index) => (
          <a
            className={spacing + " h-full flex items-center"}
            key={"navitem_" + index}
            href={item.link}
          >
            <div className="">{item.label}</div>
          </a>
        ))}
        <button
          className={spacing + " h-full flex items-center"}
          onClick={() => {
            document.documentElement.setAttribute(
              "data-theme",
              darkmode ? "light" : "dark",
            );
            window.localStorage.setItem("theme", darkmode ? "light" : "dark");
            setDarkmode(!darkmode);
          }}
        >
          <img
            src={darkmode ? MoonSvg : SunSvg}
            width={40}
            height={40}
            style={{ minWidth: "20px" }}
            alt="Theme"
          />
        </button>
      </div>
    </div>
  );
};

export const Page = ({ children, ...props }: Props) => {
  return (
    <div className="p-4 h-full min-h-screen everything">
      <NavBar />
      <div className="p-4 mt-4 text-center border-theme" {...props}>
        {children}
      </div>
    </div>
  );
};
