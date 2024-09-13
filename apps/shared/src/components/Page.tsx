import GmmLogo from "../assets/gmm_logo.svg";

type Props = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

const NavBar = () => {
  const locArr: { icon?: any; label?: string; link: string }[] = [
    { label: "Home", link: "/" },
    { label: "Projects", link: "/projects" },
    { label: "About", link: "/about" },
  ];
  return (
    <div className="flex pl-4 py-4 border border-white">
      <a href="https://github.com/greysmm/greysmm.github.io">
        <img
          src={GmmLogo}
          width={270}
          height={75}
          alt="Grey's Magnificent Monorepo"
        />
      </a>
      <div className="flex justify-end w-full">
        {locArr.map((item, index) => (
          <a className="mr-10 h-full flex items-center" key={"navitem_" + index} href={item.link}>
            <div className="">{item.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

export const Page = ({ children, ...props }: Props) => {
  return (
    <div>
      <NavBar />
      <div className="p-4 text-center" {...props}>
        {children}
      </div>
    </div>
  );
};
